import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod"
import prisma from "../config/prisma"
import { signAccessToken } from "../utils/token";
import { generateRefreshTokenPlain, hashToken256, refreshExpiresAt } from "../utils/refresh";
import { registerSchema, loginSchema } from "../schemas/auth";

const BCRYPT_SALT_ROUNDS = 12;

export async function register(req: Request, res: Response) {
  try {
    // console.log("📦 Request body:", JSON.stringify(req.body))

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid request",
        details: z.flattenError(parsed.error)
      });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("User already exists:", email)
      return res.status(409).json({ error: "Email is already in use" });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    console.log("User created:", user.id)

    const accessToken = signAccessToken(user.id);

    const refreshToken = generateRefreshTokenPlain();
    const tokenHash = hashToken256(refreshToken)
    const refreshTokenExpire = refreshExpiresAt();

    await prisma.refreshToken.create({
      data: {
        tokenHash: tokenHash,
        userId: user.id,
        expiresAt: refreshTokenExpire,
        revoked: false
      }
    })

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid request" });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user.id);

    const refreshToken = generateRefreshTokenPlain()
    const tokenHash = hashToken256(refreshToken)
    const tokenExpiresAt = refreshExpiresAt()

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: tokenExpiresAt,
        revoked: false
      }
    })

    return res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    console.log(" Refresh token endpoint hit");

    const { refreshToken } = req.body
    console.log(" Received refresh token:", refreshToken)

    if(!refreshToken){
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const tokenHash = hashToken256(refreshToken)
    console.log(" Looking for token hash in database...");

    // tokenHash is unique in the schema; use findUnique by the unique field then
    // verify revoked/expiry conditions in application logic.
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    })

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

    const newAccessToken = signAccessToken(storedToken.userId)
    console.log("🎫 New access token generated");

    return res.json({
      accessToken: newAccessToken,
      refreshToken: refreshToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email
      }
    })
  } catch (err){
      console.error("Refresh token error:", err);
      return res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try{
    const { refreshToken } = req.body

    if(refreshToken){
      const tokenHash = hashToken256(refreshToken)
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revoked: false,
        },
        data: {
          revoked: true
        }
      })
      console.log("User logged out, refresh token revoked");
    }
    res.json({ message: "Logged out successfully" });
  } catch(err){
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Internal server error" });
  }
}