"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshTokenPlain = generateRefreshTokenPlain;
exports.hashToken256 = hashToken256;
exports.refreshExpiresAt = refreshExpiresAt;
const crypto_1 = __importDefault(require("crypto"));
function generateRefreshTokenPlain() {
    return crypto_1.default.randomBytes(128).toString('hex');
}
function hashToken256(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function refreshExpiresAt() {
    const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
