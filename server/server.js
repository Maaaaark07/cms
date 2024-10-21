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
    methods: ["POST", "GET"],
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
    console.log("Cookies received:", req.cookies);
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "Not authorized" });
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.json({ Error: "Token is not okay" });
        } else {
            req.user = decoded.users;
            next();
        }
    });
};

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: 'Success', user: req.user });
});

app.post('/login', (req, res) => {
    const { users, password } = req.body;
    const sql = "SELECT * FROM cbs_users WHERE users = ?";

    db.query(sql, [users], (err, data) => {
        if (err) return res.json({ Error: "Invalid" });
        if (data.length > 0) {
            bcrypt.compare(password.toString(), data[0].password, (err, result) => {
                if (err) return res.json({ Error: "Password Compare Error" });
                if (result) {
                    const users = data[0].users;
                    const token = jwt.sign({ users }, "jwt-secret-key", { expiresIn: '1d' });

                    console.log('Generated Token:', token);

                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'Lax',
                    });
                    return res.json({ Status: "Success" });
                } else {
                    return res.json({ Error: "Password Error" });
                }
            });
        } else {
            return res.json({ Error: "Invalid" });
        }
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" });
})

app.listen(8080, () => {
    console.log('listen')
})