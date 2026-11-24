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
);
