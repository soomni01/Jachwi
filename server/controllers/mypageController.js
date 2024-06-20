const db = require("../database/db.js");
const bcrypt = require("bcrypt");

// 닉네임 변경 관련
exports.updateUsername = (req, res) => {
  try {
    const { username } = req.body;
    const userEmail = req.session.user.email; // req.session.user가 정의되어 있어야 함

    if (!userEmail) {
      return res
        .status(401)
        .json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }

    const sql = `UPDATE usertable SET username = ? WHERE email = ?`;
    const values = [username, userEmail];

    db.query(sql, values, (err, results) => {
      if (err) {
        console.error("MySQL 쿼리 실행 오류:", err);
        return res.status(500).json({
          success: false,
          message: "아이디 정보를 업데이트할 수 없습니다.",
        });
      }

      // 업데이트된 사용자 정보를 클라이언트에 응답으로 보냄
      return res.status(200).json({
        success: true,
        message: "아이디가 성공적으로 업데이트되었습니다.",
      });
    });
  } catch (error) {
    console.error("아이디 정보를 업데이트할 수 없습니다.:", error);
    return res.status(500).json({
      success: false,
      message: "아이디 정보를 업데이트할 수 없습니다.",
    });
  }
};

exports.updateAddress = (req, res) => {
  try {
    const { username } = req.body;
    const { address } = req.body;

    // 해당 사용자의 likes 테이블의 user_id 열 업데이트
    db.query(
      "UPDATE usertable SET location = ? WHERE username = ?",
      [address, username] // 예시: 현재 사용자 아이디를 새로운 아이디(newUsername)로 변경
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("주소변경에 실패했습니다", error);
    res.sendStatus(500);
  }
};

exports.updateLikeUser = (req, res) => {
  try {
    const { newUsername } = req.body;

    // 해당 사용자의 likes 테이블의 user_id 열 업데이트
    db.query(
      "UPDATE likes SET user_id = ? WHERE user_id = ?",
      [newUsername, req.user.username] // 예시: 현재 사용자 아이디를 새로운 아이디(newUsername)로 변경
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to update likes table user_id:", error);
    res.sendStatus(500);
  }
};

// 비밀번호 변경 로직
exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userEmail = req.session.user.email;
  // 현재 비밀번호와 새 비밀번호가 일치하는지 확인
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "새 비밀번호는 현재 비밀번호와 달라야 합니다.",
    });
  }
  // 데이터베이스에서 사용자 정보 조회
  const sql = `SELECT * FROM usertable WHERE email = ?`;
  db.query(sql, [userEmail], async (err, result) => {
    if (err) {
      console.error("오류가 발생했습니다:", err);
      return res.status(500).json({
        success: false,
        message: "비밀번호 변경에 오류가 발생했습니다",
      });
    }
    if (result.length > 0) {
      const user = result[0];
      try {
        // 저장된 해시된 비밀번호와 클라이언트에서 전송한 현재 비밀번호를 bcrypt를 사용하여 비교합니다.
        const passwordMatch = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (passwordMatch) {
          // 새로운 비밀번호를 해싱합니다.
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          // 비밀번호를 업데이트하는 SQL 쿼리를 실행합니다.
          const sql = `UPDATE usertable SET password = ? WHERE email = ?`;
          db.query(sql, [hashedNewPassword, userEmail], (err, result) => {
            if (err) {
              console.error("비밀번호 변경 중 오류가 발생했습니다:", err);
              return res.status(500).json({
                success: false,
                message: "비밀번호 변경에 오류가 발생했습니다",
              });
            }
            console.log("비밀번호가 성공적으로 변경되었습니다.");
            return res.status(200).json({
              success: true,
              message: "비밀번호가 성공적으로 변경되었습니다.",
            });
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "현재 비밀번호가 올바르지 않습니다.",
          });
        }
      } catch (error) {
        console.error("비밀번호 변경 중 에러 발생:", error);
        return res.status(500).json({
          success: false,
          message: "비밀번호 변경에 오류가 발생했습니다",
        });
      }
    } else {
      return res
        .status(401)
        .json({ success: false, message: "사용자 정보를 찾을 수 없습니다." });
    }
  });
};

// 회원 탈퇴 로직
exports.withdraw = (req, res) => {
  const { password } = req.body;
  const userEmail = req.session.user.email;
  const sqlSelect = `SELECT * FROM usertable WHERE email = ?`;
  const sqlDelete = `DELETE FROM usertable WHERE email = ?`;

  // 이메일을 사용하여 사용자 정보를 조회합니다.
  db.query(sqlSelect, [userEmail], async (err, result) => {
    if (err) {
      console.error("오류가 발생했습니다:", err);
      return res
        .status(500)
        .json({ success: false, message: "회원 탈퇴에 오류가 발생했습니다" });
    }
    if (result.length > 0) {
      const user = result[0];
      try {
        // 저장된 해시된 비밀번호와 클라이언트에서 전송한 비밀번호를 bcrypt를 사용하여 비교합니다.
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          // 비밀번호가 일치하는 경우, 사용자 정보를 삭제합니다.
          db.query(sqlDelete, [userEmail], (err, result) => {
            if (err) {
              console.error("오류가 발생했습니다:", err);
              return res.status(500).json({
                success: false,
                message: "회원 탈퇴에 오류가 발생했습니다",
              });
            }
            console.log("회원 탈퇴가 성공적으로 처리되었습니다.");

            // 세션을 삭제합니다.
            req.session.destroy((err) => {
              if (err) {
                console.error("세션 삭제에 실패하였습니다:", err);
                return res.status(500).json({
                  success: false,
                  message: "세션 삭제에 실패하였습니다",
                });
              }
              console.log("세션 삭제가 성공적으로 처리되었습니다.");

              return res.status(200).json({
                success: true,
                message: "회원 탈퇴 및 세션 삭제가 성공적으로 처리되었습니다.",
              });
            });
          });
        } else {
          // 비밀번호가 일치하지 않는 경우
          return res
            .status(401)
            .json({ success: false, message: "비밀번호가 올바르지 않습니다." });
        }
      } catch (error) {
        console.error("비밀번호 비교 중 에러 발생:", error);
        return res
          .status(500)
          .json({ success: false, message: "회원 탈퇴에 오류가 발생했습니다" });
      }
    } else {
      // 이메일에 해당하는 사용자가 존재하지 않는 경우
      return res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
  });
};
