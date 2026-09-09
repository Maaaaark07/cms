import { queryAsync } from '../config/database.js';

let tableReady = false;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS cbs_medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    barangay_id INT NULL,
    visit_date DATETIME NOT NULL,
    recorded_by INT NULL,
    blood_pressure VARCHAR(20) NULL,
    heart_rate INT NULL,
    temperature DECIMAL(4,1) NULL,
    respiratory_rate INT NULL,
    oxygen_saturation DECIMAL(5,2) NULL,
    height_cm DECIMAL(6,2) NULL,
    weight_kg DECIMAL(6,2) NULL,
    bmi DECIMAL(5,2) NULL,
    blood_sugar DECIMAL(6,2) NULL,
    chief_complaint TEXT NULL,
    symptoms TEXT NULL,
    diagnosis TEXT NULL,
    treatment TEXT NULL,
    medication TEXT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_medical_resident (resident_id),
    INDEX idx_medical_barangay (barangay_id),
    INDEX idx_medical_visit (visit_date)
)`;

const emptyToNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return value;
};

const toNumberOrNull = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toMySqlDateTime = (value) => {
    if (!value) {
        const now = new Date();
        return toMySqlDateTime(now);
    }

    if (typeof value === 'string') {
        const localMatch = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?/);
        if (localMatch && !value.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(value)) {
            return `${localMatch[1]} ${localMatch[2]}:${localMatch[3] || '00'}`;
        }
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const ensureTable = async () => {
    if (tableReady) return;
    await queryAsync(CREATE_TABLE_SQL);
    tableReady = true;
};

const getResidentsByBarangay = async (barangayId) => {
    const results = await queryAsync('CALL GetAllResidents(?)', [barangayId]);
    return results[0] || [];
};

const getLatestRecordId = async (residentId) => {
    const rows = await queryAsync(
        `SELECT MAX(record_id) AS record_id
         FROM cbs_medical_records
         WHERE resident_id = ?`,
        [residentId]
    );
    return rows[0]?.record_id ?? null;
};

const mapRecord = (record, currentId) => ({
    ...record,
    is_current: record.record_id === currentId,
});

export const getHealthResidents = async (req, res) => {
    const { id } = req.params;

    try {
        await ensureTable();
        const residents = await getResidentsByBarangay(id);
        const latestRecords = await queryAsync(
            `SELECT r.*
             FROM cbs_medical_records r
             INNER JOIN (
                SELECT resident_id, MAX(record_id) AS max_id
                FROM cbs_medical_records
                WHERE barangay_id = ?
                GROUP BY resident_id
             ) latest ON latest.max_id = r.record_id`,
            [id]
        );

        const recordsByResident = new Map(
            (latestRecords || []).map((record) => [String(record.resident_id), record])
        );

        const payload = residents.map((resident) => {
            const lastRecord = recordsByResident.get(String(resident.resident_id));
            return {
                ...resident,
                last_visit_date: lastRecord?.visit_date || null,
                last_blood_pressure: lastRecord?.blood_pressure || null,
                last_heart_rate: lastRecord?.heart_rate || null,
                last_temperature: lastRecord?.temperature || null,
                last_chief_complaint: lastRecord?.chief_complaint || null,
                last_diagnosis: lastRecord?.diagnosis || null,
                last_record_id: lastRecord?.record_id || null,
                has_medical_record: Boolean(lastRecord),
            };
        });

        res.json(payload);
    } catch (error) {
        console.error('Error fetching health residents:', error);
        res.status(500).json({ message: 'Failed to retrieve health center residents', error: error.message });
    }
};

export const getRecordsByResident = async (req, res) => {
    const { residentId } = req.params;
    const barangayId = req.query.barangay_id || req.user_data?.barangay_id;

    try {
        await ensureTable();
        const records = await queryAsync(
            `SELECT *
             FROM cbs_medical_records
             WHERE resident_id = ?
             ORDER BY record_id DESC`,
            [residentId]
        );
        const currentId = records[0]?.record_id ?? null;
        const lookupBarangay = records[0]?.barangay_id || barangayId;
        const residents = lookupBarangay ? await getResidentsByBarangay(lookupBarangay) : [];
        const resident = residents.find((row) => String(row.resident_id) === String(residentId)) || null;

        res.json({
            resident,
            records: records.map((record) => mapRecord(record, currentId)),
        });
    } catch (error) {
        console.error('Error fetching medical records:', error);
        res.status(500).json({ message: 'Failed to retrieve medical records', error: error.message });
    }
};

export const getRecordById = async (req, res) => {
    const { recordId } = req.params;

    try {
        await ensureTable();
        const rows = await queryAsync(
            'SELECT * FROM cbs_medical_records WHERE record_id = ?',
            [recordId]
        );
        const record = rows[0];
        if (!record) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        const currentId = await getLatestRecordId(record.resident_id);
        const residents = record.barangay_id ? await getResidentsByBarangay(record.barangay_id) : [];
        const resident = residents.find((row) => String(row.resident_id) === String(record.resident_id)) || null;

        res.json({
            resident,
            record: mapRecord(record, currentId),
        });
    } catch (error) {
        console.error('Error fetching medical record:', error);
        res.status(500).json({ message: 'Failed to retrieve medical record', error: error.message });
    }
};

export const addMedicalRecord = async (req, res) => {
    try {
        await ensureTable();
        const {
            resident_id,
            barangay_id,
            visit_date,
            blood_pressure,
            heart_rate,
            temperature,
            respiratory_rate,
            oxygen_saturation,
            height_cm,
            weight_kg,
            bmi,
            blood_sugar,
            chief_complaint,
            symptoms,
            diagnosis,
            treatment,
            medication,
            notes,
        } = req.body;

        if (!resident_id) {
            return res.status(400).json({ message: 'Resident is required' });
        }

        const sql = `INSERT INTO cbs_medical_records (
            resident_id, barangay_id, visit_date, recorded_by,
            blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation,
            height_cm, weight_kg, bmi, blood_sugar,
            chief_complaint, symptoms, diagnosis, treatment, medication, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            resident_id,
            barangay_id || req.user_data?.barangay_id || null,
            toMySqlDateTime(visit_date),
            req.user_data?.user_id || null,
            emptyToNull(blood_pressure),
            toNumberOrNull(heart_rate),
            toNumberOrNull(temperature),
            toNumberOrNull(respiratory_rate),
            toNumberOrNull(oxygen_saturation),
            toNumberOrNull(height_cm),
            toNumberOrNull(weight_kg),
            toNumberOrNull(bmi),
            toNumberOrNull(blood_sugar),
            emptyToNull(chief_complaint),
            emptyToNull(symptoms),
            emptyToNull(diagnosis),
            emptyToNull(treatment),
            emptyToNull(medication),
            emptyToNull(notes),
        ];

        const result = await queryAsync(sql, values);
        res.status(201).json({
            message: 'Medical record added successfully',
            recordId: result.insertId,
        });
    } catch (error) {
        console.error('Error adding medical record:', error);
        res.status(500).json({ message: 'Failed to add medical record', error: error.message });
    }
};

