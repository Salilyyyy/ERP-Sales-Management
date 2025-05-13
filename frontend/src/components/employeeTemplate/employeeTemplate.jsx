import React, { useState, useEffect, useCallback } from 'react';
import './employeeTemplate.scss';

const EmployeeTemplate = ({ user }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [base64Image, setBase64Image] = useState('');

  const convertImageToBase64 = useCallback(async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (user.image) {
      const loadImage = async () => {
        try {
          const base64 = await convertImageToBase64(user.image);
          if (base64) {
            setBase64Image(base64);
            setImageLoaded(true);
          } else {
            setImageError(true);
          }
        } catch (error) {
          setImageError(true);
        }
      };

      loadImage();
    }
  }, [user.image, convertImageToBase64]);
  return (
    <div className="employee-template">
      <div className="header">
        <div className="company-info">
          <h1>Hệ Thống ERP</h1>
          <p>Thông Tin Nhân Viên</p>
        </div>
      </div>

      <div className="content">
      <div className="employee-photo">
          {user.image && !imageError ? (
            <img 
              src={base64Image || user.image} 
              alt="Employee" 
              className={`photo ${imageLoaded ? 'loaded' : ''}`}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="photo placeholder">
              {user.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>
          )}
        </div>

        <div className="personal-info">
          <h2>{user.name}</h2>
          <div className="info-row">
            <span className="label">Mã nhân viên:</span>
            <span className="value">{user.ID}</span>
          </div>
          <div className="info-row">
            <span className="label">Phòng ban:</span>
            <span className="value">{user.department}</span>
          </div>
          <div className="info-row">
            <span className="label">Chức vụ:</span>
            <span className="value">{user.userType}</span>
          </div>
        </div>

        <div className="contact-info">
          <h3>Thông Tin Liên Hệ</h3>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Số điện thoại:</span>
            <span className="value">{user.phoneNumber || 'Chưa cập nhật'}</span>
          </div>
          <div className="info-row">
            <span className="label">Địa chỉ:</span>
            <span className="value">{user.address || 'Chưa cập nhật'}</span>
          </div>
        </div>

        <div className="additional-info">
          <h3>Thông Tin Khác</h3>
          <div className="info-row">
            <span className="label">CMND/CCCD:</span>
            <span className="value">{user.IdentityCard || 'Chưa cập nhật'}</span>
          </div>
          <div className="info-row">
            <span className="label">Ngày sinh:</span>
            <span className="value">
              {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Ngày vào làm:</span>
            <span className="value">
              {user.createAt ? new Date(user.createAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </span>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Tài liệu này được tạo tự động từ Hệ Thống ERP.</p>
      </div>
    </div>
  );
};

export default EmployeeTemplate;
