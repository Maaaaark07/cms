import db, { queryAsync } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    attachAppRolesToUsers,
    assignAppRoleToUser,
    ensureRoleTables,
    findUserIdByUsername,
    getFallbackSystemRoleId,
    parseCustomRoleId,
} from './roleController.js';

const saltRounds = 10;

export const getCbsUsersByBarangay = async (req, res) => {
    const { barangayId } = req.params;
     const { id } = req.params;
     const sql = "CALL getBrgyCBSUsers(?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.json(results[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter data",
            details: error.message,
        });
    }
};


export const getAllCbsUsers = async (req, res) => {
    const {lguTypeId, id } = req.params;
    const sql = "CALL getAllCBSUsers(?, ?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [lguTypeId, id], (err, results) => { // Pass both parameters
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const users = await attachAppRolesToUsers(results[0] || []);
        res.json(users);
        console.log("result: ", results);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve CBS users data",
            details: error.message,
        });
    }
};

export const getAllLguTypes = async (req, res) => {
    const sql = "SELECT * FROM lgu_types";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                console.log('Database connection:', !!db); // Check if db is connected
                console.log('Query:', sql);
                console.log('Error:', err);
                console.log('Query results:', results);
                
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(200).json({
            message: "LGU types fetched successfully",
            data: results,
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to fetch LGU types",
            details: error.message,
        });
    }
};

export const addCbsUser = async (req, res) => {
    const {
        barangay_id,
        city_id,
        province_id,
        user,
        password,
        role_id,
        lgu_type_id,
        resident_id,
        fullname,
        app_role_id,
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const customRoleId = parseCustomRoleId(role_id) || (app_role_id ? Number(app_role_id) : null);
        const systemRoleId = customRoleId
            ? await getFallbackSystemRoleId(lgu_type_id)
            : role_id;

        const sql = "CALL AddCBSUser(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [
            barangay_id,
            city_id,
            province_id,
            user,
            hashedPassword,
            systemRoleId,
            lgu_type_id,
            resident_id,
            fullname,
        ];

        const results = await new Promise((resolve, reject) => {
            db.query(sql, values, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (customRoleId) {
            const createdUserId = await findUserIdByUsername(user);
            if (createdUserId) {
                await assignAppRoleToUser(createdUserId, customRoleId);
            }
        }

        res.status(201).json({
            message: "User created successfully",
            data: results[0],
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to create user",
            details: error.message,
        });
    }
};


export const getUserRolesByLguType = async (req, res) => {
    const { id } = req.params;

    // Validate the input
    if (![1, 2, 3].includes(parseInt(id))) {
        return res.status(400).json({
            error: "Invalid lgu_type_id",
            details: "lgu_type_id must be 1, 2, or 3",
        });
    }

    const sql = "CALL getCBSUserRoles(?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        // Send success response
        res.status(200).json({
            message: "User roles fetched successfully",
            data: results[0], // Assuming the procedure returns the result in the first element of the array
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to fetch user roles",
            details: error.message,
        });
    }
};

export const deleteCbsUser = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL DeleteCBSUser(?)";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result) {
            try {
                await ensureRoleTables();
                await queryAsync('DELETE FROM cbs_user_app_roles WHERE user_id = ?', [id]);
            } catch (cleanupError) {
                console.error("Failed to clean up user role assignment:", cleanupError);
            }
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ error: "User not found or already deleted" });
        }
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to delete user",
            details: error.message,
        });
    }
};