import React, { useState, useEffect } from "react";
import axios from "axios";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./MyPageChangePw.css";
import Toast from "../../../components/Toast/Toast";

const MyPageChangePw = () => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // 새 비밀번호 변경 시에만 유효성 검사를 수행합니다.
    if (newPassword) {
      const passwordRegex =
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
      if (!passwordRegex.test(newPassword)) {
        setPasswordError(
          "비밀번호는 5자 이상이어야 하며 영문, 숫자, 특수문자를 포함해야 합니다."
        );
      } else {
        setPasswordError("");
      }
    }
  }, [newPassword]);

  const handleChangePassword = async () => {
    // 비밀번호 확인
    if (newPassword === password) {
      setMessage("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    // 새 비밀번호 확인
    if (newPassword !== confirmNewPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.put(
        "https://jachwi.site/api/changePassword",
        {
          currentPassword: password,
          newPassword: newPassword,
        },
        { withCredentials: true }
      );

      console.log(response.data);
      setMessage(response.data.message);
      if (response.data.success) {
        // 비밀번호 변경이 성공하면 상태를 초기화합니다.
        setPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setToastMessage("비밀번호를 변경했습니다.");
        setTimeout(() => {
          setToastMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="mypagechangepw-container">
        <h1>비밀번호 변경</h1>
        <h4>현재 비밀번호가 일치하는 경우 새 비밀번호로 변경할 수 있습니다.</h4>
        <div>
          <label htmlFor="password">현재 비밀번호 </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newPassword">새 비밀번호 </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {passwordError && <p className="errormessage">{passwordError}</p>}
        </div>
        <div>
          <label htmlFor="confirmNewPassword">새 비밀번호 확인 </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
        </div>
        <button onClick={handleChangePassword}>변경하기</button>
        {message && <p className="message">{message}</p>}
      </div>
      <Toast message={toastMessage} showToast={toastMessage !== ""} />
    </div>
  );
};

export default MyPageChangePw;
