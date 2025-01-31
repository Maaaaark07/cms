import db from '../config/database.js';

export const getAllCertificateRequest = async (req, res) => {
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
};

export const getAllCertificateStatuses = async (req, res) => {
    const sql = "CALL GetCertRequestStatuses()";

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
        issued_by,
        amount,
        purpose,
        barangay_id,
    } = req.body;

    console.log(req.body);
    // Validate required fields
    // if (!resident_id || !certification_type_id || !status_id || !barangay_id) {
    //     return res.status(400).json({ error: "Missing required fields" });
    // }

    // Determine the file path for the certificate if uploaded
    const certificate = req.file
        ? `/uploads/certificates/${req.file.filename}`
        : null; // Set to null if no file is uploaded

    const sql = `CALL AddCertificateRequest(?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        await new Promise((resolve, reject) => {
            db.query(
                sql,
                [
                    resident_id,
                    certification_type_id,
                    status_id || 4,
                    issued_by,
                    amount,
                    purpose || null,
                    certificate,
                    barangay_id,
                ],
                (err, results) => {
                    if (err) {
                        console.error("Database error:", err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        res.status(201).json({ message: "Certification request added successfully" });
    } catch (error) {
        console.error("Error in addCertificationRequest:", error);
        res.status(500).json({
            error: "Failed to add certification request",
            details: error.message,
        });
    }
};

