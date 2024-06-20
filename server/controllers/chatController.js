const db = require("../database/db.js");
const { promisify } = require("util");

exports.getChatRooms = (req, res) => {
  const sql = "SELECT * FROM chat_rooms";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching chat rooms from database:", err);
      return res.status(500).json({
        success: false,
        message:
          "채팅방 목록을 데이터베이스에서 가져오는 중 오류가 발생했습니다.",
      });
    }

    console.log("채팅방 목록을 데이터베이스에서 성공적으로 가져왔습니다.");
    res.status(200).json({ success: true, chatRooms: results });
  });
};

// 채팅방에 입장하기
exports.joinChatRoom = (req, res) => {
  const { roomId, userId } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "로그인이 필요합니다." });
  }

  const checkIfAlreadyJoined =
    "SELECT * FROM user_chat_rooms WHERE user_id = ? AND room_id = ?";
  db.query(checkIfAlreadyJoined, [userId, roomId], (err, results) => {
    if (err) {
      console.error(
        "Error checking if user already joined the chat room:",
        err
      );
      return res.status(500).json({
        success: false,
        message: "채팅방에 입장 여부를 확인하는 중 오류가 발생했습니다.",
      });
    }

    if (results.length > 0) {
      // 이미 입장한 채팅방이라면 중복 처리
      console.log("이미 입장한 채팅방입니다.");
      return res
        .status(200)
        .json({ success: true, message: "이미 입장한 채팅방입니다." });
    }

    // 새로운 채팅방에 입장하는 경우에만 새로운 레코드 추가
    const sql = "INSERT INTO user_chat_rooms (user_id, room_id) VALUES (?, ?)";
    db.query(sql, [userId, roomId], (err, results) => {
      if (err) {
        console.error("Error joining chat room:", err);
        return res.status(500).json({
          success: false,
          message: "채팅방에 입장하는 중 오류가 발생했습니다.",
        });
      }

      console.log("사용자가 채팅방에 성공적으로 입장했습니다.");
      res
        .status(200)
        .json({ success: true, message: "채팅방에 입장했습니다." });
    });
  });
};

exports.getUserChatRoom = (req, res) => {
  const { userId } = req.query; // 현재 로그인한 사용자의 ID를 쿼리 문자열에서 가져옴
  console.log("userId:", userId);

  const sql =
    "SELECT chat_rooms.room_name, chat_rooms.id, chat_rooms.description FROM chat_rooms INNER JOIN user_chat_rooms ON chat_rooms.id = user_chat_rooms.room_id WHERE user_chat_rooms.user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user's chat rooms from database:", err);
      return res.status(500).json({
        success: false,
        message: "사용자가 참여한 채팅방을 가져오는 중 오류가 발생했습니다.",
      });
    }

    console.log(
      "사용자가 참여한 채팅방 목록을 데이터베이스에서 성공적으로 가져왔습니다."
    );
    console.log(results);
    res.status(200).json({ success: true, userChatRooms: results });
  });
};

exports.leaveChatRoom = (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "로그인이 필요합니다." });
  }

  const sql = "DELETE FROM user_chat_rooms WHERE user_id = ? AND room_id = ?";
  db.query(sql, [userId, roomId], (err, results) => {
    if (err) {
      console.error("Error leaving chat room:", err);
      return res.status(500).json({
        success: false,
        message: "채팅방에서 퇴장하는 중 오류가 발생했습니다.",
      });
    }

    console.log("사용자가 채팅방에서 성공적으로 퇴장했습니다.");
    res
      .status(200)
      .json({ success: true, message: "채팅방에서 퇴장했습니다." });
  });
};

exports.findChatRoom = (req, res) => {
  const { username, room_name } = req.query;

  // 데이터베이스에서 해당 사용자와 방 이름이 일치하는 채팅방을 찾습니다.
  const selectQuery =
    "SELECT id FROM chat_rooms WHERE username = ? AND room_name = ?";
  db.query(selectQuery, [username, room_name], (error, results, fields) => {
    if (error) {
      console.error("Error finding chat room:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    // 채팅방을 찾지 못한 경우 클라이언트에게 실패 응답을 전송합니다.
    if (results.length === 0) {
      res.status(404).json({ error: "Chat room not found" });
      return;
    }

    // 채팅방을 찾은 경우 해당 채팅방의 ID를 클라이언트에게 반환합니다.
    const chatRoomId = results[0].id;
    res.status(200).json({ roomId: chatRoomId });
  });
};

exports.CheckUserInChatRoom = (userId, roomId, callback) => {
  const sql =
    "SELECT COUNT(*) AS count FROM user_chat_rooms WHERE user_id = ? AND room_id = ?";
  db.query(sql, [userId, roomId], (err, results) => {
    if (err) {
      console.error("Error checking if user is in chat room:", err);
      return callback(err, null);
    }

    const count = results[0].count;
    const isUserInRoom = count > 0;
    callback(null, isUserInRoom);
  });
};

exports.roomUsers = (req, res) => {
  const { roomId } = req.query;
  if (!roomId) {
    return res
      .status(400)
      .json({ success: false, message: "roomId is required" });
  }

  const sql = "SELECT user_id FROM user_chat_rooms WHERE room_id = ?";
  db.query(sql, [roomId], (err, results) => {
    if (err) {
      console.error(
        "채팅방에 참가한 사용자를 가져오는 중 요류가 발생했습니다.",
        err
      );
      return res.status(500).json({
        success: false,
        message: "채팅방에 참가한 사용자를 가져오는 중 요류가 발생했습니다.",
      });
    }

    console.log(
      "채팅방에 참가한 사용자 목록을 데이터베이스에서 성공적으로 가져왔습니다."
    );
    console.log(results);
    res.status(200).json({ success: true, roomUsers: results });
  });
};
const query2 = promisify(db.query).bind(db);

exports.deleteChatRoom = async (req, res) => {
  const { roomId } = req.params;
  const sql1 = "DELETE FROM chat_rooms WHERE id = ?";
  const sql2 = "DELETE FROM user_chat_rooms WHERE room_id = ?";
  const sql3 = "DELETE FROM chat_text WHERE room_id = ?";

  try {
    // Begin transaction
    await query2("START TRANSACTION");

    console.log("Transaction started");

    // Delete from chat_text
    const result3 = await query(sql3, [roomId]);
    console.log("Deleted from chat_text:", result3);

    // Delete from user_chat_rooms
    const result2 = await query(sql2, [roomId]);
    console.log("Deleted from user_chat_rooms:", result2);

    // Delete from chat_rooms
    const result1 = await query(sql1, [roomId]);
    console.log("Deleted from chat_rooms:", result1);

    // Commit transaction
    await query2("COMMIT");
    console.log("Transaction committed");

    res.status(200).json({
      success: true,
      message: "채팅방이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    // Rollback transaction in case of error
    await query2("ROLLBACK");
    console.error("Transaction rolled back due to error:", error);

    res.status(500).json({
      success: false,
      message: "채팅방 삭제에 실패했습니다.",
      error: error.message, // 상세한 오류 메시지 전송
    });
  }
};
