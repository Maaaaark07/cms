import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    listResolutions,
    listCityResolutions,
    getResolution,
    addResolution,
    updateResolution,
    removeResolutionAttachment,
    approveResolution,
    deleteResolution,
} from '../controllers/resolutionController.js';

const router = express.Router();

const resolutionDir = path.join('./uploads', 'resolutions');
if (!fs.existsSync(resolutionDir)) {
    fs.mkdirSync(resolutionDir, { recursive: true });
}

const resolutionUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, resolutionDir),
        filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `attachment-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const name = String(file.originalname || '').toLowerCase();
        const allowedExt = name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx');
        if (allowedExt) {
            return cb(null, true);
        }
        cb(new Error('Please attach a PDF or Word file (.pdf, .doc, .docx).'));
    },
});

const handleAttachment = (req, res, next) => {
    resolutionUpload.single('attachment')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message || 'Please attach a PDF or Word file (.pdf, .doc, .docx).',
            });
        }
        next();
    });
};

router.get('/city/:id', verifyUser, listCityResolutions);
router.get('/:id', verifyUser, getResolution);
router.get('/', verifyUser, listResolutions);
router.post('/', verifyUser, handleAttachment, addResolution);
router.put('/:id/approve', verifyUser, approveResolution);
router.put('/:id', verifyUser, handleAttachment, updateResolution);
router.delete('/:id/attachment', verifyUser, removeResolutionAttachment);
router.delete('/:id', verifyUser, deleteResolution);

export default router;
