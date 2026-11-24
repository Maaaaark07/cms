import mysql from 'mysql';
import dotenv from 'dotenv';
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '', // Fallback to empty string
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.log(err);
        console.log("Database Error");
        return;
    }
    console.log("Connected");
});

export const queryAsync = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

export default db;