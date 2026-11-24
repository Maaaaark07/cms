import fs from 'fs';
import path from 'path';
import { queryAsync } from '../config/database.js';

let tableReady = false;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS cbs_resolutions (
    resolution_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    resolution_date DATE NOT NULL,
    description TEXT NULL,
    attachment_path VARCHAR(500) NULL,
    attachment_name VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Saved',
    barangay_id INT NOT NULL,
    city_id INT NULL,
    province_id INT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resolution_barangay (barangay_id),
    INDEX idx_resolution_city (city_id),
    INDEX idx_resolution_status (status)
)`;

const ensureTable = async () => {
    if (tableReady) return;
    await queryAsync(CREATE_TABLE_SQL);
    tableReady = true;
};

const toNullableInt = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const requiredText = (value) => String(value ?? '').trim();

const toDateOnly = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const mapResolution = (row) => ({
    resolution_id: row.resolution_id,
    title: row.title,
    resolution_date: row.resolution_date,
    description: row.description || '',
    attachment_path: row.attachment_path,
    attachment_name: row.attachment_name,
    status: row.status,
    barangay_id: row.barangay_id,
    barangay: row.barangay || null,
    city_id: row.city_id,
    province_id: row.province_id,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
});

const getLocalFilePath = (attachmentPath) => {
    if (!attachmentPath) return null;
    const relative = String(attachmentPath).replace(/^\/+/, '');
    return path.join(process.cwd(), relative);
};

const removeFileIfExists = (attachmentPath) => {
    const filePath = getLocalFilePath(attachmentPath);
    if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const getResolutionById = async (resolutionId) => {
    const rows = await queryAsync(
        `SELECT r.*, b.iname AS barangay
         FROM cbs_resolutions r
         LEFT JOIN ph_barangays b ON b.iid = r.barangay_id
         WHERE r.resolution_id = ?
         LIMIT 1`,
        [resolutionId]
    );
    return rows[0] || null;
};

const canAccessResolution = (req, row) => {
    const lguType = Number(req.user_data?.lgu_type_id) || 1;
    const barangayId = toNullableInt(req.user_data?.barangay_id);
    const cityId = toNullableInt(req.user_data?.city_id);

    if (lguType === 2) {
        return Number(row.city_id) === Number(cityId) && ['Submitted', 'Approved'].includes(row.status);
    }
    if (lguType === 3) {
        return false;
    }
    return Number(row.barangay_id) === Number(barangayId);
};

export const listResolutions = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        const barangayId = toNullableInt(req.query.barangay_id || req.user_data?.barangay_id);
        const cityId = toNullableInt(req.query.city_id || req.user_data?.city_id);

        let sql = `SELECT r.*, b.iname AS barangay
                   FROM cbs_resolutions r
                   LEFT JOIN ph_barangays b ON b.iid = r.barangay_id`;
        const params = [];

        if (lguType === 2) {
            if (!cityId) {
                return res.status(400).json({ message: 'City is required to list submitted resolutions.' });
            }
            sql += " WHERE r.city_id = ? AND r.status IN ('Submitted', 'Approved')";
            params.push(cityId);
        } else {
            if (!barangayId) {
                return res.status(400).json({ message: 'Barangay is required to list resolutions.' });
            }
            sql += ' WHERE r.barangay_id = ?';
            params.push(barangayId);
        }

        sql += ' ORDER BY r.resolution_date DESC, r.resolution_id DESC';
        const rows = await queryAsync(sql, params);
        res.json(rows.map(mapResolution));
    } catch (error) {
        console.error('Error listing resolutions:', error);
        res.status(500).json({ message: 'Failed to retrieve resolutions', error: error.message });
    }
};

export const listCityResolutions = async (req, res) => {
    try {
        await ensureTable();
        const cityId = toNullableInt(req.params.id || req.user_data?.city_id);
        if (!cityId) {
            return res.status(400).json({ message: 'City is required.' });
        }

        const rows = await queryAsync(
            `SELECT r.*, b.iname AS barangay
             FROM cbs_resolutions r
             LEFT JOIN ph_barangays b ON b.iid = r.barangay_id
             WHERE r.city_id = ? AND r.status IN ('Submitted', 'Approved')
             ORDER BY FIELD(r.status, 'Submitted', 'Approved'), r.resolution_date DESC, r.resolution_id DESC`,
            [cityId]
        );
        res.json(rows.map(mapResolution));
    } catch (error) {
        console.error('Error listing city resolutions:', error);
        res.status(500).json({ message: 'Failed to retrieve submitted resolutions', error: error.message });
    }
};

export const getResolution = async (req, res) => {
    try {
        await ensureTable();
        const resolution = await getResolutionById(req.params.id);
        if (!resolution) {
            return res.status(404).json({ message: 'Resolution not found.' });
        }
        if (!canAccessResolution(req, resolution)) {
            return res.status(403).json({ message: 'You do not have access to this resolution.' });
        }
        res.json(mapResolution(resolution));
    } catch (error) {
        console.error('Error fetching resolution:', error);
        res.status(500).json({ message: 'Failed to retrieve resolution', error: error.message });
    }
};

const saveResolutionRecord = async (req, existing = null) => {
    const title = requiredText(req.body.title);
    const description = requiredText(req.body.description);
    const resolutionDate = toDateOnly(req.body.resolution_date);
    const requestedStatus = requiredText(req.body.status) === 'Submitted' ? 'Submitted' : 'Saved';
    const barangayId = toNullableInt(req.body.barangay_id || req.user_data?.barangay_id);
    let cityId = toNullableInt(req.body.city_id || req.user_data?.city_id);
    let provinceId = toNullableInt(req.body.province_id || req.user_data?.province_id);
    const removeAttachment = String(req.body.remove_attachment || '') === '1';

    if (barangayId && !cityId) {
        const barangayRows = await queryAsync('SELECT city_id FROM ph_barangays WHERE iid = ? LIMIT 1', [barangayId]);
        cityId = toNullableInt(barangayRows[0]?.city_id);
    }
    if (cityId && !provinceId) {
        const cityRows = await queryAsync('SELECT province_id FROM ph_cities WHERE iid = ? LIMIT 1', [cityId]);
        provinceId = toNullableInt(cityRows[0]?.province_id);
    }

    if (!title || !resolutionDate) {
        return { ok: false, status: 400, message: 'Title and date are required.' };
    }
    if (!barangayId) {
        return { ok: false, status: 400, message: 'Barangay is required to save a resolution.' };
    }

    let attachmentPath = existing?.attachment_path || null;
    let attachmentName = existing?.attachment_name || null;

    if (removeAttachment && attachmentPath) {
        removeFileIfExists(attachmentPath);
        attachmentPath = null;
        attachmentName = null;
    }

    if (req.file) {
        if (attachmentPath) removeFileIfExists(attachmentPath);
        attachmentPath = `/uploads/resolutions/${req.file.filename}`;
        attachmentName = req.file.originalname;
    }

    const status = ['Submitted', 'Approved'].includes(existing?.status)
        ? existing.status
        : requestedStatus;

    if (existing) {
        await queryAsync(
            `UPDATE cbs_resolutions
             SET title = ?, resolution_date = ?, description = ?, attachment_path = ?,
                 attachment_name = ?, status = ?, city_id = ?, province_id = ?
             WHERE resolution_id = ?`,
            [
                title,
                resolutionDate,
                description || null,
                attachmentPath,
                attachmentName,
                status,
                cityId,
                provinceId,
                existing.resolution_id,
            ]
        );
        return { ok: true, resolutionId: existing.resolution_id, status };
    }

    const result = await queryAsync(
        `INSERT INTO cbs_resolutions
            (title, resolution_date, description, attachment_path, attachment_name, status,
             barangay_id, city_id, province_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title,
            resolutionDate,
            description || null,
            attachmentPath,
            attachmentName,
            requestedStatus,
            barangayId,
            cityId,
            provinceId,
            toNullableInt(req.user_data?.user_id),
        ]
    );

    return { ok: true, resolutionId: result.insertId, status: requestedStatus };
};

