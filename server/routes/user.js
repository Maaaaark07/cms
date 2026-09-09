import express from "express";
import {
    getCbsUsersByBarangay,
    addCbsUser,
    getUserRolesByLguType,
    getAllLguTypes,
    getAllCbsUsers,
    deleteCbsUser
} from "../controllers/userController.js";
import {
    getPageCatalog,
    getAccessPages,
    getAppRoles,
    createAppRole,
    updateAppRole,
    deleteAppRole,
    assignUserAppRole,
} from "../controllers/roleController.js";
import { verifyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/pages', verifyUser, getPageCatalog);
router.get('/access-pages', verifyUser, getAccessPages);
router.get('/app-roles', verifyUser, getAppRoles);
router.post('/app-roles', verifyUser, createAppRole);
router.put('/app-roles/:id', verifyUser, updateAppRole);
router.delete('/app-roles/:id', verifyUser, deleteAppRole);
router.put('/assign-role/:userId', verifyUser, assignUserAppRole);

router.post('/add-user', verifyUser, addCbsUser);
router.get('/lgu-type', verifyUser, getAllLguTypes);
router.get('/get-user-role/:id', verifyUser, getUserRolesByLguType);
router.get('/:lguTypeId/:id', verifyUser, getAllCbsUsers);
router.get('/:id', verifyUser, getCbsUsersByBarangay);
router.delete("/delete-user/:id", verifyUser, deleteCbsUser);

export default router;
