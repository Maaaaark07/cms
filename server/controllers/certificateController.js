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

export const addCertificationRequest = async (req, res) => {
    const {
        resident_id,
        certification_type_id,
        status_id,
        amount,
        purpose,
        barangay_id,
        issued_by,
    } = req.body;

    // Determine the file path for the certificate if uploaded
    const certificate = req.file
        ? `/uploads/certificates/${req.file.filename}`
        : null; // Set to null if no file is uploaded

    const sql = `
        CALL AddCertificationRequest(?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        await new Promise((resolve, reject) => {
            db.query(
                sql,
                [
                    resident_id,
                    certification_type_id,
                    status_id,
                    amount,
                    purpose,
                    certificate,
                    barangay_id,
                    issued_by,
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

        res.status(201).json({ message: "Certification request added successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to add certification request",
            details: error.message,
        });
    }
};

