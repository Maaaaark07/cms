import express from "express";
import {
    getAllBrgyOfficials,
    getCBSOfficials,
    getAllBrgyOfficialType,
    insertBrgyOfficial, 
    deleteCbsOfficial,
    updateCbsOfficial
} from "../controllers/brgyOfficials.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/add-official', verifyUser, insertBrgyOfficial);
router.get("/:id", verifyUser, getAllBrgyOfficials);
router.put("/update-official/:id", verifyUser, updateCbsOfficial);
router.delete("/delete-official/:id", verifyUser, deleteCbsOfficial )
router.get("/official-type/:id", verifyUser, getAllBrgyOfficialType)
router.get("/:lguTypeId/:barangayId", verifyUser, getCBSOfficials);

export default router;