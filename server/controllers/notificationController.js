import { queryAsync } from '../config/database.js';
import { getModemStatus, normalizePhNumber, sendSmsMessages } from '../services/sim7600.js';

let logTableReady = false;

const CREATE_LOG_SQL = `
CREATE TABLE IF NOT EXISTS cbs_sms_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_id INT NULL,
    recipient_group VARCHAR(50) NULL,
    phone_number VARCHAR(20) NULL,
    recipient_name VARCHAR(255) NULL,
    message TEXT NULL,
    status VARCHAR(20) NULL,
    error_message TEXT NULL,
    sent_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sms_barangay (barangay_id)
)`;

const extractContact = (row) =>
    row?.contact_number || row?.contact || row?.mobile_number || row?.phone || row?.cellphone || '';

const extractName = (row) => {
    if (row?.full_name) return row.full_name;
    const parts = [row?.first_name, row?.middle_name, row?.last_name, row?.suffix].filter(Boolean);
    if (parts.length) return parts.join(' ');
    return row?.name || row?.iname || 'Unknown';
};

const fromProcedure = async (sql, params) => {
    const results = await queryAsync(sql, params);
    return results[0] || [];
};

const uniqueRecipients = (rows) => {
    const seen = new Set();
    const recipients = [];
    rows.forEach((row) => {
        const phone = normalizePhNumber(extractContact(row));
        if (!phone || seen.has(phone)) return;
        seen.add(phone);
        recipients.push({
            name: extractName(row),
            phone,
        });
    });
    return recipients;
};

const resolveGroupRows = async (group, barangayId) => {
    switch (group) {
        case 'barangay-officials': {
            const officials = await fromProcedure('CALL GetBarangayOfficials(?)', [barangayId]);
            const others = await fromProcedure('CALL GetOtherBrgyOfficials(?)', [barangayId]);
            return [...officials, ...others];
        }
        case 'sk-officials':
            return fromProcedure('CALL GetSKOfficials(?)', [barangayId]);
        case 'pwd':
            return fromProcedure('CALL cbsReportBrgyPWD(?)', [barangayId]);
        case 'solo-parent':
            return fromProcedure('CALL cbsReportBrgySoloParent(?)', [barangayId]);
        case 'senior-citizen':
            return fromProcedure('CALL cbsReportBrgySrCitizen(?)', [barangayId]);
        case 'all': {
            const residents = await fromProcedure('CALL GetAllResidents(?)', [barangayId]);
            const officials = await fromProcedure('CALL GetBarangayOfficials(?)', [barangayId]);
            const sk = await fromProcedure('CALL GetSKOfficials(?)', [barangayId]);
            const others = await fromProcedure('CALL GetOtherBrgyOfficials(?)', [barangayId]);
            return [...residents, ...officials, ...sk, ...others];
        }
        default:
            return [];
    }
};

const ensureLogTable = async () => {
    if (logTableReady) return;
    await queryAsync(CREATE_LOG_SQL);
    logTableReady = true;
};

export const getNotificationModemStatus = async (req, res) => {
    try {
        const status = await getModemStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotificationRecipients = async (req, res) => {
    const { group, id } = req.params;
    const manualNumbers = String(req.query.numbers || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    try {
        if (group === 'manual') {
            const recipients = uniqueRecipients(manualNumbers.map((phone) => ({ contact_number: phone, name: phone })));
            return res.json({ group, count: recipients.length, recipients });
        }

        const rows = await resolveGroupRows(group, id);
        const recipients = uniqueRecipients(rows);
        res.json({ group, count: recipients.length, recipients });
    } catch (error) {
        console.error('Error resolving notification recipients:', error);
        res.status(500).json({ message: 'Failed to load recipients', error: error.message });
    }
};

export const sendNotification = async (req, res) => {
    const { group, message, numbers = [] } = req.body;
    const barangayId = req.body.barangay_id || req.user_data?.barangay_id;

    if (!message || !String(message).trim()) {
        return res.status(400).json({ message: 'Notification message is required' });
    }
    if (!group) {
        return res.status(400).json({ message: 'Recipient group is required' });
    }

    try {
        await ensureLogTable();

        let recipients = [];
        if (group === 'manual') {
            recipients = uniqueRecipients((numbers || []).map((phone) => ({ contact_number: phone, name: phone })));
        } else {
            const rows = await resolveGroupRows(group, barangayId);
            recipients = uniqueRecipients(rows);
        }

        if (!recipients.length) {
            return res.status(400).json({ message: 'No valid mobile numbers found for the selected recipients' });
        }

        const results = await sendSmsMessages(recipients.map((item) => item.phone), message.trim());
        const nameByPhone = new Map(recipients.map((item) => [item.phone, item.name]));

        for (const result of results) {
            await queryAsync(
                `INSERT INTO cbs_sms_logs
                (barangay_id, recipient_group, phone_number, recipient_name, message, status, error_message, sent_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    barangayId || null,
                    group,
                    result.phone,
                    nameByPhone.get(result.phone) || null,
                    message.trim(),
                    result.status,
                    result.error || null,
                    req.user_data?.user_id || null,
                ]
            );
        }

        const sent = results.filter((item) => item.status === 'sent' || item.status === 'simulated').length;
        const failed = results.filter((item) => item.status === 'failed').length;

        res.json({
            message: failed ? 'Notification sent with some failures' : 'Notification sent successfully',
            total: results.length,
            sent,
            failed,
            results: results.map((item) => ({
                ...item,
                name: nameByPhone.get(item.phone) || item.phone,
            })),
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ message: error.message || 'Failed to send notification' });
    }
};
