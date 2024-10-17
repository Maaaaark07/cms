import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
const salt = 10;

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbcbs',
})

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

app.listen(8080, () => {
    console.log('listen')
})