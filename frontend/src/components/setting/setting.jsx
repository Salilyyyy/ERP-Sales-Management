import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./setting.scss";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

import eyeIcon from "../../assets/img/white-eye.svg";
import questionIcon from "../../assets/img/question-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";

const Settings = () => {
  const { language, setLanguage } = useLanguage();
  const [fontSize, setFontSize] = useState("medium");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emailContent, setEmailContent] = useState({
    subject: "Welcome to our service",
    body: `Dear {customerName},

Thank you for choosing our service. We're excited to have you on board!

Best regards,
The Team`
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(emailContent);
  const t = translations[language];

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    const size = language === 'en' ? translations.en[e.target.value] : translations.vi[e.target.value];
    toast.success(t.fontSizeChanged(size));
  };

  useEffect(() => {
    if (showEmailModal) {
      setIsModalVisible(true);
    }
  }, [showEmailModal]);

  const handleCloseModal = () => {
    setShowEmailModal(false);
    setIsEditing(false);
    setEditedContent(emailContent);
  };

  const handleModalTransitionEnd = () => {
    if (!showEmailModal) {
      setIsModalVisible(false);
    }
  };

  return (
    <>
      {isModalVisible && (
        <div 
          className={`email-modal ${showEmailModal ? 'show' : ''}`}
          onTransitionEnd={handleModalTransitionEnd}
        >
          <div className={`email-modal-content ${showEmailModal ? 'show' : ''}`}>
            <div className="modal-header">
              <h3>{isEditing ? t.editEmail : t.previewEmail}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              {isEditing ? (
                <>
                  <div className="form-group">
                    <label>{t.subject}</label>
                    <input
                      type="text"
                      value={editedContent.subject}
                      onChange={(e) => setEditedContent({
                        ...editedContent,
                        subject: e.target.value
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.body}</label>
                    <textarea
                      value={editedContent.body}
                      onChange={(e) => setEditedContent({
                        ...editedContent,
                        body: e.target.value
                      })}
                      rows={8}
                    />
                  </div>
                </>
              ) : (
                <div className="email-preview">
                  <div className="email-subject">
                    <strong>{t.subject}:</strong> {emailContent.subject}
                  </div>
                  <div className="email-body">
                    {emailContent.body.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {isEditing ? (
                <>
                  <button className="save-btn" onClick={() => {
                    setEmailContent(editedContent);
                    setIsEditing(false);
                    toast.success(t.emailTemplateUpdated);
                  }}>
                    <img src={saveIcon} alt="save" />
                    {t.save}
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setIsEditing(false);
                    setEditedContent(emailContent);
                  }}>
                    {t.cancel}
                  </button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <img src={editIcon} alt="edit" />
                  {t.edit}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="settings-container">
        <h2 className="settings-title">{t.settings}</h2>

        <div className="setting-item">
          <label>{t.fontSize}</label>
          <div className="font-size-toggle">
            <select value={fontSize} onChange={handleFontSizeChange}>
              <option value="small">{t.small}</option>
              <option value="medium">{t.medium}</option>
              <option value="large">{t.large}</option>
            </select>
          </div>
        </div>

        <div className="setting-item">
          <label>{t.language}</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="vi">Việt Nam</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="setting-item">
          <label>{t.newEmail}</label>
          <button className="preview-btn" onClick={() => setShowEmailModal(true)}>
            {t.preview} <img src={eyeIcon} alt={t.preview} />
          </button>
        </div>

        <div className="setting-item">
          <label>{t.help}</label>
          <div className="help-container">
            <img src={questionIcon} alt={t.help} className="help-icon" />
            <div className="help-tooltip">
              <h3>{t.helpTitle}</h3>
              {t.helpFontSize}
              {'\n\n'}
              {t.helpLanguage}
              {'\n\n'}
              {t.helpEmail}
              {'\n\n'}
              {t.helpSupport}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
