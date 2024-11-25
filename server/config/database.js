import mysql from 'mysql';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbcbs',
});

db.connect((err) => {
    if (err) console.log("Database Error");
    return console.log("Connected")
});

export default db;