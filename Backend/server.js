import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import pool from "./config/db.js";
import frameRoutes from "./routes/frameRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import moneyRoutes from "./routes/moneyRoutes.js";

dotenv.config();

const app = express();

const PgStore = connectPgSimple(session);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/frames", frameRoutes);
app.use("/api/users", userRoutes);
app.use("/api/money", moneyRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Snooker backend is running",
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
