const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'eroi_secret',
  resave: false,
  saveUninitialized: true
}));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS USERS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    discord TEXT,
    roblox TEXT,
    isAdmin INTEGER DEFAULT 0
  )`);
});

// OWNER ACCOUNT
db.run(
  "INSERT OR IGNORE INTO USERS(username,password,isAdmin) VALUES('Zebrodell','Zebrodell@8676',1)"
);

app.get('/', (req, res) => {
  res.send('EROI Ticket Booking Running 🚆');
});

app.listen(3000, () => {
  console.log('Server running');
});
