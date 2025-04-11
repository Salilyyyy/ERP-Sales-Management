import React, { useEffect, useState } from "react";
import "./setting.scss";
import darkModeIcon from "../../assets/img/dark-mode.svg";
import lightModeIcon from "../../assets/img/mode-light.svg";
import eyeIcon from "../../assets/img/white-eye.svg";
import questionIcon from "../../assets/img/question-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [isDarkMode, fontSize]);

  return (
    <div className="settings-container">
      <h2 className="settings-title">Cài đặt</h2>

      <div className="setting-item">
        <label>Thiết lập màn hình</label>
        <button
          className={`theme-toggle ${isDarkMode ? "dark" : "light"}`}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          <img src={darkModeIcon} alt="Dark" className="icon moon" />
          <img src={lightModeIcon} alt="Light" className="icon sun" />
          <div className="toggle-indicator" />
        </button>
      </div>

      <div className="setting-item">
        <label>Cỡ chữ</label>
        <div className="font-size-toggle">
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="small">Nhỏ</option>
            <option value="medium">Vừa</option>
            <option value="large">Lớn</option>
          </select>
        </div>
      </div>

      <div className="setting-item">
        <label>Ngôn ngữ</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="vi">Việt Nam</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="setting-item">
        <label>Nội dung email mới</label>
        <button className="preview-btn">
          Xem trước <img src={eyeIcon} alt="Xem trước" />
        </button>
      </div>

      <div className="setting-item">
        <label>Trợ giúp</label>
        <img src={questionIcon} alt="Trợ giúp" className="help-icon" />
      </div>

      <button className="save-btn">
        <img src={saveIcon} alt="Lưu" />
        Lưu
      </button>
    </div>
  );
};

export default Settings;
