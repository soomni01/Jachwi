import React, { useState } from "react";
import axios from "axios"; // 로그인 요청을 보내기 위해 axios를 사용합니다.
import { Link, useNavigate } from "react-router-dom"; // useHistory를 import
import "./Login.css";

function Login() {
  // 로그인 폼의 상태를 관리하기 위한 useState 훅을 사용합니다.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // useHistory 훅 사용

  // 로그인 폼을 제출할 때 실행되는 함수입니다.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 사용자의 입력값을 서버로 전송하여 로그인을 시도합니다.
      const response = await axios.post(
        "https://jachwi.site/api/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log("로그인 성공");
        navigate("/main"); // 로그인 성공 시 메인 페이지로 이동
      } else {
        console.log("로그인 실패");
        alert("로그인에 실패하였습니다.");
      }
    } catch (error) {
      console.error("로그인 요청 중 에러 발생:", error);
      alert("로그인에 실패하였습니다.");
    }
  };

  const handlePasswordResetClick = () => {
    navigate("/findpw"); // 비밀번호 찾기 페이지로 이동
  };

  return (
    <div className="login">
      <div className="login_main">
        <h2 className="mainName">로그인</h2>
        <form className="login_form" onSubmit={handleSubmit}>
          <div className="inputTag">
            <input
              className="input-text"
              type="text"
              value={email}
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="input_id">
              이메일 <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
            </label>
          </div>

          <div style={{ marginTop: "26px" }} />

          <div className="inputTag">
            <input
              className="input-text"
              type="password"
              value={password}
              placeholder="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="input_pw">
              비밀번호{" "}
              <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
            </label>
          </div>
          <p className="link_box_findpw" style={{ textAlign: "right" }}>
            <span
              style={{ cursor: "pointer" }}
              onClick={handlePasswordResetClick}
            >
              비밀번호 찾기
            </span>
          </p>
          <div style={{ marginTop: "26px" }} />
          <button id="login_btn" type="submit">
            로그인
          </button>
          <p className="link_box" style={{ textAlign: "center" }}>
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
          {/* <Link to='#'>비밀번호를 잊어버리셨나요?</Link> */}
        </form>
      </div>
    </div>
  );
}

export default Login;
