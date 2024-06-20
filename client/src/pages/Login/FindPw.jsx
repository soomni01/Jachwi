import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Login.css";

const FindPw = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://jachwi.site/api/reset-password-request",
        { username, email }
      );

      if (response.data.success) {
        setMessage("임시 비밀번호가 이메일로 전송되었습니다.");
        // 추가적인 UI 처리나 페이지 이동 등을 할 수 있음
      } else {
        setMessage("사용자를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("임시 비밀번호 요청 중 오류가 발생했습니다.", error);
      setMessage("임시 비밀번호 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login">
      <div className="login_main">
        <h2>비밀번호 찾기</h2>
        <h2 className="text">
          사용자 확인 시 임시 비밀번호가 메일로 전송됩니다.
        </h2>
        <form className="login_form:" onSubmit={handleSubmit}>
          <div className="inputTag">
            <input
              className="input-text"
              type="text"
              value={username}
              placeholder="id"
              onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="input_id">
              아이디 <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
            </label>
          </div>

          <br />
          <div className="inputTag">
            <input
              className="input-text"
              type="email"
              id="input.emai_"
              value={email}
              placeholder="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="input_email">
              이메일 <span style={{ paddingLeft: "5px", color: "red" }}>*</span>
            </label>
          </div>
          <br />
          <button id="login_btn" type="submit">
            확인
          </button>
        </form>
        {message && <p>{message}</p>}
        <p className="link_box" style={{ textAlign: "center" }}>
          계정이 있으신가요? <Link to="/">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default FindPw;
