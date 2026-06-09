import express from "express";
import {
  getProfile,
  loginUser,
  registerUser,
} from "./auth.controller.js";
import protect from "./auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getProfile);

export default router;
