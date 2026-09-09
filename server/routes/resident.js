import express from 'express';
import upload from '../middleware/multerMiddleware.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    getAllResidents,
    addResident,
    updateResident,
    deleteResident,
    getResidentCount,
    getResidentById
} from '../controllers/residentController.js';

const router = express.Router();

// Route to add a resident with file upload
router.post('/add', verifyUser, upload.single('Profile_Image'), addResident); // Use multer middleware for 'Profile_Image'
router.put('/update/:id', verifyUser, upload.single('Profile_Image'), updateResident);
router.get('/details/:id', verifyUser, getResidentById);
router.get('/count/:id', verifyUser, getResidentCount);
router.get('/:id', verifyUser, getAllResidents);
router.delete('/:id', verifyUser, deleteResident);

export default router;
