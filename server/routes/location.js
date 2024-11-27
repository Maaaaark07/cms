import express from 'express';
import { getAllRegion, getAllProvinces, getAllCities, getAllBarangay } from '../controllers/locationController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/region', verifyUser, getAllRegion);
router.get('/provinces/:id', verifyUser, getAllProvinces);
router.get('/cities/:id', verifyUser, getAllCities);
router.get('/barangay/:id', verifyUser, getAllBarangay);


export default router;