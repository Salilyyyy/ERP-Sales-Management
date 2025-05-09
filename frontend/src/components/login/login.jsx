import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.scss";
import emailIcon from "../../assets/img/email-icon.svg";
import passwordIcon from "../../assets/img/password-icon.svg";
import eyeOpen from "../../assets/img/eye.svg";
import eyeClosed from "../../assets/img/close-eye.svg";

import AuthRepository from "../../api/apiAuth";
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { savedEmail, savedPassword } = JSON.parse(savedCredentials);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email không được để trống");
    } else if (!emailRegex.test(email)) {
      setEmailError("Email không đúng định dạng");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
    } else {
      setPasswordError("");
    }
  };

  useEffect(() => {
    if (AuthRepository.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthRepository.login(email, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          savedEmail: email,
          savedPassword: password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }

      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo);
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      // Handle specific error types from apiAuth
      switch (error.message) {
        case 'EMAIL_PASSWORD_INVALID':
          setError("Sai email hoặc mật khẩu. Vui lòng kiểm tra lại");
          break;
        case 'USER_NOT_FOUND':
          setError("Tài khoản không tồn tại");
          break;
        case 'ACCOUNT_LOCKED':
          setError("Tài khoản đã bị khóa. Vui lòng liên hệ admin");
          break;
        case 'ACCOUNT_NOT_VERIFIED':
          setError("Tài khoản chưa được xác thực. Vui lòng kiểm tra email");
          break;
        case 'NETWORK_ERROR':
          setError("Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn");
          break;
        case 'SERVER_ERROR':
          setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau");
          break;
        default:
          setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại sau");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <img src={emailIcon} alt="Email Icon" className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              required
            />
          </div>
          {emailError && <div className="validation-message">{emailError}</div>}

          <div className="input-group">
            <img src={passwordIcon} alt="Password Icon" className="icon" />
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
            />
            <img
              src={passwordVisible ? eyeOpen : eyeClosed}
              alt="Toggle Password"
              className="icon toggle-password"
              onClick={togglePasswordVisibility}
            />
          </div>
          {passwordError && <div className="validation-message">{passwordError}</div>}

          <div className="options">
            <label>
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> Nhớ mật khẩu
            </label>
            <a href="/forgot-password">Quên mật khẩu?</a>
          </div>

          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;