const db = require("../database/db.js");

exports.userLocation = (req, res) => {
  const { username } = req.body;
  const sql = "SELECT location FROM usertable WHERE username = ?";

  // 쿼리 실행
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error("아이디로 주소를 가져오는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "아이디로 주소를 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }

    // 해당 아이디에 해당하는 포스트가 없을 경우
    if (result.length === 0) {
      res.status(404).json({
        success: false,
        message: "해당 아이디에 해당하는 주소를 찾을 수 없습니다.",
      });
      return;
    }

    // 성공적으로 주소를 가져왔을 때 클라이언트로 응답 전송
    const location = result[0].location;
    res.status(200).json({ success: true, location });
  });
};

exports.deliveryPost = (req, res) => {
  // 현재 시간을 UTC로 변환하여 저장
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const createdDate = new Date(utc + koreaTimeDiff);

  const {
    user_id,
    post_name,
    post_content,
    category,
    take_location,
    post_area,
    participant_num,
    max_person_num,
    valid_time,
    lat,
    lon,
  } = req.body;

  // MySQL 쿼리 작성
  const sql =
    "INSERT INTO delivery (user_id, post_name, post_content, category, take_location, post_area, participant_num, max_person_num, valid_time, createdDate, lat, lon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    user_id,
    post_name,
    post_content,
    category,
    take_location,
    post_area,
    participant_num,
    max_person_num,
    valid_time,
    createdDate,
    lat,
    lon,
  ];

  // 쿼리 실행
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("게시물을 저장하는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "게시물을 저장하는 중 오류가 발생했습니다.",
      });
      return;
    }

    console.log("게시물이 성공적으로 저장되었습니다.");
    res.status(201).json({
      success: true,
      message: "게시물이 성공적으로 저장되었습니다.",
    });
  });
};

exports.getDeliveryPosts = (req, res) => {
  const sql = "SELECT * FROM delivery";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("게시글 데이터를 가져오는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "게시글 데이터를 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }

    // 성공적으로 게시글 데이터를 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, posts: result });
  });
};

exports.deleteExpiredPosts = (req, res) => {
  // 현재 시간을 UTC로 변환하여 저장
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const koreaTimeDiff = 9 * 60 * 60 * 1000;
  const createdDate = new Date(utc + koreaTimeDiff);
  const sql = "DELETE FROM delivery WHERE valid_time <= ?"; // 유효 시간이 지난 게시물 삭제 쿼리

  // 쿼리 실행
  db.query(sql, [createdDate], (err, result) => {
    if (err) {
      console.error(
        "유효 기간이 지난 게시물을 삭제하는 중 오류가 발생했습니다.",
        err
      );
      res.status(500).json({
        success: false,
        message: "유효 기간이 지난 게시물을 삭제하는 중 오류가 발생했습니다.",
      });
      return;
    }

    console.log("유효 기간이 지난 게시물이 성공적으로 삭제되었습니다.");
    res.status(200).json({
      success: true,
      message: "유효 기간이 지난 게시물이 성공적으로 삭제되었습니다.",
    });
  });
};

exports.deliveryView = (req, res) => {
  const { post_id } = req.params;

  const sql = "SELECT * FROM delivery WHERE post_id = ?";

  db.query(sql, [post_id], (err, result) => {
    if (err) {
      console.error("게시글 데이터를 가져오는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "게시글 데이터를 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }

    if (result.length === 0) {
      // 해당하는 게시물이 없을 경우
      res.status(404).json({
        success: false,
        message: "해당하는 게시물이 없습니다.",
      });
      return;
    }

    // 성공적으로 게시글 데이터를 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, posts: result });
  });
};

exports.deleteDelivery = (req, res) => {
  const { post_id } = req.params;

  // 데이터베이스에서 해당 ID의 포스트를 삭제하는 쿼리
  const sql = "DELETE FROM delivery WHERE post_id = ?";

  // 쿼리 실행
  db.query(sql, [post_id], (err, result) => {
    if (err) {
      console.error("게시글을 삭제하는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "게시글을 삭제하는 중 오류가 발생했습니다.",
      });
      return;
    }
    // 삭제 성공 시 클라이언트로 응답 전송
    res
      .status(200)
      .json({ success: true, message: "게시글이 성공적으로 삭제되었습니다." });
  });
};

exports.joinDelivery = (req, res) => {
  const { post_id } = req.params;
  const { username } = req.body;

  const addParticipantSql =
    "INSERT INTO delivery_participants (post_id, user_id) VALUES (?, ?)";
  // 데이터베이스에 참가자 수를 증가시키는 쿼리를 작성합니다.
  const increaseParticipantCountSql =
    "UPDATE delivery SET participant_num = participant_num + 1 WHERE post_id = ?";
  // 트랜잭션 시작
  db.beginTransaction((err) => {
    if (err) {
      console.error("트랜잭션 시작 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "트랜잭션 시작 중 오류가 발생했습니다.",
      });
      return;
    }

    // 참가자 추가 쿼리 실행
    db.query(addParticipantSql, [post_id, username], (err, result) => {
      if (err) {
        // 오류가 발생했을 경우 트랜잭션 롤백 후 오류 응답을 전송합니다.
        console.error("참가자 추가 중 오류가 발생했습니다.", err);
        db.rollback(() => {
          res.status(500).json({
            success: false,
            message: "참가자 추가 중 오류가 발생했습니다.",
          });
        });
        return;
      }

      // 참가자 수 증가 쿼리 실행
      db.query(increaseParticipantCountSql, [post_id], (err, result) => {
        if (err) {
          // 오류가 발생했을 경우 트랜잭션 롤백 후 오류 응답을 전송합니다.
          console.error("참가자 수 증가 중 오류가 발생했습니다.", err);
          db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "참가자 수 증가 중 오류가 발생했습니다.",
            });
          });
          return;
        }

        // 트랜잭션 커밋 후 성공 응답을 전송합니다.
        db.commit((err) => {
          if (err) {
            console.error("트랜잭션 커밋 중 오류가 발생했습니다.", err);
            res.status(500).json({
              success: false,
              message: "트랜잭션 커밋 중 오류가 발생했습니다.",
            });
            return;
          }
          res.status(200).json({
            success: true,
            message: "참가자가 성공적으로 추가되었습니다.",
          });
        });
      });
    });
  });
};

