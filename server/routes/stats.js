import express from 'express';
import {
    getRegisteredVoters,
    getPopulationStats
} from '../controllers/statsController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/registered-voters', verifyUser, getRegisteredVoters);
router.get('/population', verifyUser, getPopulationStats);

export default router;