import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthRepository from "../../api/apiAuth";
import "./login.scss";
import emailIcon from "../../assets/img/email-icon.svg";
import passwordIcon from "../../assets/img/password-icon.svg";
import eyeIcon from "../../assets/img/eye.svg";
import closeEyeIcon from "../../assets/img/close-eye.svg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

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

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await AuthRepository.login(email, password);
      console.log('Login response:', response);
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        details: err.details,
        status: err.status
      });
      
      // Use the API error message directly
      setError(err.message);
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
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              required
            />
            <img
              src={showPassword ? closeEyeIcon : eyeIcon}
              alt="Toggle Password"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          {passwordError && <div className="validation-message">{passwordError}</div>}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <button
            type="button"
            className="forgot-password-button"
            onClick={() => navigate("/forgot-password")}
          >
            Quên mật khẩu?
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
