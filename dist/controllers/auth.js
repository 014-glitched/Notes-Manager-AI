"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../config/prisma"));
const token_1 = require("../utils/token");
const refresh_1 = require("../utils/refresh");
const auth_1 = require("../schemas/auth");
const BCRYPT_SALT_ROUNDS = 12;
async function register(req, res) {
    try {
        // console.log("📦 Request body:", JSON.stringify(req.body))
        const parsed = auth_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                error: "Invalid request",
                details: zod_1.z.flattenError(parsed.error)
            });
        }
        const { name, email, password } = parsed.data;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(409).json({ error: "Email is already in use" });
        }
        const hashed = await bcrypt_1.default.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await prisma_1.default.user.create({
            data: { name, email, password: hashed },
        });
        console.log("User created:", user.id);
        const accessToken = (0, token_1.signAccessToken)(user.id);
        const refreshToken = (0, refresh_1.generateRefreshTokenPlain)();
        const tokenHash = (0, refresh_1.hashToken256)(refreshToken);
        const refreshTokenExpire = (0, refresh_1.refreshExpiresAt)();
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: tokenHash,
                userId: user.id,
                expiresAt: refreshTokenExpire,
                revoked: false
            }
        });
        return res.status(201).json({
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Registration failed" });
    }
}
async function login(req, res) {
    try {
        const parsed = auth_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res
                .status(400)
                .json({ error: "Invalid request" });
        }
        const { email, password } = parsed.data;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const passwordMatch = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const accessToken = (0, token_1.signAccessToken)(user.id);
        const refreshToken = (0, refresh_1.generateRefreshTokenPlain)();
        const tokenHash = (0, refresh_1.hashToken256)(refreshToken);
        const tokenExpiresAt = (0, refresh_1.refreshExpiresAt)();
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt: tokenExpiresAt,
                revoked: false
            }
        });
        return res.json({
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function refreshToken(req, res) {
    try {
        console.log(" Refresh token endpoint hit");
        const { refreshToken } = req.body;
        console.log(" Received refresh token:", refreshToken);
        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token is required" });
        }
        const tokenHash = (0, refresh_1.hashToken256)(refreshToken);
        console.log(" Looking for token hash in database...");
        // tokenHash is unique in the schema; use findUnique by the unique field then
        // verify revoked/expiry conditions in application logic.
        const storedToken = await prisma_1.default.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });
        if (!storedToken) {
            console.log(" Refresh token not found");
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }
        if (storedToken.revoked) {
            console.log(" Refresh token has been revoked for user:", storedToken.user.email);
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }
        if (storedToken.expiresAt <= new Date()) {
            console.log(" Refresh token has expired for user:", storedToken.user.email);
            return res.status(401).json({ error: "Invalid or expired refresh token" });
        }
        console.log("Valid refresh token found for user:", storedToken.user.email);
        const newAccessToken = (0, token_1.signAccessToken)(storedToken.userId);
        console.log("🎫 New access token generated");
        return res.json({
            accessToken: newAccessToken,
            refreshToken: refreshToken,
            user: {
                id: storedToken.user.id,
                name: storedToken.user.name,
                email: storedToken.user.email
            }
        });
    }
    catch (err) {
        console.error("Refresh token error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
async function logout(req, res) {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const tokenHash = (0, refresh_1.hashToken256)(refreshToken);
            await prisma_1.default.refreshToken.updateMany({
                where: {
                    tokenHash,
                    revoked: false,
                },
                data: {
                    revoked: true
                }
            });
            console.log("User logged out, refresh token revoked");
        }
        res.json({ message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
