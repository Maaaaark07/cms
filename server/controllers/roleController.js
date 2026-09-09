import { queryAsync } from '../config/database.js';
import { PAGE_CATALOG, ALL_PAGE_KEYS, isValidPageKey } from '../config/pages.js';

let tablesReady = false;

const CREATE_ROLES_SQL = `
CREATE TABLE IF NOT EXISTS cbs_app_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    lgu_type_id INT NULL,
    barangay_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_app_roles_barangay (barangay_id),
    INDEX idx_app_roles_lgu (lgu_type_id)
)`;

const CREATE_ROLE_PAGES_SQL = `
CREATE TABLE IF NOT EXISTS cbs_app_role_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    page_key VARCHAR(80) NOT NULL,
    UNIQUE KEY uniq_role_page (role_id, page_key),
    INDEX idx_role_pages_role (role_id)
)`;

const CREATE_USER_ROLES_SQL = `
CREATE TABLE IF NOT EXISTS cbs_user_app_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id),
    INDEX idx_user_app_role (role_id)
)`;

export const ensureRoleTables = async () => {
    if (tablesReady) return;
    await queryAsync(CREATE_ROLES_SQL);
    await queryAsync(CREATE_ROLE_PAGES_SQL);
    await queryAsync(CREATE_USER_ROLES_SQL);
    tablesReady = true;
};

const normalizePages = (pages) => {
    const unique = [...new Set((Array.isArray(pages) ? pages : [])
        .map((key) => String(key || '').trim())
        .filter((key) => key && isValidPageKey(key)))];

    if (!unique.includes('home')) {
        unique.unshift('home');
    }

    return unique;
};

const mapRoleRow = (row) => ({
    role_id: row.role_id,
    iid: `custom-${row.role_id}`,
    iname: row.role_name,
    role_name: row.role_name,
    description: row.description || '',
    lgu_type_id: row.lgu_type_id,
    barangay_id: row.barangay_id,
    is_custom: true,
    pages: row.page_keys
        ? String(row.page_keys).split(',').map((key) => key.trim()).filter(Boolean)
        : [],
});

const getRoleById = async (roleId) => {
        const rows = await queryAsync(
        `SELECT r.role_id, r.role_name, r.description, r.lgu_type_id, r.barangay_id,
                GROUP_CONCAT(p.page_key) AS page_keys
         FROM cbs_app_roles r
         LEFT JOIN cbs_app_role_pages p ON p.role_id = r.role_id
         WHERE r.role_id = ?
         GROUP BY r.role_id, r.role_name, r.description, r.lgu_type_id, r.barangay_id`,
        [roleId]
    );
    return rows[0] ? mapRoleRow(rows[0]) : null;
};

export const parseCustomRoleId = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const raw = String(value);
    const customMatch = raw.match(/^custom-(\d+)$/i);
    if (customMatch) return Number(customMatch[1]);
    return null;
};

export const getFallbackSystemRoleId = async (lguTypeId) => {
    const parsed = parseInt(lguTypeId, 10);
    if (![1, 2, 3].includes(parsed)) return 2;

    try {
        const results = await queryAsync('CALL getCBSUserRoles(?)', [parsed]);
        const rows = results[0] || [];
        const first = rows[0];
        return first?.iid ?? first?.role_id ?? first?.id ?? 2;
    } catch (error) {
        console.error('Failed to load fallback system role:', error);
        return 2;
    }
};

export const findUserIdByUsername = async (username) => {
    const queries = [
        'SELECT * FROM cbs_users WHERE `user` = ? ORDER BY 1 DESC LIMIT 1',
        'SELECT * FROM cbs_users WHERE username = ? ORDER BY 1 DESC LIMIT 1',
    ];

    for (const sql of queries) {
        try {
            const rows = await queryAsync(sql, [username]);
            const row = rows[0];
            if (row) return row.user_id ?? row.userid ?? row.id ?? null;
        } catch (error) {
            // Column names can differ between environments; try the next query.
        }
    }

    return null;
};

export const assignAppRoleToUser = async (userId, roleId) => {
    await ensureRoleTables();
    if (!userId) return;

    if (!roleId) {
        await queryAsync('DELETE FROM cbs_user_app_roles WHERE user_id = ?', [userId]);
        return;
    }

    const role = await getRoleById(roleId);
    if (!role) {
        throw new Error('Role not found');
    }

    await queryAsync(
        `INSERT INTO cbs_user_app_roles (user_id, role_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)`,
        [userId, roleId]
    );
};

