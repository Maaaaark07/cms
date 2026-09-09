import db, { queryAsync } from '../config/database.js';

const toBit = (value) => {
    return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes'
        ? 1
        : 0;
};

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
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            error: "Failed to retrieve blotter data",
            details: error.message,
        });
    }
};

const toNullableInt = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toDateOnly = (value) => {
    if (!value) return null;
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
};

const requiredText = (value, fallback = '') => {
    const text = value === undefined || value === null ? '' : String(value).trim();
    return text || fallback;
};

let parentColumnsReady = false;

const ensureParentNameColumns = async () => {
    if (parentColumnsReady) return;
    const addColumn = async (column, definition) => {
        try {
            await queryAsync(`ALTER TABLE cbs_residents ADD COLUMN ${column} ${definition}`);
        } catch (error) {
            if (error.code !== 'ER_DUP_FIELDNAME') throw error;
        }
    };
    await addColumn('father_name', 'VARCHAR(150) NULL');
    await addColumn('mother_name', 'VARCHAR(150) NULL');
    parentColumnsReady = true;
};

export const addResident = async (req, res) => {
    try {
        const {
            FirstName,
            LastName,
            MiddleName,
            Suffix,
            birthday,
            BirthPlace,
            Occupation,
            CivilStatus,
            Gender,
            Address,
            Region_ID,
            Province_ID,
            City_ID,
            Barangay_ID,
            Purok_ID,
            IsLocalResident,
            ResidentType,
            ContactNumber,
            Email,
            IsSoloParent,
            SoloParentID,
            IsPWD,
            PWDID,
            IsHouseholdHead,
            HouseholdID,
            IsRegisteredVoter,
            VoterIDNumber,
            IsJuanBataanMember,
            JuanBataanID,
            FatherName,
            MotherName,
        } = req.body;

        const firstName = requiredText(FirstName);
        const lastName = requiredText(LastName);
        const gender = requiredText(Gender);
        const address = requiredText(Address);
        const birthdayDate = toDateOnly(birthday);
        const regionId = toNullableInt(Region_ID);
        const provinceId = toNullableInt(Province_ID);
        const cityId = toNullableInt(City_ID);
        const barangayId = toNullableInt(Barangay_ID);

        if (!firstName || !lastName || !birthdayDate || !gender || !address || !barangayId) {
            return res.status(400).json({
                message: 'First name, last name, birthday, gender, address, and barangay are required.',
            });
        }

        if (!regionId || !provinceId || !cityId) {
            return res.status(400).json({
                message: 'Region, province, and city are required to add a resident.',
            });
        }

        const profileImage = req.file ? `/uploads/user_profile/${req.file.filename}` : null;
        await ensureParentNameColumns();
        const sql = `CALL AddResident(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            firstName,
            lastName,
            requiredText(MiddleName) || null,
            requiredText(Suffix) || null,
            birthdayDate,
            requiredText(BirthPlace, 'N/A'),
            requiredText(Occupation) || null,
            requiredText(CivilStatus, 'Single'),
            gender,
            address,
            regionId,
            provinceId,
            cityId,
            barangayId,
            toNullableInt(Purok_ID),
            toBit(IsLocalResident),
            requiredText(ResidentType) || null,
            requiredText(ContactNumber) || null,
            requiredText(Email) || null,
            toBit(IsSoloParent),
            requiredText(SoloParentID) || null,
            toBit(IsPWD),
            requiredText(PWDID) || null,
            toBit(IsHouseholdHead),
            requiredText(HouseholdID) || null,
            toBit(IsRegisteredVoter),
            requiredText(VoterIDNumber) || null,
            toBit(IsJuanBataanMember),
            requiredText(JuanBataanID) || null,
            profileImage,
        ];

        const result = await queryAsync(sql, values);
        const spMessage = result?.[0]?.[0]?.message || '';

        const insertedRows = await queryAsync(
            `SELECT * FROM cbs_residents
             WHERE first_name = ? AND last_name = ? AND barangay_id = ?
             ORDER BY resident_id DESC
             LIMIT 1`,
            [firstName, lastName, barangayId]
        );
        const resident = insertedRows[0] || null;
        const duplicateMessage = String(spMessage).toLowerCase().includes('already a resident');

        if (duplicateMessage) {
            return res.status(409).json({
                message: spMessage || 'A resident with similar details already exists.',
            });
        }

        if (!resident) {
            return res.status(500).json({
                message: spMessage || 'Resident could not be saved. Please try again.',
            });
        }

        const fatherName = requiredText(FatherName) || null;
        const motherName = requiredText(MotherName) || null;
        await queryAsync(
            `UPDATE cbs_residents
             SET father_name = ?, mother_name = ?
             WHERE resident_id = ?`,
            [fatherName, motherName, resident.resident_id]
        );
        resident.father_name = fatherName;
        resident.mother_name = motherName;

        res.status(201).json({
            message: 'Resident added successfully',
            residentId: resident.resident_id,
            resident,
        });
    } catch (error) {
        console.error("Complete Error Object:", error);
        console.error("Error adding resident:", error.message);
        console.error("SQL Error Code:", error.code);
        console.error("SQL State:", error.sqlState);

        if (error.code === 'ER_DUP_ENTRY' ||
            error.sqlState === '45000' ||
            (error.message && error.message.includes('already exists'))) {
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
    const residentId = req.body.resident_id;
    const {
        first_name, last_name, middle_name, suffix, birthday, birth_place,
        occupation, civil_status, gender, address, region_id, province_id,
        city_id, barangay_id, purok_id, is_local_resident, resident_type,
        contact_number, email, is_solo_parent, solo_parent_id, is_pwd,
        pwd_id, is_household_head, household_id, is_registered_voter,
        voter_id_number, is_juan_bataan_member, juan_bataan_id,
        father_name, mother_name, FatherName, MotherName,
    } = req.body;

    if (!residentId || !first_name || !last_name || !address || !contact_number) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const profileImage = req.file 
            ? `/uploads/user_profile/${req.file.filename}` 
            : req.body.Profile_Image;  // Note: Changed to match the actual field name in request

        const sql = `CALL UpdateResident(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
            residentId,
            first_name,
            last_name,
            middle_name || null,
            suffix || null,
            birthday ? new Date(birthday).toISOString().split('T')[0] : null,
            birth_place || null,
            occupation || null,
            civil_status || null,
            gender,
            address,
            region_id || null,
            province_id || null,
            city_id || null,
            barangay_id || null,
            purok_id || null,
            toBit(is_local_resident),
            resident_type || null,
            contact_number,
            email || null,
            toBit(is_solo_parent),
            solo_parent_id || null,
            toBit(is_pwd),
            pwd_id || null,
            toBit(is_household_head),
            household_id || null,
            toBit(is_registered_voter),
            voter_id_number || null,
            toBit(is_juan_bataan_member),
            juan_bataan_id || null,
            profileImage || null
        ];

        // Wrap the callback-based query in a Promise
        const result = await new Promise((resolve, reject) => {
            db.query(sql, values, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ 
                message: 'Resident not found or no changes made' 
            });
        }

        await ensureParentNameColumns();
        await queryAsync(
            `UPDATE cbs_residents
             SET father_name = ?, mother_name = ?
             WHERE resident_id = ?`,
            [
                requiredText(father_name || FatherName) || null,
                requiredText(mother_name || MotherName) || null,
                residentId,
            ]
        );

        res.status(200).json({
            message: 'Resident updated successfully',
            profile_image: profileImage,
        });

    } catch (error) {
        console.error("Error updating resident:", error);
        res.status(500).json({
            message: 'Failed to update resident',
            error: error.message
        });
    }
};

export const deleteResident = (req, res) => {
    const residentId = req.params.id;
    const query = 'CALL DeleteResident(?)';

    db.query(query, residentId, (error) => {
        if (error) {
            console.error("Error deleting resident:", error);
            return res.status(500).json({ message: 'Error deleting resident' });
        }

        res.status(200).json({ message: 'Resident deleted successfully' });
    });
};

export const getResidentById = async (req, res) => {
    try {
        await ensureParentNameColumns();
        const rows = await queryAsync(
            'SELECT * FROM cbs_residents WHERE resident_id = ? LIMIT 1',
            [req.params.id]
        );
        if (!rows[0]) {
            return res.status(404).json({ message: 'Resident not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ message: 'Failed to retrieve resident', error: error.message });
    }
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

