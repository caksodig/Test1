const pool = require("../config/database");
const { v4: uuidv4 } = require("uuid");

class User {
  static async findAll() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async create(userData) {
    const id = uuidv4();
    const { name, email, age } = userData;
    await pool.query(
      "INSERT INTO users (id, name, email, age) VALUES (?, ?, ?, ?)",
      [id, name, email, age]
    );
    return this.findById(id);
  }

  static async update(id, userData) {
    const { name, email, age } = userData;
    await pool.query(
      "UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?",
      [name, email, age, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return true;
  }
}

module.exports = User;
