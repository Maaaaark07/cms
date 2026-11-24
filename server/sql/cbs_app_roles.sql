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
);

CREATE TABLE IF NOT EXISTS cbs_app_role_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    page_key VARCHAR(80) NOT NULL,
    UNIQUE KEY uniq_role_page (role_id, page_key),
    INDEX idx_role_pages_role (role_id)
);

CREATE TABLE IF NOT EXISTS cbs_user_app_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id),
    INDEX idx_user_app_role (role_id)
);
