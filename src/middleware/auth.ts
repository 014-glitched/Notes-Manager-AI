import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      console.log("No Bearer token found");
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = auth.split(" ")[1];
    
    const payload = verifyAccessToken(token);

    req.user = { id: payload.sub };
    console.log("👤 User set in request:", req.user);
    
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
