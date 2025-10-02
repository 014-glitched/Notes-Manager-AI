import { Router } from "express";
import { register, login } from "../controllers/auth";
import { requireAuth } from "../middleware/auth";

const router = Router()

router.post("/register", register)
router.post("/login", login)

router.get('/me', requireAuth, (req, res) => {
  res.json({ 
    message: `Hello user ${req.user?.id}, you have accessed a protected route!`,
  });
});

export default router