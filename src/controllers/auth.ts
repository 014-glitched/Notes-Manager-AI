import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod"
import prisma from "../config/prisma"
import { signAccessToken } from "../utils/token";
// import { generateRefreshTokenPlain, hashToken256, refreshExpiresAt } from "../utils/refresh";
import { registerSchema, loginSchema } from "../schemas/auth";

const BCRYPT_SALT_ROUNDS = 12;

// export async function register(req: Request, res: Response) {
//   try {
//     const parsed = registerSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res
//         .status(400)
//         .json({ error: "Invalid request" });
//     }

//     const { name, email, password } = parsed.data;

//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: "Email is already in use" });
//     }

//     const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
//     const user = await prisma.user.create({
//       data: { name, email, password: hashed },
//     });

//     const accessToken = signAccessToken(user.id);

//     return res.status(201).json({
//       accessToken,
//       user: { id: user.id, name: user.name, email: user.email },
//     });
//   } catch (err) {
//     console.error("Register error:", err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

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
      console.log("❌ User already exists:", email)
      return res.status(409).json({ error: "Email is already in use" });
    }

    const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });
    console.log("✅ User created:", user.id)

    const accessToken = signAccessToken(user.id);

    return res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
        console.error("💥 Register error:", err);
        return res.status(500).json({ error: "Registration failed" });
  }
}

