import express from "express";
import {
    getCbsUsersByBarangay,
    addCbsUser
} from "../controllers/userController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add-user', addCbsUser);
router.get('/:id', verifyUser, getCbsUsersByBarangay);

export default router;