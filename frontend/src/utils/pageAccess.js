export const pageKeyFromPath = (pathname) => {
    const normalized = String(pathname || '').toLowerCase();
    const pages = [
        { key: 'resident-management', prefix: '/resident-management' },
        { key: 'health-center', prefix: '/health-center' },
        { key: 'application-request', prefix: '/application-request' },
        { key: 'blotter-report', prefix: '/blotter-report' },
        { key: 'resolution', prefix: '/resolution' },
        { key: 'user-management', prefix: '/user-management' },
        { key: 'barangay-official', prefix: '/barangay-official' },
        { key: 'master-data', prefix: '/master-data' },
        { key: 'reports', prefix: '/reports' },
        { key: 'notification-advisory', prefix: '/notification-advisory' },
        { key: 'home', prefix: '/home' },
    ];

    let match = null;
    let best = 0;
    for (const page of pages) {
        if (normalized === page.prefix || normalized.startsWith(`${page.prefix}/`)) {
            if (page.prefix.length > best) {
                best = page.prefix.length;
                match = page.key;
            }
        }
    }
    return match;
};
