import db, { queryAsync } from '../config/database.js';
import XLSX from 'xlsx';

const toBit = (value) => {
    if (value === true || value === 1 || value === '1') return 1;
    const raw = String(value ?? '').trim().toLowerCase();
    return raw === 'true' || raw === 'yes' || raw === 'y' ? 1 : 0;
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
    if (value === undefined || value === null || value === '') return null;

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    }

    if (typeof value === 'number' && Number.isFinite(value) && value > 59 && value < 80000) {
        const utc = new Date(Math.round((value - 25569) * 86400 * 1000));
        if (Number.isNaN(utc.getTime())) return null;
        return toDateOnly(utc);
    }

    const raw = String(value).trim();
    const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    return toDateOnly(date);
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

const createResidentRecord = async (body = {}, profileImage = null) => {
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
    } = body;

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
        return {
            ok: false,
            status: 400,
            message: 'First name, last name, birthday, gender, address, and barangay are required.',
        };
    }

    if (!['Male', 'Female', 'Other'].includes(gender)) {
        return { ok: false, status: 400, message: 'Gender must be Male, Female, or Other.' };
    }

    if (!regionId || !provinceId || !cityId) {
        return {
            ok: false,
            status: 400,
            message: 'Region, province, and city are required to add a resident.',
        };
    }

    const contact = requiredText(ContactNumber);
    if (contact && !/^\d{10,15}$/.test(contact.replace(/\D/g, ''))) {
        return { ok: false, status: 400, message: 'Contact number must be 10-15 digits.' };
    }

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
        contact.replace(/\D/g, '') || null,
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
        return {
            ok: false,
            status: 409,
            message: spMessage || 'A resident with similar details already exists.',
        };
    }

    if (!resident) {
        return {
            ok: false,
            status: 500,
            message: spMessage || 'Resident could not be saved. Please try again.',
        };
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

    return { ok: true, resident };
};

