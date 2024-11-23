import { Request, Response } from "express";
import upload from "../middleware/upload";

export const uploadSingleFile = (req: Request, res: Response): void => {
  upload.single("image")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  });
};

export const uploadMultipleFiles = (req: Request, res: Response): void => {
  upload.array("images", 5)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    res.status(200).json({
      message: "Files uploaded successfully",
      files: req.files,
    });
  });
};
