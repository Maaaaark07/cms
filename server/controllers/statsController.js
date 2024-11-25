import db from '../config/database.js';

export const getRegisteredVoters = (req, res) => {
    const sql = "SELECT COUNT(*) AS NumberOfRegisteredVoters FROM cbs_resident WHERE RegisteredVoter = 1";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfRegisteredVoters = results[0].NumberOfRegisteredVoters;
        return res.json({ NumberOfRegisteredVoters: numberOfRegisteredVoters });
    });
};

export const getPopulationStats = (req, res) => {
    const sql = `
        SELECT 
            COUNT(CASE WHEN gender = 'M' THEN 1 END) AS male,
            COUNT(CASE WHEN gender = 'F' THEN 1 END) AS female,
            COUNT(CASE WHEN age >= 60 THEN 1 END) AS seniorCitizens,
            COUNT(CASE WHEN age < 18 THEN 1 END) AS youth,
            COUNT(*) AS totalPopulation
        FROM cbs_resident
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Database error' });
        }

        const { male, female, seniorCitizens, youth, totalPopulation } = results[0];
        res.json({ male, female, seniorCitizens, youth, totalPopulation });
    });
};

export const getResidentCount = (req, res) => {
    const sql = "SELECT COUNT(*) AS NumberOfResidents FROM cbs_resident";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfResidents = result[0]?.NumberOfResidents || 0;
        return res.json({ NumberOfResidents: numberOfResidents });
    });
};