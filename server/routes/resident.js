import express from 'express';
import multer from 'multer';
import upload from '../middleware/multerMiddleware.js';
import { verifyUser } from '../middleware/authMiddleware.js';
import {
    getAllResidents,
    addResident,
    updateResident,
    deleteResident,
    getResidentCount,
    getResidentById,
    downloadResidentTemplate,
    uploadResidentsFromExcel,
} from '../controllers/residentController.js';

const router = express.Router();

const excelUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const name = String(file.originalname || '').toLowerCase();
        if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
            return cb(null, true);
        }
        cb(new Error('Please upload an Excel file (.xlsx or .xls).'));
    },
});

const handleExcelFile = (req, res, next) => {
    excelUpload.single('excel_file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message || 'Please upload an Excel file (.xlsx or .xls).',
            });
        }
        next();
    });
};

router.post('/add', verifyUser, upload.single('Profile_Image'), addResident);
router.put('/update/:id', verifyUser, upload.single('Profile_Image'), updateResident);
router.get('/details/:id', verifyUser, getResidentById);
router.get('/count/:id', verifyUser, getResidentCount);
router.get('/upload-template', verifyUser, downloadResidentTemplate);
router.post('/upload-excel', verifyUser, handleExcelFile, uploadResidentsFromExcel);
router.get('/:id', verifyUser, getAllResidents);
router.delete('/:id', verifyUser, deleteResident);

export default router;