export const addResident = async (req, res) => {
    try {
        const profileImage = req.file ? `/uploads/user_profile/${req.file.filename}` : null;
        const result = await createResidentRecord(req.body, profileImage);

        if (!result.ok) {
            return res.status(result.status || 400).json({ message: result.message });
        }

        res.status(201).json({
            message: 'Resident added successfully',
            residentId: result.resident.resident_id,
            resident: result.resident,
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

const EXCEL_TEMPLATE_HEADERS = [
    'First Name',
    'Last Name',
    'Middle Name',
    'Suffix',
    'Birthday',
    'Birth Place',
    'Occupation',
    'Civil Status',
    'Gender',
    "Father's Name",
    "Mother's Name",
    'Address',
    'Purok',
    'Resident Type',
    'Local Resident',
    'Contact Number',
    'Email',
    'Household Head',
    'Household ID',
    'Registered Voter',
    'Voter ID',
    'One Bataan Member',
    'One Bataan ID',
    'PWD',
    'PWD ID',
    'Solo Parent',
    'Solo Parent ID',
];

const HEADER_FIELD_MAP = {
    first_name: 'FirstName',
    firstname: 'FirstName',
    first: 'FirstName',
    last_name: 'LastName',
    lastname: 'LastName',
    last: 'LastName',
    middle_name: 'MiddleName',
    middlename: 'MiddleName',
    middle: 'MiddleName',
    suffix: 'Suffix',
    birthday: 'birthday',
    birth_date: 'birthday',
    birthdate: 'birthday',
    date_of_birth: 'birthday',
    dob: 'birthday',
    birth_place: 'BirthPlace',
    birthplace: 'BirthPlace',
    place_of_birth: 'BirthPlace',
    occupation: 'Occupation',
    civil_status: 'CivilStatus',
    civilstatus: 'CivilStatus',
    gender: 'Gender',
    sex: 'Gender',
    address: 'Address',
    house_no: 'Address',
    house_number: 'Address',
    purok: 'Purok',
    purok_name: 'Purok',
    contact_number: 'ContactNumber',
    contact: 'ContactNumber',
    phone: 'ContactNumber',
    mobile: 'ContactNumber',
    email: 'Email',
    resident_type: 'ResidentType',
    local_resident: 'IsLocalResident',
    is_local_resident: 'IsLocalResident',
    father_name: 'FatherName',
    fathers_name: 'FatherName',
    father: 'FatherName',
    mother_name: 'MotherName',
    mothers_name: 'MotherName',
    mother: 'MotherName',
    household_head: 'IsHouseholdHead',
    is_household_head: 'IsHouseholdHead',
    household_id: 'HouseholdID',
    registered_voter: 'IsRegisteredVoter',
    is_registered_voter: 'IsRegisteredVoter',
    voter_id: 'VoterIDNumber',
    voter_id_number: 'VoterIDNumber',
    one_bataan_member: 'IsJuanBataanMember',
    juan_bataan_member: 'IsJuanBataanMember',
    is_juan_bataan_member: 'IsJuanBataanMember',
    one_bataan_id: 'JuanBataanID',
    juan_bataan_id: 'JuanBataanID',
    pwd: 'IsPWD',
    is_pwd: 'IsPWD',
    pwd_id: 'PWDID',
    solo_parent: 'IsSoloParent',
    is_solo_parent: 'IsSoloParent',
    solo_parent_id: 'SoloParentID',
};

const normalizeHeaderKey = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const cellText = (value) => {
    if (value === undefined || value === null) return '';
    if (value instanceof Date) return toDateOnly(value) || '';
    return String(value).trim();
};

const normalizeGender = (value) => {
    const raw = cellText(value).toLowerCase();
    if (['male', 'm', 'lalaki'].includes(raw)) return 'Male';
    if (['female', 'f', 'babae'].includes(raw)) return 'Female';
    if (['other', 'others'].includes(raw)) return 'Other';
    if (['Male', 'Female', 'Other'].includes(cellText(value))) return cellText(value);
    return cellText(value);
};

const normalizeCivilStatus = (value) => {
    const raw = cellText(value).toLowerCase();
    if (raw === 'single') return 'Single';
    if (raw === 'married') return 'Married';
    if (raw === 'widowed') return 'Widowed';
    if (raw === 'divorced') return 'Divorced';
    return cellText(value);
};

const mapExcelRow = (row) => {
    const mapped = {};
    Object.entries(row || {}).forEach(([header, value]) => {
        const field = HEADER_FIELD_MAP[normalizeHeaderKey(header)];
        if (field) mapped[field] = value;
    });
    return mapped;
};

const rowIsEmpty = (mapped) => {
    return !cellText(mapped.FirstName) && !cellText(mapped.LastName) && !cellText(mapped.Address);
};

export const downloadResidentTemplate = async (_req, res) => {
    try {
        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS]);
        XLSX.utils.book_append_sheet(workbook, sheet, 'Residents');

        const instructionSheet = XLSX.utils.aoa_to_sheet([
            ['Resident Excel Upload Instructions'],
            [''],
            ['Required columns: First Name, Last Name, Birthday (YYYY-MM-DD), Gender (Male/Female/Other), Address, Contact Number'],
            ['Birthday format: YYYY-MM-DD, for example 1990-01-15'],
            ['Gender: Male, Female, or Other'],
            ['Civil Status: Single, Married, Widowed, or Divorced'],
            ['Yes/No columns: Local Resident, Household Head, Registered Voter, One Bataan Member, PWD, Solo Parent'],
            ['Purok must match an existing purok name in the current barangay'],
            ['Format Contact Number as text in Excel so leading zeros are kept'],
            ['Location (region, province, city, barangay) is taken from the logged-in user'],
        ]);
        XLSX.utils.book_append_sheet(workbook, instructionSheet, 'Instructions');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="resident-upload-template.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error creating resident template:', error);
        res.status(500).json({ message: 'Failed to create Excel template' });
    }
};

export const uploadResidentsFromExcel = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'Please upload an Excel file (.xlsx or .xls).' });
        }

        const barangayId = toNullableInt(req.body.barangay_id || req.user_data?.barangay_id);
        const regionId = toNullableInt(req.body.region_id || req.user_data?.region_id);
        const provinceId = toNullableInt(req.body.province_id || req.user_data?.province_id);
        const cityId = toNullableInt(req.body.city_id || req.user_data?.city_id);

        if (!barangayId || !regionId || !provinceId || !cityId) {
            return res.status(400).json({
                message: 'Your session is missing location details. Please log in again.',
            });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames.find((name) => name.toLowerCase() !== 'instructions')
            || workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

        if (!rows.length) {
            return res.status(400).json({ message: 'The Excel file has no resident rows to upload.' });
        }

        if (rows.length > 2000) {
            return res.status(400).json({ message: 'Please upload 2000 residents or fewer per file.' });
        }

        const purokRows = await queryAsync(
            'SELECT iid, iname FROM ph_puroks WHERE barangay_id = ?',
            [barangayId]
        );
        const purokMap = new Map(
            (purokRows || []).map((purok) => [String(purok.iname || '').trim().toLowerCase(), purok.iid])
        );

        let uploaded = 0;
        const failed = [];

        for (let index = 0; index < rows.length; index += 1) {
            const excelRow = index + 2;
            const mapped = mapExcelRow(rows[index]);

            if (rowIsEmpty(mapped)) {
                continue;
            }

            const name = [cellText(mapped.FirstName), cellText(mapped.LastName)].filter(Boolean).join(' ') || `Row ${excelRow}`;
            const contactDigits = cellText(mapped.ContactNumber).replace(/\D/g, '');
            if (!contactDigits) {
                failed.push({
                    row: excelRow,
                    name,
                    reason: 'Contact number is required.',
                });
                continue;
            }

            const purokName = cellText(mapped.Purok);
            let purokId = null;
            if (purokName) {
                purokId = purokMap.get(purokName.toLowerCase()) || null;
                if (!purokId) {
                    failed.push({
                        row: excelRow,
                        name,
                        reason: `Purok not found in this barangay: ${purokName}`,
                    });
                    continue;
                }
            }

            try {
                const result = await createResidentRecord({
                    ...mapped,
                    FirstName: cellText(mapped.FirstName),
                    LastName: cellText(mapped.LastName),
                    MiddleName: cellText(mapped.MiddleName),
                    Suffix: cellText(mapped.Suffix),
                    birthday: toDateOnly(mapped.birthday) || mapped.birthday,
                    BirthPlace: cellText(mapped.BirthPlace),
                    Occupation: cellText(mapped.Occupation),
                    CivilStatus: normalizeCivilStatus(mapped.CivilStatus),
                    Gender: normalizeGender(mapped.Gender),
                    Address: cellText(mapped.Address),
                    Region_ID: regionId,
                    Province_ID: provinceId,
                    City_ID: cityId,
                    Barangay_ID: barangayId,
                    Purok_ID: purokId,
                    IsLocalResident: mapped.IsLocalResident,
                    ResidentType: cellText(mapped.ResidentType),
                    ContactNumber: contactDigits,
                    Email: cellText(mapped.Email),
                    IsSoloParent: mapped.IsSoloParent,
                    SoloParentID: cellText(mapped.SoloParentID),
                    IsPWD: mapped.IsPWD,
                    PWDID: cellText(mapped.PWDID),
                    IsHouseholdHead: mapped.IsHouseholdHead,
                    HouseholdID: cellText(mapped.HouseholdID),
                    IsRegisteredVoter: mapped.IsRegisteredVoter,
                    VoterIDNumber: cellText(mapped.VoterIDNumber),
                    IsJuanBataanMember: mapped.IsJuanBataanMember,
                    JuanBataanID: cellText(mapped.JuanBataanID),
                    FatherName: cellText(mapped.FatherName),
                    MotherName: cellText(mapped.MotherName),
                });

                if (result.ok) {
                    uploaded += 1;
                } else {
                    failed.push({
                        row: excelRow,
                        name,
                        reason: result.message || 'Failed to save resident.',
                    });
                }
            } catch (error) {
                failed.push({
                    row: excelRow,
                    name,
                    reason: error.message || 'Unexpected error while saving this row.',
                });
            }
        }

        if (uploaded === 0 && failed.length === 0) {
            return res.status(400).json({ message: 'The Excel file has no valid resident rows to upload.' });
        }

        res.json({
            message: `${uploaded} resident${uploaded === 1 ? '' : 's'} uploaded, ${failed.length} failed.`,
            uploaded,
            failed: failed.length,
            failures: failed,
            totalRows: rows.length,
        });
    } catch (error) {
        console.error('Error uploading residents from Excel:', error);
        res.status(500).json({
            message: error.message || 'Failed to upload residents from Excel.',
        });
    }
};


