import db from "../config/database.js";

export const getAllBrgyOfficials = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetBarangayOfficials(?)";

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
            error: "Failed to retrieve Barangay Officials data",
            details: error.message,
        });
    }
}