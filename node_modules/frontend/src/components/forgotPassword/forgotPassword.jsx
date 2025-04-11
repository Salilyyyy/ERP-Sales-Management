import React, { useState } from "react";
import "./forgotPassword.scss";
import emailIcon from "../../assets/img/email-icon.svg"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Reset link sent to:", email);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className="forgot-title">Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <img src={emailIcon} alt="Email Icon" className="icon" />
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="send-button">Gửi</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