export const attachAppRolesToUsers = async (users = []) => {
    await ensureRoleTables();
    if (!Array.isArray(users) || users.length === 0) return users;

    const userIds = [...new Set(users
        .map((user) => user.userid ?? user.user_id ?? user.id)
        .filter((id) => id !== undefined && id !== null && id !== ''))];

    if (userIds.length === 0) return users;

    const placeholders = userIds.map(() => '?').join(', ');
    const assignments = await queryAsync(
        `SELECT a.user_id, a.role_id AS app_role_id, r.role_name AS app_role_name
         FROM cbs_user_app_roles a
         JOIN cbs_app_roles r ON r.role_id = a.role_id
         WHERE a.user_id IN (${placeholders})`,
        userIds
    );

    const assignmentMap = new Map(
        assignments.map((row) => [Number(row.user_id), row])
    );

    return users.map((user) => {
        const id = user.userid ?? user.user_id ?? user.id;
        const assignment = assignmentMap.get(Number(id));
        if (!assignment) return user;
        return {
            ...user,
            app_role_id: assignment.app_role_id,
            app_role_name: assignment.app_role_name,
            rolename: assignment.app_role_name,
        };
    });
};

export const getPageCatalog = async (_req, res) => {
    res.json({ data: PAGE_CATALOG });
};

export const getAccessPages = async (req, res) => {
    try {
        await ensureRoleTables();
        const userId = req.user_data?.user_id;
        const roleId = Number(req.user_data?.role_id);
        const isCbsAdmin = roleId === 1;

        if (isCbsAdmin) {
            return res.json({
                isCbsAdmin: true,
                hasCustomRole: false,
                pages: ALL_PAGE_KEYS,
            });
        }

        if (!userId) {
            return res.json({
                isCbsAdmin: false,
                hasCustomRole: false,
                pages: ALL_PAGE_KEYS,
            });
        }

        let assignment = await queryAsync(
            'SELECT role_id FROM cbs_user_app_roles WHERE user_id = ? LIMIT 1',
            [userId]
        );

        if (!assignment.length && req.user_data?.user) {
            const mappedUserId = await findUserIdByUsername(req.user_data.user);
            if (mappedUserId && Number(mappedUserId) !== Number(userId)) {
                assignment = await queryAsync(
                    'SELECT role_id FROM cbs_user_app_roles WHERE user_id = ? LIMIT 1',
                    [mappedUserId]
                );
            }
        }

        if (!assignment.length) {
            return res.json({
                isCbsAdmin: false,
                hasCustomRole: false,
                pages: ALL_PAGE_KEYS,
            });
        }

        const pageRows = await queryAsync(
            'SELECT page_key FROM cbs_app_role_pages WHERE role_id = ?',
            [assignment[0].role_id]
        );

        return res.json({
            isCbsAdmin: false,
            hasCustomRole: true,
            pages: normalizePages(pageRows.map((row) => row.page_key)),
        });
    } catch (error) {
        console.error('Failed to load access pages:', error);
        res.status(500).json({ error: 'Failed to load access pages' });
    }
};

export const getAppRoles = async (req, res) => {
    try {
        await ensureRoleTables();
        const barangayId = req.query.barangay_id || req.user_data?.barangay_id;
        const lguTypeId = req.query.lgu_type_id || req.user_data?.lgu_type_id;

        if (!barangayId) {
            return res.status(400).json({ error: 'barangay_id is required' });
        }

        const params = [barangayId];
        let sql = `
            SELECT r.role_id, r.role_name, r.description, r.lgu_type_id, r.barangay_id,
                   GROUP_CONCAT(p.page_key) AS page_keys
            FROM cbs_app_roles r
            LEFT JOIN cbs_app_role_pages p ON p.role_id = r.role_id
            WHERE r.barangay_id = ?
        `;

        if (lguTypeId) {
            sql += ' AND (r.lgu_type_id = ? OR r.lgu_type_id IS NULL)';
            params.push(lguTypeId);
        }

        sql += ' GROUP BY r.role_id, r.role_name, r.description, r.lgu_type_id, r.barangay_id ORDER BY r.role_name ASC';

        const rows = await queryAsync(sql, params);
        res.json({ data: rows.map(mapRoleRow) });
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles', details: error.message });
    }
};

