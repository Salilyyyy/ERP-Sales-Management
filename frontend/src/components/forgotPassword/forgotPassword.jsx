import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./forgotPassword.scss";
import emailIcon from "../../assets/img/email-icon.svg";
import AuthRepository from "../../api/apiAuth";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email không được để trống");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không đúng định dạng");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setPreviewUrl("");

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const result = await AuthRepository.requestPasswordReset(email);
      setSuccess(true);
      if (result.debug?.previewUrl) {
        setPreviewUrl(result.debug.previewUrl);
      }
    } catch (error) {
      console.error("Lỗi khi yêu cầu đặt lại mật khẩu:", error);
      switch (error.message) {
        case 'USER_NOT_FOUND':
          setError("Email không tồn tại trong hệ thống");
          break;
        case 'EMAIL_NOT_VERIFIED':
          setError("Email chưa được xác thực");
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

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2 className="forgot-password-title">Quên mật khẩu</h2>
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <img src={emailIcon} alt="Email Icon" className="icon" />
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                required
              />
            </div>
            {emailError && <div className="validation-message">{emailError}</div>}
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
            <button type="button" className="back-button" onClick={() => navigate("/login")}>
              Quay lại đăng nhập
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>Email đặt lại mật khẩu đã được gửi.</p>
            {previewUrl && (
              <>
                <p>Kiểm tra email trong Mailtrap:</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link"
                >
                  Xem email trong Mailtrap
                </a>
              </>
            )}
            <button type="button" className="back-button" onClick={() => navigate("/login")}>
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
