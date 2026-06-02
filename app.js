require('dotenv').config();

const express = require('express');
const db = require('./database');
const { router: authRouter } = require('./auth');
const authenticate = require('./middleware');



class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

const app = express();

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000' // allow your React app
}));

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

app.get('/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

app.get('/users/:id', async (req, res, next) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) throw new NotFoundError(`User ${req.params.id} not found`);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/users', authenticate, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare('INSERT INTO users (name) VALUES (?)').run(name);
  res.status(201).json({ id: result.lastInsertRowid, name });
});

app.put('/users/:id', authenticate, (req, res) => {
  const { name } = req.body;
  const  id  = Number(req.params.id);
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ id, name });
});

app.delete('/users/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: `User ${id} deleted successfully` });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

module.exports = app; // ← export app, don't start server