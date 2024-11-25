import db from '../config/database.js';

export const getAllResidents = (req, res) => {
    const sql = "SELECT * FROM cbs_resident";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Failed to retrieve resident data' });
        }
        res.json(results);
    });
};

export const addResident = async (req, res) => {
    const {
        ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender,
        Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID,
        BarangayID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber, VotingPrecinct
    } = req.body;

    if (!FirstName || !LastName || !Age || !Gender || !Address || !ContactNumber) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const query = `
            INSERT INTO cbs_resident 
            (ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender, 
            Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID, 
            JuanBataanID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber, 
            VotingPrecinct)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender,
            Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID,
            BarangayID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber,
            VotingPrecinct
        ];

        await db.query(query, values);
        res.status(201).json({ message: 'Resident added successfully' });
    } catch (error) {
        console.error("Error adding resident:", error);
        res.status(500).json({ message: 'Failed to add resident' });
    }
};

export const updateResident = async (req, res) => {
    const { id: ResidentID } = req.params;
    const {
        FirstName, LastName, MiddleName, Age, birthday, Gender, Address, ContactNumber,
        Email, CivilStatus, Occupation, HouseholdID, JuanBataanID, RegistrationDate,
        Status, RegisteredVoter, VoterIDNumber, VotingPrecinct
    } = req.body;

    if (!ResidentID || !FirstName || !LastName || !Age || !Gender || !Address || !ContactNumber) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const query = `
            UPDATE cbs_resident
            SET FirstName = ?, LastName = ?, MiddleName = ?, Age = ?, birthday = ?, 
                Gender = ?, Address = ?, ContactNumber = ?, Email = ?, CivilStatus = ?, 
                Occupation = ?, HouseholdID = ?, JuanBataanID = ?, RegistrationDate = ?, 
                Status = ?, RegisteredVoter = ?, VoterIDNumber = ?, VotingPrecinct = ?
            WHERE ResidentID = ?
        `;
        const values = [
            FirstName, LastName, MiddleName, Age, birthday, Gender, Address,
            ContactNumber, Email, CivilStatus, Occupation, HouseholdID, JuanBataanID,
            RegistrationDate, Status, RegisteredVoter, VoterIDNumber, VotingPrecinct,
            ResidentID
        ];

        const result = await db.query(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Resident not found or no changes made' });
        }

        res.status(200).json({ message: 'Resident updated successfully' });
    } catch (error) {
        console.error("Error updating resident:", error);
        res.status(500).json({ message: 'Failed to update resident' });
    }
};

export const deleteResident = (req, res) => {
    const residentId = req.params.id;
    const query = 'DELETE FROM cbs_resident WHERE ResidentID = ?';

    db.query(query, [residentId], (error, results) => {
        if (error) {
            console.error("Error deleting resident:", error);
            return res.status(500).json({ message: 'Error deleting resident' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        res.status(200).json({ message: 'Resident deleted successfully' });
    });
};

export const getResidentCount = (req, res) => {
    const query = 'SELECT COUNT(*) AS count FROM cbs_resident';

    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching resident count:", err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ count: result[0].count });
    });
};