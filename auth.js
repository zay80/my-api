const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const router = express.Router();
const SECRET = process.env.JWT_SECRET; // in real apps, put this in an .env file

// REGISTER
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Hash the password before saving
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = db
      .prepare('INSERT INTO accounts (username, password) VALUES (?, ?)')
      .run(username, hashedPassword);

    res.status(201).json({ message: 'Account created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Username already taken' });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const account = db
    .prepare('SELECT * FROM accounts WHERE username = ?')
    .get(username);

  if (!account || !bcrypt.compareSync(password, account.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create a token
  const token = jwt.sign({ id: account.id, username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = { router, SECRET };