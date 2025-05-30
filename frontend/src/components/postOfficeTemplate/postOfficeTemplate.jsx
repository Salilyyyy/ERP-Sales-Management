import React from 'react';
import './postOfficeTemplate.scss';

const PostOfficeTemplate = ({ office }) => {
  return (
    <div className="postoffice-template">
      <div className="header">
        <div className="company-info">
          <h1>CÔNG TY TNHH ERP SYSTEM</h1>
          <p>123 Đường XYZ, Quận ABC, TP.ĐÀ NẴNG</p>
          <p>SĐT: (028) 1234 5678</p>
          <p>Email: hello@erpsystem.io.vn</p>
        </div>
        <div className="template-title">
          <h1>CHI TIẾT BƯU CỤC</h1>
          <p className="postoffice-number">Mã: #BC-{office?.ID}</p>
          <p className="postoffice-date">Ngày xuất: {new Date().toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <div className="postoffice-info">
        <div className="info-group">
          <h3>THÔNG TIN BƯU CỤC</h3>
          <table>
            <tbody>
              <tr>
                <td><strong>Mã bưu cục:</strong></td>
                <td>#BC-{office?.ID}</td>
              </tr>
              <tr>
                <td><strong>Tên bưu cục:</strong></td>
                <td>{office?.name}</td>
              </tr>
              <tr>
                <td><strong>Số điện thoại:</strong></td>
                <td>{office?.phoneNumber || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{office?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Địa chỉ:</strong></td>
                <td>{office?.address || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="postoffice-footer">
        <div className="signatures">
          <div className="signature-block">
            <p>Người lập phiếu</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="signature-block">
            <p>Người quản lý</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostOfficeTemplate;