exports.userJoinedDelivery = (req, res) => {
  const { username } = req.body;
  const { post_id } = req.params;

  const sql = "SELECT user_id FROM delivery_participants WHERE post_id = ?";

  db.query(sql, [post_id], (err, results) => {
    if (err) {
      console.error("사용자가 참가한 게시물을 가져오는 중 오류 발생:", err);
      res.status(500).json({
        success: false,
        message: "사용자가 참가한 게시물을 가져오는 중 오류 발생",
      });
      return;
    }

    // 해당 post_id에 참가한 사용자의 user_id 목록을 클라이언트에 응답으로 전송
    const joinedUsers = results.map((result) => result.user_id);
    res.status(200).json({ success: true, joinedUsers });
  });
};

exports.exitDelivery = (req, res) => {
  const { post_id } = req.params;
  const { username } = req.body;

  const deleteParticipantSql =
    "DELETE FROM delivery_participants WHERE post_id = ? AND user_id = ?";
  const decreaseParticipantCountSql =
    "UPDATE delivery SET participant_num = participant_num - 1 WHERE post_id = ?";

  // 트랜잭션 시작
  db.beginTransaction((err) => {
    if (err) {
      console.error("트랜잭션 시작 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "트랜잭션 시작 중 오류가 발생했습니다.",
      });
      return;
    }

    // 참가자 삭제 쿼리 실행
    db.query(deleteParticipantSql, [post_id, username], (err, result) => {
      if (err) {
        // 오류가 발생했을 경우 트랜잭션 롤백 후 오류 응답을 전송합니다.
        console.error("참가자 삭제 중 오류가 발생했습니다.", err);
        db.rollback(() => {
          res.status(500).json({
            success: false,
            message: "참가자 삭제 중 오류가 발생했습니다.",
          });
        });
        return;
      }

      // 참가자 수 감소 쿼리 실행
      db.query(decreaseParticipantCountSql, [post_id], (err, result) => {
        if (err) {
          // 오류가 발생했을 경우 트랜잭션 롤백 후 오류 응답을 전송합니다.
          console.error("참가자 수 감소 중 오류가 발생했습니다.", err);
          db.rollback(() => {
            res.status(500).json({
              success: false,
              message: "참가자 수 감소 중 오류가 발생했습니다.",
            });
          });
          return;
        }

        // 트랜잭션 커밋 후 성공 응답을 전송합니다.
        db.commit((err) => {
          if (err) {
            console.error("트랜잭션 커밋 중 오류가 발생했습니다.", err);
            res.status(500).json({
              success: false,
              message: "트랜잭션 커밋 중 오류가 발생했습니다.",
            });
            return;
          }
          res.status(200).json({
            success: true,
            message: "참가자가 성공적으로 나갔습니다.",
          });
        });
      });
    });
  });
};

// 서버 코드
exports.editDelivery = (req, res) => {
  const { post_id } = req.params;
  const {
    post_name,
    post_content,
    category,
    take_location,
    post_area,
    max_person_num,
    valid_time,
    lat,
    lon,
    oldPostName,
  } = req.body;
  const sql =
    "UPDATE delivery SET post_name = ?, post_content = ?, category = ?, take_location = ?, post_area = ?, max_person_num = ?, valid_time = ?, lat = ?, lon = ? WHERE post_id = ?";
  db.query(
    sql,
    [
      post_name,
      post_content,
      category,
      take_location,
      post_area,
      max_person_num,
      valid_time,
      lat,
      lon,
      post_id,
    ],
    (err, result) => {
      if (err) {
        console.error("공동배달 게시글을 수정 중 오류가 발생했습니다.", err);
        res.status(500).json({
          success: false,
          message: "공동배달 게시글을 수정 중 오류가 발생했습니다.",
        });
        return;
      }
      // 수정된 post_name으로 채팅 테이블의 room_name을 함께 수정
      const updateChatRoomSQL =
        "UPDATE chat_rooms SET room_name = ? WHERE room_name = ?";
      db.query(updateChatRoomSQL, [post_name, oldPostName], (err, result) => {
        if (err) {
          console.error(
            "채팅 테이블의 room_name을 수정 중 오류가 발생했습니다.",
            err
          );
          res.status(500).json({
            success: false,
            message: "채팅 테이블의 room_name을 수정 중 오류가 발생했습니다.",
          });
          return;
        }

        // 수정 성공 시 응답 전송
        res.status(200).json({
          success: true,
          message: "공동배달 게시글이 성공적으로 수정되었습니다.",
        });
      });
    }
  );
};
