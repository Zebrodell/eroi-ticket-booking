const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');

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

  // USERS
  db.run(`CREATE TABLE IF NOT EXISTS USERS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    discord TEXT,
    roblox TEXT,
    isAdmin INTEGER DEFAULT 0
  )`);

  // TRAINS
  db.run(`CREATE TABLE IF NOT EXISTS TRAINS(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    fromS TEXT,
    toS TEXT
  )`);

});


// OWNER ACCOUNT
db.run(
  "INSERT OR IGNORE INTO USERS(username,password,isAdmin) VALUES('Zebrodell','Zebrodell@8676',1)"
);

app.get('/', (req, res) => {
  res.redirect('/login');
});

// SHOW LOGIN PAGE
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});

// SHOW SIGNUP PAGE
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/views/signup.html');
});

// LOGIN LOGIC
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM USERS WHERE username=? AND password=?",
    [username, password],
    (err, user) => {
      if (!user) {
        return res.send("❌ Invalid username or password");
      }
      req.session.user = user;
      res.redirect('/dashboard');
    }
  );
});

// SIGNUP LOGIC
app.post('/signup', (req, res) => {
  const { username, password, discord, roblox } = req.body;

  db.run(
    "INSERT INTO USERS(username,password,discord,roblox) VALUES(?,?,?,?)",
    [username, password, discord, roblox],
    () => {
      res.redirect('/login');
    }
  );
});

// DASHBOARD
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  render(res, 'dashboard.html');
});

});

app.listen(3000, () => {
  console.log('Server running');
});

// ADMIN PANEL
app.get('/admin', (req, res) => {
  if (!req.session.user || req.session.user.isAdmin !== 1) {
    return res.send('❌ Access Denied');
  }
  app.get('/admin', (req, res) => {
  if (!req.session.user || req.session.user.isAdmin !== 1) {
    return res.send('❌ Access Denied');
  }
  render(res, 'admin.html');
});

});

// ADD TRAIN (ADMIN ONLY)
app.post('/admin/add-train', (req, res) => {
  if (!req.session.user || req.session.user.isAdmin !== 1) {
    return res.send('❌ Access Denied');
  }

  const { name, fromS, toS } = req.body;

  db.run(
    "INSERT INTO TRAINS(name, fromS, toS) VALUES(?,?,?)",
    [name, fromS, toS],
    () => {
      res.send('✅ Train Added Successfully <br><a href=\"/admin\">Back</a>');
    }
  );
});

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// SHOW SEARCH PAGE
app.get('/search', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  render(res, 'search.html');
});

// SEARCH TRAINS
// SEARCH TRAINS
app.post('/search', (req, res) => {
  const { from, to } = req.body;

  db.all(
    "SELECT * FROM TRAINS WHERE lower(trim(fromS)) = lower(trim(?)) AND lower(trim(toS)) = lower(trim(?))",
    [from, to],
    (err, rows) => {
      if (err) return res.send(err);

      if (rows.length === 0) {
        return res.send("❌ Train Not Found");
      }

      let output = "<h2>Available Trains</h2>";
      rows.forEach(t => {
        output += `<p>${t.name} | <a href="/book/${t.id}">Book</a></p>`;
      });

      res.send(output);
    }
  );
});

// SERVER START (VERY IMPORTANT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

function render(res, page) {
  const layout = fs.readFileSync(__dirname + '/views/layout.html', 'utf8');
  const pageContent = fs.readFileSync(__dirname + '/views/' + page, 'utf8');
  res.send(layout.replace('{{CONTENT}}', pageContent));
}

