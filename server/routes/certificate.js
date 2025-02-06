import express from "express";
import {
    getAllCertificateRequest,
    getAllCertificateTypes,
    addCertificationRequest,
    getAllCertificate,
    addCertificateType,
    deleteCertificate
} from "../controllers/certificateController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

router.get("/", verifyUser, getAllCertificateTypes);
router.post("/add", verifyUser, upload.single('certificate'), addCertificationRequest);
router.post("/add-certificate-type", verifyUser, addCertificateType);
router.get("/get-certificate-type", verifyUser, getAllCertificate);
router.delete('/delete-certificate/:id', verifyUser, deleteCertificate);
router.get("/:id", verifyUser, getAllCertificateRequest);

export default router;