export const addResolution = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        if (lguType !== 1) {
            return res.status(403).json({ message: 'Only barangay users can create resolutions.' });
        }

        const result = await saveResolutionRecord(req);
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        const resolution = await getResolutionById(result.resolutionId);
        res.status(201).json({
            message: result.status === 'Submitted' ? 'Resolution submitted successfully.' : 'Resolution saved successfully.',
            resolution: mapResolution(resolution),
        });
    } catch (error) {
        console.error('Error adding resolution:', error);
        res.status(500).json({ message: 'Failed to save resolution', error: error.message });
    }
};

export const updateResolution = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        if (lguType !== 1) {
            return res.status(403).json({ message: 'Only barangay users can update resolutions.' });
        }

        const existing = await getResolutionById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Resolution not found.' });
        }
        if (!canAccessResolution(req, existing)) {
            return res.status(403).json({ message: 'You do not have access to this resolution.' });
        }
        if (existing.status === 'Approved') {
            return res.status(400).json({ message: 'Approved resolutions cannot be updated.' });
        }

        const result = await saveResolutionRecord(req, existing);
        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        const resolution = await getResolutionById(result.resolutionId);
        res.json({
            message: result.status === 'Submitted' ? 'Resolution submitted successfully.' : 'Resolution updated successfully.',
            resolution: mapResolution(resolution),
        });
    } catch (error) {
        console.error('Error updating resolution:', error);
        res.status(500).json({ message: 'Failed to update resolution', error: error.message });
    }
};

