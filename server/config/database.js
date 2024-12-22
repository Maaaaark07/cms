import mysql from 'mysql';

const db = mysql.createConnection({
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: 'DuSt3YVgJ2',
    database: 'dbcbs',
});

db.connect((err) => {
    if (err) console.log("Database Error");
    return console.log("Connected")
});

export default db;