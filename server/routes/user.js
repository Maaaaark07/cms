import express from "express";
import {
    getCbsUsersByBarangay
} from "../controllers/userController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/:id', verifyUser, getCbsUsersByBarangay);

export default router;