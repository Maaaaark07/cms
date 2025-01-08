import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

const salt = 10;

export const register = (req, res) => {
    const { user, password } = req.body;
    const sql = "INSERT INTO cbs_users (`user`, `password`) VALUES (?, ?)";

    bcrypt.hash(password, salt, (err, hash) => {
        if (err) return res.json({ Error: "Error hashing password" });

        const values = [user, hash];
        db.query(sql, values, (err, result) => {
            if (err) return res.json({ Error: "Inserting Data error" });
            return res.json({ Status: "Success" });
        });
    });
};

export const login = (req, res) => {
    const { users, password } = req.body;
    //const sql = "SELECT * FROM cbs_users WHERE user = ?";
    const sql = "CALL getCBSUser(?)";

    db.query(sql, [users], (err, data) => {
        if (err) return res.status(500).json({ Error: "Database error" });

        if (data.length > 0) {
            bcrypt.compare(password.toString(), data[0][0].password, (err, result) => {
                if (err) return res.status(500).json({ Error: "Password Compare Error" });
                if (result) {
                    const token = jwt.sign(
                        //{ user: data[0][0].user, user_id: data[0][0].id, role: data[0][0].role, barangay_id: data[0][0].barangay_id },
                        { user_data: data[0][0] },
                        "jwt-secret-key",
                        { expiresIn: '1d' }
                    );

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                    });
                    return res.json({ Status: "Success", Id: data[0][0].barangay_id });
                }
                return res.json({ Error: "Invalid password" });
            });
        } else {
            return res.json({ Error: "User not found" });
        }
    });
};

export const logout = (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.json({ Status: "Success" });
};

export const getHome = (req, res) => {
    return res.json({
        Status: 'Success',
        user: req.user_data.user,
        user_id: req.user_data.user_id,
        role: req.user_data.role,
        profile_image: req.user_data.profile_image,
        barangay_id: req.user_data.barangay_id,
        barangay_name: req.user_data.brgy_name,
        barangay_logo: req.user_data.brgy_logo,
        city_id: req.user_data.city_id,
        city_name: req.user_data.city_name,
        city_logo: req.user_data.city_logo,
        province_id: req.user_data.province_id,
        province_name: req.user_data.province_name,
        province_logo: req.user_data.province_logo,
    });
};

export const setCookie = (req, res) => {
    res.cookie('testCookie', 'testValue', {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
    });
    res.send('Cookie has been set');
};

export const getCookie = (req, res) => {
    const testCookie = req.cookies.testCookie;
    res.json({ testCookie });
};
