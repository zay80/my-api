const request = require('supertest');
const app = require('./app');
const db = require('./database');

// Helper — register and login to get a token
async function getToken() {
  await request(app)
    .post('/auth/register')
    .send({ username: 'testuser', password: 'password123' });

  const response = await request(app)
    .post('/auth/login')
    .send({ username: 'testuser', password: 'password123' });

  return response.body.token;
}

// Reset database before each test — fresh slate every time
beforeEach(() => {
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM accounts');
  // Reset autoincrement
  db.exec("DELETE FROM sqlite_sequence WHERE name='users'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='accounts'");
});

// ===== AUTH TESTS =====
describe('POST /auth/register', () => {
  test('registers a new account successfully', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'john', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Account created');
  });

  test('returns 400 if username or password missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'john' }); // no password

    expect(response.status).toBe(400);
  });

  test('returns 400 if username already taken', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'john', password: 'password123' });

    const response = await request(app)
      .post('/auth/register')
      .send({ username: 'john', password: 'password123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Username already taken');
  });
});

describe('POST /auth/login', () => {
  test('logs in successfully and returns token', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'john', password: 'password123' });

    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'john', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined(); // token exists
  });

  test('returns 401 with wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({ username: 'john', password: 'password123' });

    const response = await request(app)
      .post('/auth/login')
      .send({ username: 'john', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});

// ===== USERS TESTS =====
describe('GET /users', () => {
  test('returns empty array when no users', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('returns all users', async () => {
    const token = await getToken();

    // Create two users first
    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bob' });

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe('GET /users/:id', () => {
  test('returns a user by id', async () => {
    const token = await getToken();

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    const response = await request(app).get('/users/1');
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Alice');
  });

  test('returns 404 when user not found', async () => {
    const response = await request(app).get('/users/999');
    expect(response.status).toBe(404);
  });
});

describe('POST /users', () => {
  test('creates a user successfully', async () => {
    const token = await getToken();

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Alice');
    expect(response.body.id).toBeDefined();
  });

  test('returns 400 when name is missing', async () => {
    const token = await getToken();

    const response = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Name is required');
  });

  test('returns 401 when no token provided', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'Alice' });

    expect(response.status).toBe(401);
  });
});

describe('PUT /users/:id', () => {
  test('updates a user successfully', async () => {
    const token = await getToken();

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    const response = await request(app)
      .put('/users/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice Updated' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Alice Updated');
  });

  test('returns 404 when user not found', async () => {
    const token = await getToken();

    const response = await request(app)
      .put('/users/999')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /users/:id', () => {
  test('deletes a user successfully', async () => {
    const token = await getToken();

    await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Alice' });

    const response = await request(app)
      .delete('/users/1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User 1 deleted successfully');
  });

  test('returns 404 when user not found', async () => {
    const token = await getToken();

    const response = await request(app)
      .delete('/users/999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});