export const removeResolutionAttachment = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        if (lguType !== 1) {
            return res.status(403).json({ message: 'Only barangay users can remove attachments.' });
        }

        const existing = await getResolutionById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Resolution not found.' });
        }
        if (!canAccessResolution(req, existing)) {
            return res.status(403).json({ message: 'You do not have access to this resolution.' });
        }

        removeFileIfExists(existing.attachment_path);
        await queryAsync(
            `UPDATE cbs_resolutions
             SET attachment_path = NULL, attachment_name = NULL
             WHERE resolution_id = ?`,
            [existing.resolution_id]
        );

        const resolution = await getResolutionById(existing.resolution_id);
        res.json({
            message: 'Attachment removed.',
            resolution: mapResolution(resolution),
        });
    } catch (error) {
        console.error('Error removing resolution attachment:', error);
        res.status(500).json({ message: 'Failed to remove attachment', error: error.message });
    }
};

export const approveResolution = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        if (lguType !== 2) {
            return res.status(403).json({ message: 'Only municipality users can approve resolutions.' });
        }

        const existing = await getResolutionById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Resolution not found.' });
        }
        if (Number(existing.city_id) !== Number(req.user_data?.city_id)) {
            return res.status(403).json({ message: 'You do not have access to this resolution.' });
        }
        if (existing.status !== 'Submitted') {
            return res.status(400).json({ message: 'Only submitted resolutions can be approved.' });
        }

        await queryAsync(
            `UPDATE cbs_resolutions SET status = 'Approved' WHERE resolution_id = ?`,
            [existing.resolution_id]
        );

        const resolution = await getResolutionById(existing.resolution_id);
        res.json({
            message: 'Resolution approved successfully.',
            resolution: mapResolution(resolution),
        });
    } catch (error) {
        console.error('Error approving resolution:', error);
        res.status(500).json({ message: 'Failed to approve resolution', error: error.message });
    }
};

export const deleteResolution = async (req, res) => {
    try {
        await ensureTable();
        const lguType = Number(req.user_data?.lgu_type_id) || 1;
        if (lguType !== 1) {
            return res.status(403).json({ message: 'Only barangay users can delete resolutions.' });
        }

        const existing = await getResolutionById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Resolution not found.' });
        }
        if (!canAccessResolution(req, existing)) {
            return res.status(403).json({ message: 'You do not have access to this resolution.' });
        }
        if (['Submitted', 'Approved'].includes(existing.status)) {
            return res.status(400).json({ message: `${existing.status} resolutions cannot be deleted.` });
        }

        removeFileIfExists(existing.attachment_path);
        await queryAsync('DELETE FROM cbs_resolutions WHERE resolution_id = ?', [existing.resolution_id]);
        res.json({ message: 'Resolution deleted successfully.' });
    } catch (error) {
        console.error('Error deleting resolution:', error);
        res.status(500).json({ message: 'Failed to delete resolution', error: error.message });
    }
};
