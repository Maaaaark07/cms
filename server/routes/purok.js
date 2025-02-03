import express from 'express';
import { getPhPuroks, insertPuroks } from '../controllers/purokController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-puroks/:id', verifyUser, getPhPuroks);
router.post('/add-puroks', verifyUser, insertPuroks);

export default router;