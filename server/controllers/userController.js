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