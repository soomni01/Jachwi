import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../../../components/NavigationBar/NavigationBar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import axios from "axios";
import ConfirmationModal from "./confirmationModal"; // 모달 컴포넌트를 불러옵니다.
import "./MyPageWithdraw.css";

const MyPageWithdraw = () => {
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false); // 모달의 표시 여부를 관리할 상태 추가
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // 회원 탈퇴 버튼 클릭 시 모달을 표시하는 함수
  const handleWithdraw = () => {
    setShowModal(true);
  };

  // 모달에서 확인 버튼 클릭 시 실행될 함수
  const handleConfirmWithdraw = async () => {
    try {
      // 비밀번호를 서버로 전송하여 처리
      const response = await axios.delete(
        "https://jachwi.site/api/withdraw",
        {
          data: { password },
          withCredentials: true,
        }
      );

      // 서버에서 응답을 받아 처리
      if (response.data.success) {
        navigate("/"); // 회원 탈퇴 성공 시 홈 페이지로 이동
      } else {
        // 응답이 실패한 경우 에러 메시지 설정
        if (response.status === 404) {
          setError(response.data.message);
        } else {
          setError("회원 탈퇴에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("회원 탈퇴 요청 중 오류 발생:", error);
      setError("회원 탈퇴 요청 중 오류가 발생했습니다.");
    } finally {
      setShowModal(false); // 모달 닫기
    }
  };

  // 모달에서 취소 버튼 클릭 시 실행될 함수
  const handleCloseModal = () => {
    setShowModal(false); // 모달 닫기
  };

  return (
    <div>
      <div className="navbar">
        <NavigationBar />
      </div>
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="mypagewithdraw-container">
        <h1>회원 탈퇴</h1>
        <h4>회원 탈퇴를 원하시는 경우 비밀번호를 입력해주세요.</h4>
        <div className="password-input-container">
          <label htmlFor="password"></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="비밀번호를 입력해주세요."
          />
        </div>
        <button className="withdraw-button" onClick={handleWithdraw}>
          회원탈퇴
        </button>
      </div>
      {/* 모달 컴포넌트 */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmWithdraw}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default MyPageWithdraw;
