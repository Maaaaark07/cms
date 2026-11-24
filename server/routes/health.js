import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    getHealthResidents,
    getRecordsByResident,
    getRecordById,
    addMedicalRecord,
    updateMedicalRecord,
} from '../controllers/healthController.js';

const router = express.Router();

router.get('/residents/:id', verifyUser, getHealthResidents);
router.get('/resident/:residentId/records', verifyUser, getRecordsByResident);
router.get('/record/:recordId', verifyUser, getRecordById);
router.post('/record', verifyUser, addMedicalRecord);
router.put('/record/:recordId', verifyUser, updateMedicalRecord);

export default router;
