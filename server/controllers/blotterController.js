import db from '../config/database.js';

export const getAllBlotters = (req, res) => {
    const sql = "SELECT * FROM cbs_blotters ORDER BY incident_date DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Failed to retrieve blotter data' });
        }
        res.json(results);
    });
};

export const addBlotter = async (req, res) => {
    const {
        incident_type,
        complainant,
        respondent,
        incident_date,
        incident_location,
        incident_description,
        status
    } = req.body;

    if (!incident_type || !complainant || !respondent || !incident_date || !incident_location) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
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
            status || 'Pending'
        ];

        await db.query(sql, values);
        res.status(201).json({ message: 'Blotter record added successfully' });
    } catch (error) {
        console.error("Error adding blotter record:", error);
        res.status(500).json({ message: 'Failed to add blotter record' });
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
        status
    } = req.body;

    if (!incident_type || !complainant || !respondent || !incident_date || !incident_location) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
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
            id
        ];

        const result = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Blotter record not found' });
        }

        res.status(200).json({ message: 'Blotter record updated successfully' });
    } catch (error) {
        console.error("Error updating blotter record:", error);
        res.status(500).json({ message: 'Failed to update blotter record' });
    }
};

export const deleteBlotter = async (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM cbs_blotters WHERE id = ?';

    try {
        const result = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Blotter record not found' });
        }

        res.status(200).json({ message: 'Blotter record deleted successfully' });
    } catch (error) {
        console.error("Error deleting blotter record:", error);
        res.status(500).json({ message: 'Failed to delete blotter record' });
    }
};