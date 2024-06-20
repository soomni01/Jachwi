require("dotenv").config(); // dotenv 모듈을 사용하여 .env 파일의 환경 변수를 불러옴

const db = require("../database/db.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// 비밀번호 재설정 요청 처리
exports.findpw = async (req, res) => {
  const { username, email } = req.body;

  try {
    // 사용자가 존재하는지 확인
    const userExistsQuery =
      "SELECT * FROM usertable WHERE username = ? AND email = ?";
    db.query(userExistsQuery, [username, email], async (err, result) => {
      if (err) {
        console.error("데이터베이스 오류가 발생했습니다.:", err);
        return res
          .status(500)
          .json({ success: false, message: "서버 오류가 있습니다." });
      }

      if (result.length === 0) {
        // 사용자가 존재하지 않음
        return res
          .status(404)
          .json({ success: false, message: "사용자가 존재하지 않습니다." });
      }

      const user = result[0];
      const temporaryPassword = generateTemporaryPassword(); // 임시 비밀번호 생성

      // Gmail 계정 설정 확인
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_EMAIL, // .env 파일에 저장된 구글 계정 사용
          pass: process.env.GOOGLE_PASSWORD, // .env 파일에 저장된 구글 비밀번호 사용
        },
      });

      transporter.verify(function (error, success) {
        if (error) {
          console.log("Gmail 계정 설정 확인 실패:", error);
        } else {
          console.log("Gmail 계정 설정 확인 성공");
        }
      });

      // 이메일로 임시 비밀번호 전송
      sendTemporaryPasswordByEmail(transporter, email, temporaryPassword);

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      // 데이터베이스에서 비밀번호 업데이트
      const updatePasswordQuery =
        "UPDATE usertable SET password = ? WHERE email = ?";
      db.query(
        updatePasswordQuery,
        [hashedPassword, email],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error("데이터베이스 오류가 발생했습니다.:", updateErr);
            return res
              .status(500)
              .json({ success: false, message: "서버에 오류가 발생했습니다." });
          }

          res.status(200).json({
            success: true,
            message: "임시 비밀번호가 전송되었습니다.",
          });
        }
      );
    });
  } catch (error) {
    console.error("임시 비밀번호 설정에 실패했습니다.", error);
    res
      .status(500)
      .json({ success: false, message: "서버에 오류가 발생했습니다." });
  }
};

// 임시 비밀번호 생성 함수
function generateTemporaryPassword() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 10;
  let temporaryPassword = "";

  for (let i = 0; i < length; i++) {
    temporaryPassword += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return temporaryPassword;
}

// 이메일로 임시 비밀번호 전송 함수
function sendTemporaryPasswordByEmail(transporter, email, temporaryPassword) {
  // 이메일 내용 설정
  const mailOptions = {
    from: process.env.GOOGLE_EMAIL, // .env 파일에 저장된 구글 계정 사용
    to: email,
    subject: "자취어때 임시비밀번호",
    text: `임시비밀번호는 ${temporaryPassword} 입니다.\n 로그인 시 비밀번호를 재설정해주세요!`,
  };

  // 이메일 보내기
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("메일 전송에 실패했습니다.:", error);
    } else {
      console.log("메일을 전송했습니다.:", info.response);
      console.log("임시 비밀번호:", temporaryPassword); // 임시 비밀번호 콘솔에 출력
    }
  });
}
