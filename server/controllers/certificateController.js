import db from '../config/database.js';

export const getAllCertifcateRequest = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetAllCertificateRequests(?)";

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
            error: "Failed to retrieve certificate data",
            details: error.message,
        });
    }
}

export const getAllCertificateTypes = async (req, res) => {
    const sql = "CALL GetBrgyCertificateTypes()";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        res.json(results[0]);
    } catch (error) {
        console.error("Detailed Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve certificate data",
            details: error.message,
        });
    }
}
