import db from '../config/database.js';

export const getRegisteredVoters = (req, res) => {
    const { id } = req.params; 
    const sql = "CALL GetRegisteredVoterCount(?)";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfRegisteredVoters = results[0][0].NumberOfRegisteredVoters;
        return res.json({ NumberOfRegisteredVoters: numberOfRegisteredVoters });
    });
};

export const getPopulationStats = (req, res) => {
    const { id } = req.params; 
    const sql = "CALL GetPopulationStats(?)";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Database error' });
        }

        // Stored procedure results are typically wrapped in two layers
        if (results && results[0]) {
            const { male, female, seniorCitizens, youth, totalPopulation } = results[0][0]; // Access the first row of the first result set
            return res.json({ male, female, seniorCitizens, youth, totalPopulation });
        } else {
            return res.status(404).json({ Error: 'No data found' });
        }
    });
};

export const getResidentCount = (req, res) => {
    const { id } = req.params; 
    const sql = "CALL GetResidentsCount(?)";
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfResidents = results[0][0]?.NumberOfResidents || 0;
        return res.json({ NumberOfResidents: numberOfResidents });
    });
};