export const updateMedicalRecord = async (req, res) => {
    const { recordId } = req.params;

    try {
        await ensureTable();
        const existingRows = await queryAsync(
            'SELECT * FROM cbs_medical_records WHERE record_id = ?',
            [recordId]
        );
        const existing = existingRows[0];
        if (!existing) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        const currentId = await getLatestRecordId(existing.resident_id);
        if (String(currentId) !== String(recordId)) {
            return res.status(403).json({ message: 'Only the current medical record can be edited' });
        }

        const {
            visit_date,
            blood_pressure,
            heart_rate,
            temperature,
            respiratory_rate,
            oxygen_saturation,
            height_cm,
            weight_kg,
            bmi,
            blood_sugar,
            chief_complaint,
            symptoms,
            diagnosis,
            treatment,
            medication,
            notes,
        } = req.body;

        const sql = `UPDATE cbs_medical_records SET
            visit_date = ?,
            blood_pressure = ?,
            heart_rate = ?,
            temperature = ?,
            respiratory_rate = ?,
            oxygen_saturation = ?,
            height_cm = ?,
            weight_kg = ?,
            bmi = ?,
            blood_sugar = ?,
            chief_complaint = ?,
            symptoms = ?,
            diagnosis = ?,
            treatment = ?,
            medication = ?,
            notes = ?
            WHERE record_id = ?`;

        await queryAsync(sql, [
            toMySqlDateTime(visit_date || existing.visit_date),
            emptyToNull(blood_pressure),
            toNumberOrNull(heart_rate),
            toNumberOrNull(temperature),
            toNumberOrNull(respiratory_rate),
            toNumberOrNull(oxygen_saturation),
            toNumberOrNull(height_cm),
            toNumberOrNull(weight_kg),
            toNumberOrNull(bmi),
            toNumberOrNull(blood_sugar),
            emptyToNull(chief_complaint),
            emptyToNull(symptoms),
            emptyToNull(diagnosis),
            emptyToNull(treatment),
            emptyToNull(medication),
            emptyToNull(notes),
            recordId,
        ]);

        res.json({ message: 'Medical record updated successfully' });
    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({ message: 'Failed to update medical record', error: error.message });
    }
};
