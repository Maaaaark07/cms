import db from '../config/database.js';

export const getAllResidents = async (req, res) => {
    const { id } = req.params;
    const sql = "CALL GetAllResidents(?)";

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
        console.log(results[0]);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter data",
            details: error.message,
        });
    }
};

export const addResident = async (req, res) => {
    try {
        const {
            FirstName, LastName, MiddleName, Suffix,
            birthday, BirthPlace, Occupation,
            CivilStatus, Gender, Address,
            Region_ID, Province_ID, City_ID,
            Barangay_ID, Purok_ID, IsLocalResident, ResidentType,
            ContactNumber, Email,
            IsHouseholdHead, HouseholdID,
            IsRegisteredVoter, VoterIDNumber,
            IsJuanBataanMember, JuanBataanID,
        } = req.body;

        console.log('Received Resident Data:', req.body);

        const sql = `CALL AddResident(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            FirstName,
            LastName,
            MiddleName || null,
            Suffix || null,
            birthday ? new Date(birthday).toISOString().split('T')[0] : null,
            BirthPlace || null,
            Occupation || null,
            CivilStatus || null,
            Gender,
            Address,
            Region_ID || null,
            Province_ID || null,
            City_ID || null,
            Barangay_ID || null,
            Purok_ID || null,
            IsLocalResident ? 1 : 0,
            ResidentType || null,
            ContactNumber,
            Email || null,
            IsHouseholdHead ? 1 : 0,
            HouseholdID || null,
            IsRegisteredVoter ? 1 : 0,
            VoterIDNumber || null,
            IsJuanBataanMember ? 1 : 0,
            JuanBataanID || null,
        ];

        const result = await db.query(sql, values);
        console.log(result);

        res.status(201).json({
            message: 'Resident added successfully',
            residentId: result.insertId, // Use insertId instead of result[0]?.resident_id
        });
    } catch (error) {
        console.error("Complete Error Object:", error);
        console.error("Error adding resident:", error.message);
        console.error("SQL Error Code:", error.code);
        console.error("SQL State:", error.sqlState);

        if (error.code === 'ER_DUP_ENTRY' || 
            error.sqlState === '45000' || 
            error.message.includes('already exists')) {
            return res.status(409).json({
                message: 'A resident with similar details already exists',
            });
        }

        res.status(500).json({
            message: 'Failed to add resident',
            error: error.message,
        });
    }
};

export const updateResident = async (req, res) => {
    const { id: ResidentID } = req.params;
    const {
        FirstName, LastName, MiddleName, Suffix, Age, birthday, BirthPlace, Gender, Address, Region_ID,
        Province_ID, City_ID, Barangay_ID, purok, IsLocalResident, ContactNumber, Email, CivilStatus, Occupation,
        IsHouseholdHead, HouseholdID, IsRegisteredVoter, VoterIDNumber, IsJuanBataanMember, JuanBataanID, LastUpdated
    } = req.body;

    if (!ResidentID || !FirstName || !LastName || !Gender || !Address || !ContactNumber) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const query = `
            UPDATE cbs_residents
            SET first_name = ?, last_name = ?, middle_name = ?, suffix = ?, age = ?, birthday = ?, 
                birth_place = ?, gender = ?, address = ?, region_id = ?, province_id = ?, city_id = ?, 
                barangay_id = ?, purok = ?, is_local_resident = ?, contact_number = ?, email = ?, 
                civil_status = ?, occupation = ?, is_household_head = ?, household_id = ?, 
                is_registered_voter = ?, voter_id_number = ?, is_juan_bataan_member = ?, juan_bataan_id = ?, 
                last_updated = ?
            WHERE resident_id = ?
        `;
        const values = [
            FirstName, LastName, MiddleName, Suffix, Age, birthday, BirthPlace, Gender, Address, Region_ID,
            Province_ID, City_ID, Barangay_ID, purok, IsLocalResident, ContactNumber, Email, CivilStatus, Occupation,
            IsHouseholdHead, HouseholdID, IsRegisteredVoter, VoterIDNumber, IsJuanBataanMember, JuanBataanID, LastUpdated,
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
    const query = 'CALL DeleteResident(?)';

    db.query(query, residentId, (error, results) => {
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
    const { id } = req.params;
    const sql = "CALL GetResidentsCount(?)";

   db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error fetching resident count:", err);
            return res.status(500).json({ message: 'Server error' });
        }
        const count = result[0]?.[0]?.NumberOfResidents || 0;

        res.status(200).json({ count });
    });
    
};

