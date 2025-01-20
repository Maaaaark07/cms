import express from "express";
import {
    getAllCertifcateRequest,
    getAllCertificateTypes,
    addCertificationRequest
} from "../controllers/certificateController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

router.post("/add", verifyUser, upload.single('certificate'), addCertificationRequest);
router.get("/", verifyUser, getAllCertificateTypes);
router.get("/:id", verifyUser, getAllCertifcateRequest);

export default router;