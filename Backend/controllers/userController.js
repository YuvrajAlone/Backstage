import pool from "../config/db.js";

export const getPlayers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, created_at
      FROM users
      WHERE user_role = 'player'
      ORDER BY username ASC;
    `);

    res.json({
      players: result.rows,
    });
  } catch (error) {
    console.error("Get players error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
