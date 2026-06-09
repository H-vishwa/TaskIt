import express from "express";
import protect from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

export default router;
