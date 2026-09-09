export const PAGE_CATALOG = [
    { key: 'home', label: 'Dashboard', paths: ['/home'] },
    { key: 'resident-management', label: 'Resident Management', paths: ['/resident-management'] },
    { key: 'health-center', label: 'Health Center', paths: ['/health-center'] },
    { key: 'application-request', label: 'Application Request', paths: ['/application-request'] },
    { key: 'blotter-report', label: 'Blotter Report', paths: ['/blotter-report'] },
    { key: 'user-management', label: 'User Management', paths: ['/user-management'] },
    { key: 'barangay-official', label: 'Barangay Official', paths: ['/barangay-official'] },
    { key: 'master-data', label: 'Master Data', paths: ['/master-data'] },
    { key: 'reports', label: 'Report', paths: ['/reports'] },
    { key: 'notification-advisory', label: 'Notification Advisory', paths: ['/notification-advisory'] },
];

export const ALL_PAGE_KEYS = PAGE_CATALOG.map((page) => page.key);

export const isValidPageKey = (key) => PAGE_CATALOG.some((page) => page.key === key);

export const pageKeyFromPath = (pathname) => {
    const normalized = String(pathname || '').toLowerCase();
    let match = null;
    let best = 0;

    for (const page of PAGE_CATALOG) {
        for (const path of page.paths) {
            const prefix = path.toLowerCase();
            if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
                if (prefix.length > best) {
                    best = prefix.length;
                    match = page.key;
                }
            }
        }
    }

    return match;
};
