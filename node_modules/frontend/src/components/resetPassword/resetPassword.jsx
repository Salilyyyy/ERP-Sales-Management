import React, { useState, useEffect } from "react";
import "./resetPassword.scss";
import lockIcon from "../../assets/img/lock-icon.svg";
import checkIcon from "../../assets/img/verify-icon.svg";
import eyeIcon from "../../assets/img/eye.svg";
import closeEyeIcon from "../../assets/img/close-eye.svg";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setErrorMessage("Mật khẩu không khớp, vui lòng nhập lại!");
    } else {
      setErrorMessage("");
    }
  }, [password, confirmPassword]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!errorMessage) {
      console.log("Mật khẩu đã được đặt lại:", password);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2 className="reset-title">Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <img src={lockIcon} alt="Lock Icon" className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? eyeIcon : closeEyeIcon}
              alt="Toggle Password"
              className="toggle-icon"
              onClick={togglePasswordVisibility}
            />
          </div>

          <div className="input-group">
            <img src={checkIcon} alt="Check Icon" className="icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <img
              src={showConfirmPassword ? eyeIcon : closeEyeIcon}
              alt="Toggle Confirm Password"
              className="toggle-icon"
              onClick={toggleConfirmPasswordVisibility}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="send-button" disabled={!!errorMessage}>
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
