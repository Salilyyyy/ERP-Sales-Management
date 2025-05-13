import React from 'react';
import './invoiceTemplate.scss';

const InvoiceTemplate = ({ invoice, totalItems, taxAmount, promotionDiscount, totalPayment }) => {
  return (
    <div className="invoice-template">
      <div className="header">
        <div className="company-info">
          <h1>CÔNG TY TNHH ERP SYSTEM</h1>
          <p>123 Đường XYZ, Quận ABC, TP.ĐÀ NẴNG</p>
          <p>SĐT: (028) 1234 5678</p>
          <p>Email: hello@erpsystem.io.vn</p>
        </div>
        <div className="invoice-title">
          <h1>HÓA ĐƠN BÁN HÀNG</h1>
          <p className="invoice-number">Số: #ĐH-{invoice?.ID}</p>
          <p className="invoice-date">Ngày: {new Date(invoice?.exportTime).toLocaleString("vi-VN")}</p>
        </div>
      </div>

      <div className="customer-info">
        <div className="info-group">
          <h3>THÔNG TIN KHÁCH HÀNG</h3>
          <table>
            <tbody>
              <tr>
                <td><strong>Tên khách hàng:</strong></td>
                <td>{invoice?.Customers?.name}</td>
              </tr>
              <tr>
                <td><strong>Địa chỉ:</strong></td>
                <td>{invoice?.Customers?.address}</td>
              </tr>
              <tr>
                <td><strong>Số điện thoại:</strong></td>
                <td>{invoice?.Customers?.phoneNumber}</td>
              </tr>
              <tr>
                <td><strong>Hình thức thanh toán:</strong></td>
                <td>
                  {invoice?.paymentMethod === "tienMat" ? "Tiền mặt" :
                    invoice?.paymentMethod === "chuyenKhoan" ? "Chuyển khoản" :
                      invoice?.paymentMethod === "the" ? "Thẻ" : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="invoice-items">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.InvoiceDetails?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.Products?.name || "N/A"}</td>
                <td>{item.Products?.unit || "N/A"}</td>
                <td>{item.quantity}</td>
                <td>{(item.unitPrice || 0).toLocaleString("vi-VN")} VND</td>
                <td>{((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-summary">
        <div className="summary-details">
          <div className="summary-row">
            <span>Tổng tiền hàng:</span>
            <span>{totalItems.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="summary-row">
            <span>Thuế GTGT ({invoice?.tax || 0}%):</span>
            <span>{taxAmount.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="summary-row">
            <span>Khuyến mãi:</span>
            <span>{promotionDiscount.toLocaleString("vi-VN")} VND</span>
          </div>
          <div className="summary-row total">
            <span>Tổng thanh toán:</span>
            <span>{totalPayment.toLocaleString("vi-VN")} VND</span>
          </div>
        </div>
      </div>

      <div className="invoice-footer">
        <div className="signatures">
          <div className="signature-block">
            <p>Người mua hàng</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="signature-block">
            <p>Người bán hàng</p>
            <p>(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
        <div className="thank-you">
          <p>Cảm ơn quý khách đã mua hàng!</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
