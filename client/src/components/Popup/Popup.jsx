// Popup.js
import React from "react";
import DaumPostcode from "react-daum-postcode";
import "./Popup.css";

const Popup = ({ open, onClose, onComplete }) => {
  if (!open) return null;

  const handleComplete = (data) => {
    onComplete(data);
    onClose();
  };

  return (
    <div className="popup-modal">
      <div className="popup-modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2 className="addressSearch">주소 검색</h2>
        <div className="modal-body">
          <DaumPostcode onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
};

export default Popup;
