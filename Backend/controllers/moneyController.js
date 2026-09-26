import pool from "../config/db.js";

export const markPlayerUnpaid = async (req, res) => {
  try {
    const { frameId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        message: "Player is required",
      });
    }

    // Get frame
    const frameResult = await pool.query(
      `
      SELECT
        id,
        game_type,
        player1_id,
        player2_id,
        player3_id,
        player4_id
      FROM frames
      WHERE id = $1
      `,
      [frameId],
    );

    if (frameResult.rows.length === 0) {
      return res.status(404).json({
        message: "Frame not found",
      });
    }

    const frame = frameResult.rows[0];

    // Check player belongs to this frame
    const playerIds = [
      frame.player1_id,
      frame.player2_id,
      frame.player3_id,
      frame.player4_id,
    ].filter(Boolean);

    if (!playerIds.includes(Number(playerId))) {
      return res.status(400).json({
        message: "This player did not play this frame",
      });
    }

    // Determine amount from frame type
    const amount = frame.game_type === "1/1" ? 100 : 50;

    // Check if this player already has a charge for this frame
    const existingRecord = await pool.query(
      `
      SELECT id
      FROM money_records
      WHERE player_id = $1
        AND frame_id = $2
        AND added_amount > 0
      `,
      [playerId, frameId],
    );

    if (existingRecord.rows.length > 0) {
      return res.status(409).json({
        message: "Money has already been added for this player",
      });
    }

    // Get total already added for this frame
    const totalResult = await pool.query(
      `
      SELECT COALESCE(SUM(added_amount), 0) AS total_added
      FROM money_records
      WHERE frame_id = $1
        AND added_amount > 0
      `,
      [frameId],
    );

    const totalAdded = Number(totalResult.rows[0].total_added);

    // A frame can have maximum ₹100 added
    if (totalAdded + amount > 100) {
      return res.status(400).json({
        message: "The full frame amount has already been assigned",
      });
    }

    // Add money record
    const result = await pool.query(
      `
      INSERT INTO money_records (
        player_id,
        frame_id,
        added_amount,
        paid_amount
      )
      VALUES ($1, $2, $3, 0)
      RETURNING *;
      `,
      [playerId, frameId, amount],
    );

    res.status(201).json({
      message: "Player marked unpaid successfully",
      moneyRecord: result.rows[0],
    });
  } catch (error) {
    console.error("Mark unpaid error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMyMoney = async (req, res) => {
  try {
    const playerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        frame_id,
        added_amount,
        paid_amount,
        recorded_at
      FROM money_records
      WHERE player_id = $1
      ORDER BY recorded_at ASC, id ASC;
      `,
      [playerId],
    );

    let balance = 0;

    const ledger = result.rows.map((record) => {
      balance += Number(record.added_amount);
      balance -= Number(record.paid_amount);

      return {
        id: record.id,
        frameId: record.frame_id,
        date: record.recorded_at,
        added: Number(record.added_amount),
        paid: Number(record.paid_amount),
        balance,
      };
    });

    res.json({
      ledger,
      currentBalance: balance,
    });
  } catch (error) {
    console.error("Get my money error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Payment amount is required",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than 0",
      });
    }

    // Check player exists
    const playerResult = await pool.query(
      `
      SELECT id, username
      FROM users
      WHERE id = $1
        AND user_role = 'player'
      `,
      [playerId],
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    // Calculate current balance
    const balanceResult = await pool.query(
      `
      SELECT
        COALESCE(SUM(added_amount), 0) -
        COALESCE(SUM(paid_amount), 0) AS balance
      FROM money_records
      WHERE player_id = $1
      `,
      [playerId],
    );

    const currentBalance = Number(balanceResult.rows[0].balance);

    if (currentBalance <= 0) {
      return res.status(400).json({
        message: "Player has no outstanding balance",
      });
    }

    if (paymentAmount > currentBalance) {
      return res.status(400).json({
        message: `Payment cannot be greater than current balance of ₹${currentBalance}`,
      });
    }

    // Create payment transaction
    const result = await pool.query(
      `
      INSERT INTO money_records (
        player_id,
        frame_id,
        added_amount,
        paid_amount
      )
      VALUES ($1, NULL, 0, $2)
      RETURNING *;
      `,
      [playerId, paymentAmount],
    );

    res.status(201).json({
      message: "Payment added successfully",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error("Add payment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPlayerMoney = async (req, res) => {
  try {
    const { playerId } = req.params;

    const playerResult = await pool.query(
      `
      SELECT id, username
      FROM users
      WHERE id = $1
        AND user_role = 'player'
      `,
      [playerId],
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        frame_id,
        added_amount,
        paid_amount,
        recorded_at
      FROM money_records
      WHERE player_id = $1
      ORDER BY recorded_at ASC, id ASC;
      `,
      [playerId],
    );

    let balance = 0;

    const ledger = result.rows.map((record) => {
      balance += Number(record.added_amount);
      balance -= Number(record.paid_amount);

      return {
        id: record.id,
        frameId: record.frame_id,
        date: record.recorded_at,
        added: Number(record.added_amount),
        paid: Number(record.paid_amount),
        balance,
      };
    });

    res.json({
      player: playerResult.rows[0],
      ledger,
      currentBalance: balance,
    });
  } catch (error) {
    console.error("Get player money error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const addMoney = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount, date } = req.body;

    // 1. Validate amount
    const addedAmount = Number(amount);

    if (!Number.isFinite(addedAmount) || addedAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    // 2. Check that player exists
    const playerResult = await pool.query(
      `
      SELECT id, username
      FROM users
      WHERE id = $1
        AND user_role = 'player'
      `,
      [playerId],
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Player not found",
      });
    }

    // 3. Add money without a frame
    const result = await pool.query(
      `
      INSERT INTO money_records (
        player_id,
        frame_id,
        added_amount,
        paid_amount,
        recorded_at
      )
      VALUES (
        $1,
        NULL,
        $2,
        0,
        COALESCE($3::timestamp, CURRENT_TIMESTAMP)
      )
      RETURNING *;
      `,
      [playerId, addedAmount, date || null],
    );

    res.status(201).json({
      message: "Money added successfully",
      moneyRecord: result.rows[0],
    });
  } catch (error) {
    console.error("Add money error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
