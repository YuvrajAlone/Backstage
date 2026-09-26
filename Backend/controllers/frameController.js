import pool from "../config/db.js";

export const createFrame = async (req, res) => {
  try {
    const { gameType, player1Id, player2Id, player3Id, player4Id, playedAt } =
      req.body;

    // 1. Validate game type
    if (!["1/1", "2/2"].includes(gameType)) {
      return res.status(400).json({
        message: "Game type must be 1/1 or 2/2",
      });
    }

    // 2. Common players are required
    if (!player1Id || !player2Id) {
      return res.status(400).json({
        message: "At least two players are required",
      });
    }

    // 3. Validate number of players according to game type
    if (gameType === "1/1") {
      if (player3Id || player4Id) {
        return res.status(400).json({
          message: "1/1 frame can only have 2 players",
        });
      }
    }

    if (gameType === "2/2") {
      if (!player3Id || !player4Id) {
        return res.status(400).json({
          message: "2/2 frame requires 4 players",
        });
      }
    }

    // 4. Make an array of selected players
    const playerIds = [player1Id, player2Id, player3Id, player4Id].filter(
      Boolean,
    );

    // 5. Prevent same player from being selected twice
    const uniquePlayerIds = new Set(playerIds);

    if (uniquePlayerIds.size !== playerIds.length) {
      return res.status(400).json({
        message: "A player cannot be selected more than once",
      });
    }

    // 6. Make sure all selected users actually exist as players
    const playersResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ANY($1::int[])
        AND user_role = 'player'
      `,
      [playerIds],
    );

    if (playersResult.rows.length !== playerIds.length) {
      return res.status(400).json({
        message: "One or more selected users are invalid",
      });
    }

    // 7. Create frame
    const result = await pool.query(
      `
      INSERT INTO frames (
        game_type,
        player1_id,
        player2_id,
        player3_id,
        player4_id,
        played_at
      )
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP))
      RETURNING *;
      `,
      [
        gameType,
        player1Id,
        player2Id,
        player3Id || null,
        player4Id || null,
        playedAt || null,
      ],
    );

    res.status(201).json({
      message: "Frame created successfully",
      frame: result.rows[0],
    });
  } catch (error) {
    console.error("Create frame error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getFrames = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.id,
        f.game_type,
        f.played_at,

        u1.username AS player1,
        u2.username AS player2,
        u3.username AS player3,
        u4.username AS player4

      FROM frames f

      JOIN users u1
        ON f.player1_id = u1.id

      JOIN users u2
        ON f.player2_id = u2.id

      LEFT JOIN users u3
        ON f.player3_id = u3.id

      LEFT JOIN users u4
        ON f.player4_id = u4.id

      ORDER BY f.played_at DESC;
    `);

    res.json({
      frames: result.rows,
    });
  } catch (error) {
    console.error("Get frames error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
