import express from "express";
import upload from "../backend/middleware/upload.middleware.js";
import { uploadImageToS3 } from "../controller/upload.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadImageToS3);

export default router;