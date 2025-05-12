import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./resetPassword.scss";
import passwordIcon from "../../assets/img/password-icon.svg";
import eyeOpen from "../../assets/img/eye.svg";
import eyeClosed from "../../assets/img/close-eye.svg";
import  verifyIcon from "../../assets/img/verify-icon.svg";
import AuthRepository from "../../api/apiAuth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Token không hợp lệ");
        return;
      }

      try {
        await AuthRepository.verifyResetToken(token);
      } catch (error) {
        if (error.message === 'INVALID_RESET_TOKEN') {
          setError("Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ");
        } else {
          setError("Đã xảy ra lỗi khi xác thực token");
        }
      }
    };

    verifyToken();
  }, [token]);

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (confirmPwd) => {
    if (!confirmPwd) {
      setConfirmPasswordError("Vui lòng xác nhận mật khẩu");
      return false;
    } else if (confirmPwd !== newPassword) {
      setConfirmPasswordError("Mật khẩu xác nhận không khớp");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validatePassword(newPassword) || !validateConfirmPassword(confirmPassword)) {
      return;
    }

    setLoading(true);

    try {
      await AuthRepository.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      switch (error.message) {
        case 'INVALID_RESET_TOKEN':
          setError("Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ");
          break;
        case 'WEAK_PASSWORD':
          setError("Mật khẩu không đủ mạnh");
          break;
        case 'NETWORK_ERROR':
          setError("Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn");
          break;
        default:
          setError("Đã xảy ra lỗi. Vui lòng thử lại sau");
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-box">
          <div className="error-state">
            <h2>Không thể đặt mật khẩu</h2>
            <p>{error}</p>
            <button type="button" className="back-button" onClick={() => navigate("/login")}>
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2 className="reset-password-title">Đặt mật khẩu</h2>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <img src={passwordIcon} alt="Password Icon" className="icon" />
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                  if (confirmPassword) {
                    validateConfirmPassword(confirmPassword);
                  }
                }}
                required
              />
              <img
                src={passwordVisible ? eyeOpen : eyeClosed}
                alt="Toggle Password"
                className="icon toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
              />
            </div>
            {passwordError && <div className="validation-message">{passwordError}</div>}

            <div className="input-group">
              <img src={verifyIcon} alt="Password Icon" className="icon" />
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateConfirmPassword(e.target.value);
                }}
                required
              />
              <img
                src={confirmPasswordVisible ? eyeOpen : eyeClosed}
                alt="Toggle Password"
                className="icon toggle-password"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              />
            </div>
            {confirmPasswordError && (
              <div className="validation-message">{confirmPasswordError}</div>
            )}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>
            <button type="button" className="back-button" onClick={() => navigate("/login")}>
              Hủy
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>Mật khẩu đã được đặt lại thành công!</p>
            <p>Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
