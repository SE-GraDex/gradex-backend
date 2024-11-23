import express from "express";
import {
  uploadSingleFile,
  uploadMultipleFiles,
} from "../controller/uploadController";

const router = express.Router();

router.post("/upload-single", uploadSingleFile);
router.post("/upload-multiple", uploadMultipleFiles);

export default router;
