import express from 'express';
import {
    getRegisteredVoters,
    getPopulationStats,
    getResidentCount
} from '../controllers/statsController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/registered-voters/:id', verifyUser, getRegisteredVoters);
router.get('/population', verifyUser, getPopulationStats);
router.get('/count', verifyUser, getResidentCount)

export default router;