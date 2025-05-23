import React from 'react';
import './confirmPopup.scss';

const ConfirmPopup = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-popup-overlay">
      <div className="confirm-popup">
        <button className="close-button" onClick={onCancel}>&times;</button>
        <div className="confirm-popup-content">
          <h3>Xác nhận</h3>
          <p>{message}</p>
          <div className="confirm-popup-actions">
            <button className="btn-confirm" onClick={onConfirm}>Xác nhận</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
