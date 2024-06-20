import React, { useState, useEffect } from "react";
import "./Toast.css"; // 스타일링 파일

const Toast = ({ message, showToast }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("showToast:", showToast); // showToast 상태를 확인합니다.
    console.log("toastMessage:", message); // toastMessage 상태를 확인합니다.
    console.log("isVisible:", isVisible); // isVisible 상태를 로그로 확인
    if (showToast) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false); // showToast가 false일 때는 토스트를 숨깁니다.
    }
  }, [showToast, message, isVisible]); // isVisible 추가

  return isVisible ? (
    <div className="toast-container show">
      <div className="toast-message">{message}</div>
    </div>
  ) : null;
};

export default Toast;
