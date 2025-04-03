import React, { useState } from "react";
import "./login.scss";
import emailIcon from "../../assets/img/email-icon.svg";
import passwordIcon from "../../assets/img/password-icon.svg";
import eyeOpen from "../../assets/img/eye.svg";  
import eyeClosed from "../../assets/img/close-eye.svg";  

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập</h2>
        <form>
          <div className="input-group">
            <img src={emailIcon} alt="Email Icon" className="icon" />
            <input type="email" placeholder="Email" required />
          </div>

          <div className="input-group">
            <img src={passwordIcon} alt="Password Icon" className="icon" />
            <input 
              type={passwordVisible ? "text" : "password"} 
              placeholder="Mật khẩu" 
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
