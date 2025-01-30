import express from "express";
import {
    getCbsUsersByBarangay,
    addCbsUser,
    getUserRolesByLguType,
    getAllLguTypes
} from "../controllers/userController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add-user', addCbsUser);
router.get('/lgu-type', getAllLguTypes);
router.get('/get-user-role/:id', getUserRolesByLguType);
router.get('/:id', verifyUser, getCbsUsersByBarangay);

export default router;