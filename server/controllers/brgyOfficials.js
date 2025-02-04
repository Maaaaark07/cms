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


export const getCBSOfficials = async (req, res) => {
    const { lguTypeId, barangayId } = req.params;

    const sql = "CALL GetCBSOfficials(?, ?)";

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [lguTypeId, barangayId], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No officials found"
            });
        }

        res.json({
            success: true,
            data: results[0],
            message: "Officials retrieved successfully"
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to retrieve officials data",
            details: error.message
        });
    }
}


export const getAllBrgyOfficialType = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetCBSOfficialTypes(?)";

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
            error: "Failed to retrieve Barangay Officials Types data",
            details: error.message,
        });
    }
}

export const insertBrgyOfficial = async (req, res) => {
    const {
        official_type_id,
        resident_id,
        full_name,
        position_rank,
        committee,
        barangay_id,
        city_id,
        province_id
    } = req.body;

    const sql = `CALL InsertCBSOfficial(?, ?, ?, ?, ?, ?, ?, ?)`;

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(
                sql,
                [
                    official_type_id,
                    resident_id,
                    full_name,
                    position_rank,
                    committee,
                    barangay_id,
                    city_id,
                    province_id
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

        res.status(201).json({
            success: true,
            message: "Official inserted successfully",
            data: results
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to insert official data",
            details: error.message
        });
    }
};

