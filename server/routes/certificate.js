import express from "express";
import {
    getAllCertifcateRequest,
    getAllCertificateTypes,
} from "../controllers/certificateController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", verifyUser, getAllCertifcateRequest);
router.get("/", verifyUser, getAllCertificateTypes);

export default router;