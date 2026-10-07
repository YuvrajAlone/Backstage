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
        f.status,

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

export const getFrame = async (req, res) => {
  try {
    const { frameId } = req.params;

    const frameResult = await pool.query(
      `
      SELECT
        f.id,
        f.game_type,
        f.played_at,
        f.status,
        f.completed_at,

        u1.id AS player1_id,
        u1.username AS player1,

        u2.id AS player2_id,
        u2.username AS player2,

        u3.id AS player3_id,
        u3.username AS player3,

        u4.id AS player4_id,
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

      WHERE f.id = $1
      `,
      [frameId],
    );

    if (frameResult.rows.length === 0) {
      return res.status(404).json({
        message: "Frame not found",
      });
    }

    const frame = frameResult.rows[0];

    const players = [
      {
        id: frame.player1_id,
        username: frame.player1,
      },
      {
        id: frame.player2_id,
        username: frame.player2,
      },
      frame.player3_id
        ? {
            id: frame.player3_id,
            username: frame.player3,
          }
        : null,
      frame.player4_id
        ? {
            id: frame.player4_id,
            username: frame.player4,
          }
        : null,
    ].filter(Boolean);

    // Find unpaid charges created from this frame
    const moneyResult = await pool.query(
      `
      SELECT
        player_id,
        added_amount
      FROM money_records
      WHERE frame_id = $1
        AND added_amount > 0
      `,
      [frameId],
    );

    const unpaidPlayerIds = new Set(
      moneyResult.rows.map((record) => record.player_id),
    );

    const playersWithStatus = players.map((player) => ({
      ...player,
      paymentStatus: unpaidPlayerIds.has(player.id) ? "unpaid" : "paid",
    }));

    res.json({
      frame: {
        id: frame.id,
        gameType: frame.game_type,
        playedAt: frame.played_at,
        status: frame.status,
        completedAt: frame.completed_at,
        players: playersWithStatus,
      },
    });
  } catch (error) {
    console.error("Get frame error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const completeFrame = async (req, res) => {
  try {
    const { frameId } = req.params;

    const result = await pool.query(
      `
      UPDATE frames
      SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND status = 'ongoing'
      RETURNING *;
      `,
      [frameId],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Frame not found or already completed",
      });
    }

    res.json({
      message: "Frame completed successfully",
      frame: result.rows[0],
    });
  } catch (error) {
    console.error("Complete frame error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
