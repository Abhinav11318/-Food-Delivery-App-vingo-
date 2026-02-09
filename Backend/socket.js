import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // JOIN USER ROOM IMMEDIATELY AFTER IDENTITY
    socket.on("identity", ({ userId }) => {
      if (!userId) return;

      socket.join(userId); // ✅ CRITICAL
      console.log("👤 User joined room:", userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};




   
  