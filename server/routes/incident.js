import express from "express";
import {
    getAllIncidents,
    addIncidentReport,
    deleteIncidentReport
} from "../controllers/incidentController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-all-incidents/:id", verifyUser, getAllIncidents);
router.post("/add/incident-report", verifyUser, addIncidentReport);
router.delete("/:id", verifyUser, deleteIncidentReport);
export default router;