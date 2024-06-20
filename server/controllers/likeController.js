const db = require("../database/db.js");

exports.likePost = (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({
      success: false,
      message: "사용자 ID와 게시물 ID를 모두 제공해야 합니다.",
    });
  }

  // 좋아요 테이블에 사용자가 해당 게시물에 대해 좋아요를 눌렀는지 확인하는 쿼리
  const checkLikedQuery =
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
  db.query(checkLikedQuery, [user_id, post_id], (err, result) => {
    if (err) {
      console.error("좋아요 여부를 확인하는 중 오류가 발생했습니다.", err);
      return res.status(500).json({
        success: false,
        message: "좋아요 여부를 확인하는 중 오류가 발생했습니다.",
      });
    }

    // 이미 좋아요를 눌렀으면 좋아요를 취소하고, 아니면 좋아요를 추가
    if (result.length > 0) {
      // 이미 좋아요를 누른 경우 좋아요 취소
      const deleteLikeQuery =
        "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
      db.query(deleteLikeQuery, [user_id, post_id], (err, result) => {
        if (err) {
          console.error("좋아요를 취소하는 중 오류가 발생했습니다.", err);
          return res.status(500).json({
            success: false,
            message: "좋아요를 취소하는 중 오류가 발생했습니다.",
          });
        }
        res.status(200).json({
          success: true,
          message: "좋아요를 취소했습니다.",
        });
      });
    } else {
      // 좋아요를 누르지 않은 경우 좋아요 추가
      const addLikeQuery = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
      db.query(addLikeQuery, [user_id, post_id], (err, result) => {
        if (err) {
          console.error("좋아요를 추가하는 중 오류가 발생했습니다.", err);
          return res.status(500).json({
            success: false,
            message: "좋아요를 추가하는 중 오류가 발생했습니다.",
          });
        }
        res.status(200).json({
          success: true,
          message: "좋아요를 추가했습니다.",
        });
      });
    }
  });
};

// 좋아요 여부 확인 엔드포인트
exports.checkLiked = (req, res) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({
      success: false,
      message: "사용자 ID와 게시물 ID를 모두 제공해야 합니다.",
    });
  }

  // 좋아요 테이블에서 사용자가 해당 게시물에 대해 좋아요를 눌렀는지 확인
  const checkLikedQuery =
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
  db.query(checkLikedQuery, [user_id, post_id], (err, result) => {
    if (err) {
      console.error("좋아요 여부를 확인하는 중 오류가 발생했습니다.", err);
      return res.status(500).json({
        success: false,
        message: "좋아요 여부를 확인하는 중 오류가 발생했습니다.",
      });
    }

    // 이미 좋아요를 눌렀으면 클라이언트에게 알림
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        liked: true,
      });
    } else {
      // 좋아요를 누르지 않은 경우
      return res.status(200).json({
        success: true,
        liked: false,
      });
    }
  });
};

// 마이페이지 좋아요 한 글
exports.getLikedPosts = (req, res) => {
  const { user_id } = req.body;
  // 클라이언트에서 매개변수가 아닌 본문에서 받고 있으므로 req.params가 아닌 req.body여야 함

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "사용자 ID를 제공해야 합니다.",
    });
  }

  // 사용자가 좋아요한 게시물을 찾기 위한 쿼리
  const likedPostsQuery = `
    SELECT p.*
    FROM posts p
    INNER JOIN likes l ON p.id = l.post_id
    WHERE l.user_id = ?
    ORDER BY p.created_at DESC
  `;

  db.query(likedPostsQuery, [user_id], (err, results) => {
    if (err) {
      console.error("좋아요한 게시물을 가져오는 중 오류가 발생했습니다.", err);
      return res.status(500).json({
        success: false,
        message: "좋아요한 게시물을 가져오는 중 오류가 발생했습니다.",
      });
    }

    // 결과를 클라이언트에게 반환
    res.status(200).json({
      success: true,
      likedPosts: results,
    });
  });
};
