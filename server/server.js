import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbcbs',
})

app.get('/set-cookie', (req, res) => {
    res.cookie('testCookie', 'testValue', {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
    });
    res.send('Cookie has been set');
});

app.get('/get-cookie', (req, res) => {
    const testCookie = req.cookies.testCookie;
    res.json({ testCookie });
});

db.connect((err) => {
    if (err) console.log("Database Error");
    return console.log("Connected")
})

app.post('/register', (req, res) => {
    const { users, password } = req.body;
    const sql = "INSERT INTO cbs_users (`users`, `password`) VALUES (?, ?)";
    bcrypt.hash(password, salt, (err, hash) => {
        if (err) return res.json({ Error: "Error hashing password" });

        const values = [users, hash];

        db.query(sql, values, (err, result) => {
            if (err) return res.json({ Error: "Inserting Data error" });
            return res.json({ Status: "Success" });
        });
    });
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "Not authorized" });
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.json({ Error: "Token is not okay" });
        } else {
            console.log(decoded);
            req.user = { users: decoded.users, role: decoded.role };
            next();
        }
    });
};

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: 'Success', user: req.user, role: req.user.role });
});

app.post('/login', (req, res) => {
    const { users, password } = req.body;
    const sql = "SELECT * FROM cbs_users WHERE users = ?";

    db.query(sql, [users], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Database error" });
        }
        if (data.length > 0) {
            bcrypt.compare(password.toString(), data[0].password, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ Error: "Password Compare Error" });
                }
                if (result) {
                    const user = data[0].users;
                    const role = data[0].role;
                    const token = jwt.sign({ users: user, role: role }, "jwt-secret-key", { expiresIn: '1d' });

                    console.log('Generated Token:', token);
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'Lax',
                        path: '/',
                    });
                    return res.json({ Status: "Success" });
                } else {
                    return res.json({ Error: "Invalid password" });
                }
            });
        } else {
            return res.json({ Error: "User not found" });
        }
    });
});

app.get('/registered-voters', verifyUser, (req, res) => {
    const sql = "SELECT COUNT(*) AS NumberOfRegisteredVoters FROM cbs_resident WHERE RegisteredVoter = 1";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfRegisteredVoters = results[0].NumberOfRegisteredVoters;
        return res.json({ NumberOfRegisteredVoters: numberOfRegisteredVoters });
    });
});

// Endpoint to get resident details
app.get('/residents', verifyUser, (req, res) => {
    const sql = `
        SELECT * FROM cbs_resident
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Failed to retrieve resident data' });
        }
        res.json(results);
    });
});

app.post('/add-resident', async (req, res) => {
    const {
        ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender,
        Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID,
        BarangayID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber, VotingPrecinct
    } = req.body;

    if (!FirstName || !LastName || !Age || !Gender || !Address || !ContactNumber) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const query = `
            INSERT INTO cbs_resident 
            (ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender, Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID, BarangayID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber, VotingPrecinct)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [ResidentID, FirstName, LastName, MiddleName, Age, birthday, Gender, Address, ContactNumber, Email, CivilStatus, Occupation, HouseholdID, BarangayID, RegistrationDate, Status, RegisteredVoter, VoterIDNumber, VotingPrecinct];

        await db.query(query, values);
        res.status(201).json({ message: 'Resident added successfully' });
    } catch (error) {
        console.error("Error adding resident:", error);
        res.status(500).json({ message: 'Failed to add resident' });
    }
});


app.get('/home', verifyUser, (req, res) => {
    console.log(req.user);
    return res.json({ Status: 'Success', user: req.user.users, role: req.user.role });
});

app.get('/resident-count', (req, res) => {
    const sql = "SELECT COUNT(*) AS NumberOfResidents FROM cbs_resident";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ Error: "Database error" });
        }

        const numberOfResidents = result[0]?.NumberOfResidents || 0;
        return res.json({ NumberOfResidents: numberOfResidents });
    });
});

app.get('/population-stats', verifyUser, (req, res) => {
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
});

app.get('/blotter', (req, res) => {
    const sql = "SELECT * FROM cbs_blotter ORDER BY incident_date DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ Error: 'Failed to retrieve blotter data' });
        }
        res.json(results);
    });
});

// Delete Residents
app.delete('/residents/:id', (req, res) => {
    const residentId = req.params.id;
    const query = 'DELETE FROM cbs_resident WHERE ResidentID = ?';

    db.query(query, [residentId], (error, results) => {
        if (error) {
            console.error("Error deleting resident:", error);
            return res.status(500).json({ message: 'Error deleting resident' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        res.status(200).json({ message: 'Resident deleted successfully' });
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' });
    return res.json({ Status: "Success" });
});

app.listen(8080, () => {
    console.log('listen')
})