export const createAppRole = async (req, res) => {
    try {
        await ensureRoleTables();
        const roleName = String(req.body.role_name || '').trim();
        const description = String(req.body.description || '').trim();
        const barangayId = req.body.barangay_id || req.user_data?.barangay_id;
        const lguTypeId = req.body.lgu_type_id || req.user_data?.lgu_type_id;
        const pages = normalizePages(req.body.pages);

        if (!roleName) {
            return res.status(400).json({ error: 'Role name is required' });
        }
        if (!barangayId) {
            return res.status(400).json({ error: 'barangay_id is required' });
        }
        if (pages.length <= 1) {
            return res.status(400).json({ error: 'Select at least one page besides Dashboard' });
        }

        const result = await queryAsync(
            `INSERT INTO cbs_app_roles (role_name, description, lgu_type_id, barangay_id)
             VALUES (?, ?, ?, ?)`,
            [roleName, description || null, lguTypeId || null, barangayId]
        );

        const roleId = result.insertId;
        if (pages.length) {
            const values = pages.flatMap((key) => [roleId, key]);
            const placeholders = pages.map(() => '(?, ?)').join(', ');
            await queryAsync(
                `INSERT INTO cbs_app_role_pages (role_id, page_key) VALUES ${placeholders}`,
                values
            );
        }

        const role = await getRoleById(roleId);
        res.status(201).json({ message: 'Role created successfully', data: role });
    } catch (error) {
        console.error('Failed to create role:', error);
        res.status(500).json({ error: 'Failed to create role', details: error.message });
    }
};

export const updateAppRole = async (req, res) => {
    try {
        await ensureRoleTables();
        const roleId = Number(req.params.id);
        const existing = await getRoleById(roleId);
        if (!existing) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const roleName = String(req.body.role_name || '').trim();
        const description = String(req.body.description || '').trim();
        const pages = normalizePages(req.body.pages);

        if (!roleName) {
            return res.status(400).json({ error: 'Role name is required' });
        }
        if (pages.length <= 1) {
            return res.status(400).json({ error: 'Select at least one page besides Dashboard' });
        }

        await queryAsync(
            `UPDATE cbs_app_roles
             SET role_name = ?, description = ?
             WHERE role_id = ?`,
            [roleName, description || null, roleId]
        );
        await queryAsync('DELETE FROM cbs_app_role_pages WHERE role_id = ?', [roleId]);

        const values = pages.flatMap((key) => [roleId, key]);
        const placeholders = pages.map(() => '(?, ?)').join(', ');
        await queryAsync(
            `INSERT INTO cbs_app_role_pages (role_id, page_key) VALUES ${placeholders}`,
            values
        );

        const role = await getRoleById(roleId);
        res.json({ message: 'Role updated successfully', data: role });
    } catch (error) {
        console.error('Failed to update role:', error);
        res.status(500).json({ error: 'Failed to update role', details: error.message });
    }
};

export const deleteAppRole = async (req, res) => {
    try {
        await ensureRoleTables();
        const roleId = Number(req.params.id);
        const existing = await getRoleById(roleId);
        if (!existing) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const assigned = await queryAsync(
            'SELECT user_id FROM cbs_user_app_roles WHERE role_id = ? LIMIT 1',
            [roleId]
        );
        if (assigned.length > 0) {
            return res.status(409).json({
                error: 'This role is assigned to a user. Unassign it before deleting.',
            });
        }

        await queryAsync('DELETE FROM cbs_app_role_pages WHERE role_id = ?', [roleId]);
        await queryAsync('DELETE FROM cbs_app_roles WHERE role_id = ?', [roleId]);
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Failed to delete role:', error);
        res.status(500).json({ error: 'Failed to delete role', details: error.message });
    }
};

export const assignUserAppRole = async (req, res) => {
    try {
        await ensureRoleTables();
        const userId = Number(req.params.userId);
        const appRoleId = req.body.app_role_id ? Number(req.body.app_role_id) : null;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        await assignAppRoleToUser(userId, appRoleId);
        res.json({ message: 'Role assigned successfully' });
    } catch (error) {
        console.error('Failed to assign role:', error);
        const status = error.message === 'Role not found' ? 404 : 500;
        res.status(status).json({ error: error.message || 'Failed to assign role' });
    }
};
