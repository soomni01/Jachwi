const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const FileStore = require("session-file-store")(session);
const fs = require("fs");
const https = require("https");
const socketIo = require("socket.io");
const db = require("./database/db");

const app = express();
const port = 5000;

const option = {
  key: fs.readFileSync ("/etc/letsencrypt/live/jachwi.site/privkey.pem", "utf8"),
  cert: fs.readFileSync("/etc/letsencrypt/live/jachwi.site/cert.pem", "utf8"),
  ca: fs.readFileSync("/etc/letsencrypt/live/jachwi.site/chain.pem", "utf8")
};

app.use(bodyParser.json());
app.use(
  cors({
    origin: "https://jachwi.site",
    credentials: true,
  })
);
app.use(express.json());

// Session 설정
app.use(
  session({
    name: "session ID",
    secret: "jachwi",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false,
      secure: true,
    },
  })
);

// 모든 요청에 대한 미들웨어
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// API 라우트 설정
app.use("/api", userRoutes);

const server = https.createServer(option, app);

const io = socketIo(server, {
  cors: {
    origin: "https://jachwi.site",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const { roomId, username } = socket.handshake.query;

  // 방 생성 요청 처리
  socket.on("createRoom", ({ title, username, description }) => {
    const insertQuery =
      "INSERT INTO chat_rooms (room_name, username, description) VALUES (?, ?, ?)";
    const values = [title, username, description];
    db.query(insertQuery, values, (error, results, fields) => {
      if (error) {
        console.error("Error creating room:", error);
        return;
      }
      console.log("Room created:", results.insertId);
      socket.emit("roomCreated", { roomId: results.insertId });
    });
  });

  // 해당 채팅방의 채팅 내용을 데이터베이스에서 가져오는 쿼리
  const selectQuery =
    "SELECT * FROM chat_text WHERE room_id = ? ORDER BY created_at ASC";
  db.query(selectQuery, [roomId], (error, results, fields) => {
    if (error) {
      console.error("Error fetching chat messages:", error);
      return;
    }
    // 클라이언트에 채팅 내용을 전송
    socket.emit("chatMessages", results);
  });
  io.to(roomId).emit("userJoined", username);
  console.log(`사용자가 방 ${roomId}에 연결되었습니다`);

  socket.join(roomId); // 해당 방에 소켓을 조인

  socket.on("sendMessage", ({ username, message }) => {
    console.log("새로운 메시지 수신:", username, message);

    const createdAt = new Date();
    const insertQuery =
      "INSERT INTO chat_text (room_id, username, message, created_at) VALUES (?, ?, ?, ?)";
    const values = [roomId, username, message, createdAt];
    db.query(insertQuery, values, (error, results, fields) => {
      if (error) {
        console.error("Error saving message:", error);
        return;
      }
      console.log("Message saved to database:", results.insertId);
    });

    io.to(roomId).emit("message", { username, message, created_at: createdAt });
  });

  socket.on("disconnect", () => {
    console.log(`사용자가 방 ${roomId}의 연결을 끊었습니다`);
  });
});

server.listen(port, () => {
  console.log(`서버 실행 ${port}`);
});

server.setTimeout(120000); 
