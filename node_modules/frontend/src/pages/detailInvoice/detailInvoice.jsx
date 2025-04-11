import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./detailInvoice.scss";
import { invoices } from "../../mock/mock";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";

const OrderDetails = () => {
  const { id } = useParams();  
  const navigate = useNavigate(); 
  const invoice = invoices.find((inv) => inv.id.toString() === id); 

  if (!invoice) {
    return <h2>Không tìm thấy hóa đơn!</h2>;
  }

  const totalItems = invoice.details.items?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0) || 0;
  const totalPayment = totalItems + (invoice.details.tax || 0) + (invoice.details.shippingFee || 0) - (invoice.details.discount || 0);

  return (
    <div className="order-details">
      <div className="header">
        <div className="back" onClick={() => navigate("/invoices")}>
          <img src={backIcon} alt="Quay lại" /> 
        </div>
        <h2>Chi tiết đơn hàng</h2>
      </div>
        <div className="actions">
            <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa hóa đơn</button>
            <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa hóa đơn</button>
            <button className="print"><img src={printIcon} alt="In" /> In hóa đơn</button>
        </div>
      <div className= "order-info">
        <h3 className="order-id">#ĐH-{invoice.id}</h3>
        <div className="info-grid">
          <div><strong>Nhân viên bán:</strong> {invoice.details.employee}</div>
          <div><strong>Thời gian tạo:</strong> {invoice.details.createdAt}</div>
          <div><strong>Khách hàng:</strong> {invoice.customer}</div>
          <div><strong>Số điện thoại:</strong> {invoice.details.customerPhone}</div>
          <div><strong>Tên người nhận:</strong> {invoice.details.receiverName}</div>
          <div><strong>SĐT người nhận:</strong> {invoice.details.receiverPhone}</div>
          <div><strong>Địa chỉ người nhận:</strong> {invoice.details.address}</div>
          <div><strong> </strong> </div>
          <div><strong>Trạng thái đơn hàng:</strong> {invoice.paid ? "Đã thanh toán" : "Chưa thanh toán"}</div>
          <div><strong>Hình thức thanh toán:</strong> {invoice.details.paymentMethod}</div>
          <div><strong>Mã vận đơn:</strong> {invoice.details.trackingCode}</div>
          <div><strong>Bưu cục:</strong> {invoice.details.courier}</div>
          <div><strong>Thời gian gửi:</strong> {invoice.details.sendTime}</div>
          <div><strong>Thời gian nhận dự kiến:</strong> {invoice.details.estimatedDelivery}</div>
          <div><strong>Ghi chú:</strong> {invoice.details.notes}</div>
        </div>
      </div>

      <div className="invoice-details">
        <h3>Chi tiết hóa đơn</h3>
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
            {invoice.details.items?.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{(item.price || 0).toLocaleString()} VND</td>
                <td>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary">
          <p><strong>Tổng tiền hàng:</strong> {(totalItems || 0).toLocaleString()} VND</p>
          <p><strong>Thuế GTGT:</strong> {(invoice.details.tax || 0).toLocaleString()} VND</p>
          <p><strong>Phí vận chuyển:</strong> {(invoice.details.shippingFee || 0).toLocaleString()} VND</p>
          <p><strong>Khuyến mãi:</strong> {(invoice.details.discount || 0).toLocaleString()} VND</p>
          <p className="total"><strong>Tổng thanh toán:</strong> {(totalPayment || 0).toLocaleString()} VND</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
