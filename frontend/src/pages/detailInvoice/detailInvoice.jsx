import React, { useState, useEffect } from "react";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import { useParams, useNavigate } from "react-router-dom";
import "./detailInvoice.scss";
import InvoiceRepository from "../../api/apiInvoice";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";

const OrderDetails = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState(null);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await InvoiceRepository.delete(id);
      if (response.success) {
        alert("Xóa hóa đơn thành công!");
        navigate("/invoices");
      } else {
        alert(response.message || "Không thể xóa hóa đơn!");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      if (error.message?.includes('Foreign key constraint')) {
        alert("Không thể xóa hóa đơn vì có dữ liệu liên quan! Vui lòng xóa vận đơn trước khi xóa hóa đơn.");
      } else {
        alert("Không thể xóa hóa đơn! Vui lòng thử lại sau.");
      }
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInvoice({
      ...invoice,
      isPaid: invoice.isPaid,
      isDelivery: invoice.isDelivery,
      paymentMethod: invoice.paymentMethod || "",
      notes: invoice.notes || ""
    });
  };

  const handleSave = async () => {
    try {
      // Only send the fields that can be edited
      const updateData = {
        isPaid: editedInvoice.isPaid,
        isDelivery: editedInvoice.isDelivery,
        paymentMethod: editedInvoice.paymentMethod,
        notes: editedInvoice.notes
      };
      
      const response = await InvoiceRepository.update(id, updateData);
      if (response.success) {
        setInvoice({
          ...invoice,
          ...updateData
        });
        setIsEditing(false);
        alert("Cập nhật hóa đơn thành công!");
      } else {
        alert(response.message || "Không thể cập nhật hóa đơn!");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Không thể cập nhật hóa đơn! Vui lòng thử lại sau.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInvoice(null);
  };

  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Hóa đơn #${invoice?.ID}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 20px; }
            .info-section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .summary { margin-top: 20px; text-align: right; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>#ĐH-${invoice?.ID}</p>
            <p>Ngày: ${new Date(invoice?.exportTime).toLocaleString("vi-VN")}</p>
          </div>

          <div class="info-section">
            <p><strong>Khách hàng:</strong> ${invoice?.Customers?.name}</p>
            <p><strong>Địa chỉ:</strong> ${invoice?.Customers?.address}</p>
            <p><strong>Số điện thoại:</strong> ${invoice?.Customers?.phoneNumber}</p>
          </div>

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
              ${invoice?.InvoiceDetails?.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.Products?.name || "N/A"}</td>
                  <td>${item.Products?.unit || "N/A"}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.unitPrice || 0).toLocaleString("vi-VN")} VND</td>
                  <td>${((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VND</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <p><strong>Tổng tiền hàng:</strong> ${totalItems.toLocaleString("vi-VN")} VND</p>
            <p><strong>Thuế GTGT:</strong> ${(invoice?.tax || 0).toLocaleString("vi-VN")} VND</p>
            <p><strong>Khuyến mãi:</strong> ${promotionDiscount.toLocaleString("vi-VN")} VND</p>
            <p class="total"><strong>Tổng thanh toán:</strong> ${totalPayment.toLocaleString("vi-VN")} VND</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await InvoiceRepository.getById(id);
        if (response.success && response.data) {
          setInvoice(response.data);
        } else {
          setError("Không tìm thấy thông tin hóa đơn");
        }
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin hóa đơn");
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error || !invoice) {
    return <h2>{error || "Không tìm thấy hóa đơn!"}</h2>;
  }

  const totalItems = invoice.InvoiceDetails?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
  const promotionDiscount = invoice.Promotions ?
    (invoice.Promotions.type === 'percentage' ?
      (totalItems * invoice.Promotions.value / 100) :
      invoice.Promotions.value) : 0;
  const totalPayment = totalItems + (invoice.tax || 0) - promotionDiscount;

  return (
    <>
      <ConfirmPopup
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa hóa đơn này?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <div className="order-details">
        <div className="header">
          <div className="back" onClick={() => navigate(-1)}>
            <img src={backIcon} alt="Quay lại" />
          </div>
          <h2>Chi tiết đơn hàng</h2>
        </div>
        <div className="actions">
          {isEditing ? (
            <>
              <button className="save" onClick={handleSave}><img src={editIcon} alt="Lưu" /> Lưu thay đổi</button>
              <button className="cancel" onClick={handleCancel}><img src={deleteIcon} alt="Hủy" /> Hủy</button>
            </>
          ) : (
            <>
              <button className="delete" onClick={handleDelete}><img src={deleteIcon} alt="Xóa" /> Xóa hóa đơn</button>
              <button className="edit" onClick={handleEdit}><img src={editIcon} alt="Sửa" /> Sửa hóa đơn</button>
              <button className="print" onClick={handlePrint}><img src={printIcon} alt="In" /> In hóa đơn</button>
            </>
          )}
        </div>
        <div className="order-info">
          <h3 className="order-id">#ĐH-{invoice.ID}</h3>
          <div className="info-grid">
            <div><strong>Nhân viên bán:</strong> {invoice.Users?.name || "N/A"}</div>
            <div><strong>Thời gian tạo:</strong> {new Date(invoice.exportTime).toLocaleString("vi-VN")}</div>
            <div><strong>Khách hàng:</strong> {invoice.Customers?.name || "N/A"}</div>
            <div><strong>Số điện thoại:</strong> {invoice.Customers?.phoneNumber || "N/A"}</div>
            <div><strong>Tên người nhận:</strong> {invoice.Customers?.name || "N/A"}</div>
            <div><strong>SĐT người nhận:</strong> {invoice.Customers?.phoneNumber || "N/A"}</div>
            <div><strong>Địa chỉ người nhận:</strong> {invoice.Customers?.address || "N/A"}</div>
            <div><strong> </strong> </div>
            <div>
              <strong>Trạng thái thanh toán:</strong>
              {isEditing ? (
                <select 
                  value={editedInvoice.isPaid}
                  onChange={(e) => setEditedInvoice({...editedInvoice, isPaid: e.target.value === 'true'})}
                >
                  <option value="true">Đã thanh toán</option>
                  <option value="false">Chưa thanh toán</option>
                </select>
              ) : (
                invoice.isPaid ? "Đã thanh toán" : "Chưa thanh toán"
              )}
            </div>
            <div>
              <strong>Trạng thái giao hàng:</strong>
              {isEditing ? (
                <select
                  value={editedInvoice.isDelivery}
                  onChange={(e) => setEditedInvoice({...editedInvoice, isDelivery: e.target.value === 'true'})}
                >
                  <option value="true">Đã giao hàng</option>
                  <option value="false">Chưa giao hàng</option>
                </select>
              ) : (
                invoice.isDelivery ? "Đã giao hàng" : "Chưa giao hàng"
              )}
            </div>
            <div>
              <strong>Hình thức thanh toán:</strong>
              {isEditing ? (
                <select
                  value={editedInvoice.paymentMethod}
                  onChange={(e) => setEditedInvoice({...editedInvoice, paymentMethod: e.target.value})}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="card">Thẻ</option>
                </select>
              ) : (
                invoice.paymentMethod || "N/A"
              )}
            </div>
            <div><strong>Khuyến mãi áp dụng:</strong> {invoice.Promotions?.name || "Không có"}</div>
            <div><strong>Giá trị khuyến mãi:</strong> {invoice.Promotions ? `${invoice.Promotions.value}${invoice.Promotions.type === 'percentage' ? '%' : ' VND'}` : "0"}</div>
            <div>
              <strong>Ghi chú:</strong>
              {isEditing ? (
                <textarea
                  value={editedInvoice.notes}
                  onChange={(e) => setEditedInvoice({...editedInvoice, notes: e.target.value})}
                  rows="3"
                  style={{ width: '100%' }}
                />
              ) : (
                invoice.notes || "N/A"
              )}
            </div>
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
              {invoice.InvoiceDetails?.map((item, index) => (
                <tr key={item.ID}>
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
          <div className="summary">
            <p><strong>Tổng tiền hàng:</strong> {(totalItems || 0).toLocaleString("vi-VN")} VND</p>
            <p><strong>Thuế GTGT:</strong> {(invoice.tax || 0).toLocaleString("vi-VN")} VND</p>
            <p><strong>Khuyến mãi:</strong> {promotionDiscount.toLocaleString("vi-VN")} VND</p>
            <p className="total"><strong>Tổng thanh toán:</strong> {totalPayment.toLocaleString("vi-VN")} VND</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
