import React from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-withdraw">
      <div className="modal-withdraw-content">
        <h2>정말 탈퇴하시겠습니까?</h2>
        <p>탈퇴하실 경우, 모든 정보가 다 사라집니다.</p>
        <div className="modal-withdraw-actions">
          <button onClick={onConfirm} className="confirm-button">
            확인
          </button>
          <button onClick={onClose} className="cancel-button">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
