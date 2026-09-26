import bcrypt from "bcrypt";
import pool from "../config/db.js";

export const registerPlayer = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [normalizedUsername],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (username, password_hash, user_role)
      VALUES ($1, $2, 'player')
      RETURNING id, username, user_role, created_at
      `,
      [normalizedUsername, passwordHash],
    );

    res.status(201).json({
      message: "Player registered successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT id, username, password_hash, user_role
      FROM users
      WHERE username = $1
      `,
      [normalizedUsername],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      user_role: user.user_role,
    };

    res.json({
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);

      return res.status(500).json({
        message: "Could not logout",
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      message: "Logout successful",
    });
  });
};

export const getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      message: "Not logged in",
    });
  }

  res.json({
    user: req.session.user,
  });
};
