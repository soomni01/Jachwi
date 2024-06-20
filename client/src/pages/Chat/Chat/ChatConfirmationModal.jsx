// ConfirmationModal.js

import React from "react";

const ConfirmationModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="modal-delete-chat">
      <div className="modal-delete-chat-content">
        <h2>채팅방을 삭제하시겠습니까?</h2>
        <p>삭제하실 경우, 모든 대화내용이 사라집니다.</p>
        <div className="modal-delete-actions">
          <button onClick={onConfirm} className="confirm-button">
            확인
          </button>
          <button onClick={onCancel} className="cancel-button">
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
