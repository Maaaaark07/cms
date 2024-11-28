import db from "../config/database.js";

// export const getAllBlotters = (req, res) => {
//   const sql = `
//       SELECT
//         b.blotter_id,
//         b.report_date,
//         b.incident_date,
//         b.witnesses,
//         b.incident_type,
//         b.incident_location,
//         b.incident_description,
//         b.status,
//         b.resolution,
//         b.notes,
//         b.barangay_id,
//         r1.first_name AS reporter_first_name,
//         r1.last_name AS reporter_last_name,
//         r1.middle_name AS reporter_middle_name,
//         r1.suffix AS reporter_suffix,
//         r2.first_name AS complainant_first_name,
//         r2.last_name AS complainant_last_name,
//         r2.middle_name AS complainant_middle_name,
//         r2.suffix AS complainant_suffix,
//         r3.first_name AS respondent_first_name,
//         r3.last_name AS respondent_last_name,
//         r3.middle_name AS respondent_middle_name,
//         r3.suffix AS respondent_suffix
//       FROM
//         cbs_blotters b
//       LEFT JOIN
//         cbs_residents r1 ON b.reporter_id = r1.resident_id
//       LEFT JOIN
//         cbs_residents r2 ON b.complainant_id = r2.resident_id
//       LEFT JOIN
//         cbs_residents r3 ON b.respondent_id = r3.resident_id
//       ORDER BY
//         b.incident_date DESC
//     `;

//   // Execute the query
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("Database error:", err);
//       return res.status(500).json({ Error: "Failed to retrieve blotter data" });
//     }

//     res.json(results);
//   });
// };

export const getAllBlotters = async (req, res) => {
  const sql = "CALL GetAllBlotters(?)";
  const barangayId = 107;

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(sql, [barangayId], (err, results) => {
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

export const getBlottersById = async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM cbs_blotters WHERE blotter_id = ?";

  try {
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ Error: "Failed to retrieve blotter data" });
      }
      res.json(results);
    });
  } catch (error) {}
};

export const addBlotter = async (req, res) => {
  const {
    incident_type,
    complainant,
    respondent,
    incident_date,
    incident_location,
    incident_description,
    status,
  } = req.body;

  if (
    !incident_type ||
    !complainant ||
    !respondent ||
    !incident_date ||
    !incident_location
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  const sql = `
        INSERT INTO cbs_blotters 
        (incident_type, complainant, respondent, incident_date, incident_location, incident_description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

  try {
    const values = [
      incident_type,
      complainant,
      respondent,
      incident_date,
      incident_location,
      incident_description,
      status || "Pending",
    ];

    await db.query(sql, values);
    res.status(201).json({ message: "Blotter record added successfully" });
  } catch (error) {
    console.error("Error adding blotter record:", error);
    res.status(500).json({ message: "Failed to add blotter record" });
  }
};

export const updateBlotter = async (req, res) => {
  const { id } = req.params;
  const {
    incident_type,
    complainant,
    respondent,
    incident_date,
    incident_location,
    incident_description,
    status,
  } = req.body;

  if (
    !incident_type ||
    !complainant ||
    !respondent ||
    !incident_date ||
    !incident_location
  ) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  const sql = `
        UPDATE cbs_blotters
        SET incident_type = ?, complainant = ?, respondent = ?, 
            incident_date = ?, incident_location = ?, 
            incident_description = ?, status = ?
        WHERE id = ?
    `;

  try {
    const values = [
      incident_type,
      complainant,
      respondent,
      incident_date,
      incident_location,
      incident_description,
      status,
      id,
    ];

    const result = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Blotter record not found" });
    }

    res.status(200).json({ message: "Blotter record updated successfully" });
  } catch (error) {
    console.error("Error updating blotter record:", error);
    res.status(500).json({ message: "Failed to update blotter record" });
  }
};

export const deleteBlotter = async (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cbs_blotters WHERE id = ?";

  try {
    const result = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Blotter record not found" });
    }

    res.status(200).json({ message: "Blotter record deleted successfully" });
  } catch (error) {
    console.error("Error deleting blotter record:", error);
    res.status(500).json({ message: "Failed to delete blotter record" });
  }
};
