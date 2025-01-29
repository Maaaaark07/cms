import db from '../config/database.js';


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
        fullname
    } = req.body;

    const sql = "CALL AddCBSUser(?, ?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(
                sql,
                [
                    barangay_id,
                    city_id,
                    province_id,
                    user,
                    password,
                    role_id,
                    lgu_type_id,
                    resident_id,
                    fullname
                ],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        // Send success response
        res.status(201).json({
            message: "User created successfully",
            data: results[0], // Assuming the stored procedure returns some data
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to create user",
            details: error.message,
        });
    }
};