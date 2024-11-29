import express from 'express';
import {
    getAllResidents,
    addResident,
    updateResident,
    deleteResident,
    getResidentCount
} from '../controllers/residentController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:id', verifyUser, getAllResidents);
router.post('/add', verifyUser, addResident);
router.put('/update/:id', verifyUser, updateResident);
router.delete('/:id', verifyUser, deleteResident);
router.get('/count/:id', verifyUser, getResidentCount);

export default router;