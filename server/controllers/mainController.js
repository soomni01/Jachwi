const db = require("../database/db.js");

exports.getLatestPosts = (req, res) => {
  // 데이터베이스에서 최신 게시글 5개만 가져오는 쿼리
  const sql =
    "SELECT id, title, author, DATE_FORMAT(created_at, '%Y-%m-%d') AS date FROM posts ORDER BY created_at DESC LIMIT 5";

  // 쿼리 실행
  db.query(sql, (err, result) => {
    if (err) {
      console.error("최신 게시글을 가져오는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "최신 게시글을 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }
    // 성공적으로 최신 게시글을 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, latestPosts: result });
  });
};

exports.getLatestDeliveryPosts = (req, res) => {
  const { location } = req.query; // 쿼리 파라미터로 위치 정보를 받음

  const sql =
    " SELECT * FROM delivery WHERE take_location = ? ORDER BY createdDate DESC LIMIT 4";

  db.query(sql, [location], (err, result) => {
    if (err) {
      console.error("최신 배달게시글을 가져오는 중 오류가 발생했습니다.", err);
      res.status(500).json({
        success: false,
        message: "최신 배달게시글을 가져오는 중 오류가 발생했습니다.",
      });
      return;
    }
    // 성공적으로 최신 게시글을 가져왔을 때 클라이언트로 응답 전송
    res.status(200).json({ success: true, latestDeliveryPosts: result });
  });
};
