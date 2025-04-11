import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.scss";
import emailIcon from "../../assets/img/email-icon.svg";
import passwordIcon from "../../assets/img/password-icon.svg";
import eyeOpen from "../../assets/img/eye.svg";
import eyeClosed from "../../assets/img/close-eye.svg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Đăng nhập thành công:", data);
        alert("Đăng nhập thành công");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/dashboard");
      } else {
        console.error("Lỗi đăng nhập:", data.error);
        alert(data.error || "Đăng nhập thất bại");

      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      if (!navigator.onLine) {
        alert("Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn.");
      } else {
        alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <img src={passwordIcon} alt="Password Icon" className="icon" />
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={passwordVisible ? eyeOpen : eyeClosed}
              alt="Toggle Password"
              className="icon toggle-password"
              onClick={togglePasswordVisibility}
            />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Nhớ mật khẩu
            </label>
            <a href="/forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="login-button">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
