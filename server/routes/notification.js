import express from 'express';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    getNotificationModemStatus,
    getNotificationRecipients,
    sendNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/modem-status', verifyUser, getNotificationModemStatus);
router.get('/recipients/:group/:id', verifyUser, getNotificationRecipients);
router.post('/send', verifyUser, sendNotification);

export default router;
