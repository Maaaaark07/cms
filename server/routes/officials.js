import express from "express";
import {
    getAllBrgyOfficials,
} from "../controllers/brgyOfficials.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", verifyUser, getAllBrgyOfficials);

export default router;