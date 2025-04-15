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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (AuthRepository.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const validateEmail = (value) => {
    if (!value) setEmailError("Email không được để trống");
    else if (!value.includes("@")) setEmailError("Email không đúng định dạng");
    else setEmailError("");
  };

  const validatePassword = (value) => {
    if (!value) setPasswordError("Mật khẩu không được để trống");
    else setPasswordError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    validateEmail(email);
    validatePassword(password);

    if (!email || !password || emailError || passwordError) return;

    setLoading(true);
    try {
      const res = await AuthRepository.login(email, password);
      if (res?.token) {
        const redirectTo = location.state?.from?.pathname || "/dashboard";
        navigate(redirectTo);
      }
    } catch (err) {
      console.error("Login error:", err);

      if (!navigator.onLine) {
        setError("Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.");
      } else if (err.message === "Invalid email or password") {
        setError("Email hoặc mật khẩu không chính xác");
      } else if (err.message === "Email and password are required") {
        setError("Email hoặc mật khẩu không được để trống");
      } else if (err.message.includes("Server connection failed")) {
        setError("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
      setLoading(false);
    }

  }


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
          {emailError && <div className="input-error">{emailError}</div>}

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
          {passwordError && <div className="input-error">{passwordError}</div>}

          <div className="options">
            <label>
              <input type="checkbox" /> Nhớ mật khẩu
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
