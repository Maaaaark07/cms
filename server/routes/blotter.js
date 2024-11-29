import express from "express";
import {
    getAllBlotters,
    getBlottersById,
    addBlotter,
    updateBlotter,
    deleteBlotter,
} from "../controllers/blotterController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:id", verifyUser, getAllBlotters);
router.get("/get/:id", verifyUser, getBlottersById);
router.post("/add", verifyUser, addBlotter);
router.put("/update/:id", verifyUser, updateBlotter);
router.delete("/:id", verifyUser, deleteBlotter);

export default router;
