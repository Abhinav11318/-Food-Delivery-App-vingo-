import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import shopRouter from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";

import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();

// ✅ CREATE HTTP SERVER
const server = http.createServer(app);

// ✅ ATTACH SOCKET.IO TO HTTP SERVER
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ✅ REGISTER SOCKET EVENTS
socketHandler(io);

// (optional but fine)
app.set("io", io);

// Middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

const PORT = process.env.PORT || 8000;

const start = async () => {
  try {
    await connectDb();

    // ✅ START HTTP SERVER (NOT app.listen)
    server.listen(PORT, () => {
      console.log(`Server + Socket running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
