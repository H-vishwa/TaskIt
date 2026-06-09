import express from "express";
import protect from "../auth/auth.middleware.js";
import upload from "../../config/multer.js";
import { addComment, getComments } from "./comment.controller.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get("/", getComments);
router.post("/", upload.array("attachments", 3), addComment);

export default router;
