const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/config/database");
const { v4: uuidv4 } = require("uuid");

describe("User API", () => {
  beforeAll(async () => {
    const connection = await pool.getConnection();
    console.log("Database connected");
    connection.release();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INT NOT NULL
      )
    `);
  });

  afterAll(async () => {
    await pool.query("DROP TABLE IF EXISTS users");
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query("DELETE FROM users");
  });

  describe("POST /users", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/users").send({
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id");
    });

    it("should validate input", async () => {
      const res = await request(app).post("/users").send({
        name: "John Doe",
        email: "invalid-email",
        age: 30,
      });
      expect(res.statusCode).toBe(400);
    });
  });
  describe("GET /users", () => {
    it("should get all users", async () => {
      await pool.query(
        "INSERT INTO users (id, name, email, age) VALUES (UUID(), 'Test User', 'test@example.com', 25)"
      );

      const res = await request(app).get("/users");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
  describe("GET /users/:id", () => {
    it("should get user by id", async () => {
      const userId = uuidv4(); // Generate a UUID
      await pool.query(
        "INSERT INTO users (id, name, email, age) VALUES (?, ?, ?, ?)",
        [userId, "Test User", "test@example.com", 25]
      );

      const res = await request(app).get(`/users/${userId}`); // Use the generated UUID
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("id", userId);
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user", async () => {
      const userId = uuidv4(); // Generate a UUID
      await pool.query(
        "INSERT INTO users (id, name, email, age) VALUES (?, ?, ?, ?)",
        [userId, "Test User", "test@example.com", 25]
      );

      const res = await request(app).put(`/users/${userId}`).send({
        name: "Updated Name",
        email: "updated@example.com",
        age: 30,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Updated Name");
    });
  });
});
