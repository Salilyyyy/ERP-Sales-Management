import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./detailShipping.scss";
import { toast } from 'react-toastify';
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import apiShipping from "../../api/apiShipping";
import apiPostOffice from "../../api/apiPostOffice";

const DetailShipping = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [order, setOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postOffices, setPostOffices] = useState([]);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const result = await apiShipping.getById(id);
        setOrder(result);
        if (isEditMode) {
          setEditedOrder(result);
        }
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu vận đơn");
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();

    const fetchPostOffices = async () => {
      try {
        const result = await apiPostOffice.getAll();
        setPostOffices(result);
      } catch (err) {
        console.error("Error fetching post offices:", err);
        toast.error("Không thể tải danh sách bưu cục");
      }
    };

    fetchPostOffices();
  }, [id, isEditMode]);

  useEffect(() => {
    if (isEditMode && order) {
      setEditedOrder({ ...order });
    }
  }, [isEditMode, order]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const handleChange = (field, value) => {
    setEditedOrder(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setEditedOrder({ ...order });
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    try {
      await apiShipping.update(id, editedOrder);
      setOrder(editedOrder);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("edit");
      setSearchParams(newSearchParams);
      toast.success("Cập nhật thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật: " + err.message);
    }
  };

  const handleCancel = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("edit");
    setSearchParams(newSearchParams);
    setEditedOrder(null);
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vận đơn này không?")) {
      try {
        await apiShipping.delete(id);
        toast.success("Xóa vận đơn thành công!");
        navigate("/shipping-list");
      } catch (err) {
        toast.error("Lỗi khi xóa vận đơn: " + err.message);
      }
    }
  };

  if (loading) return <div className="order-detail-container">Đang tải dữ liệu...</div>;
  if (error) return <div className="order-detail-container">Lỗi: {error}</div>;
  if (!order) return <div className="order-detail-container">Không tìm thấy đơn hàng</div>;

  return (
    <div className="order-detail-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/shipping-list")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Chi tiết vận đơn</h2>
      </div>

      <div className="actions">
        {!isEditMode ? (
          <>
            <button className="edit" onClick={handleEditClick}>
              <img src={editIcon} alt="Sửa" /> Sửa
            </button>
            <button className="delete" onClick={handleDelete}>
              <img src={deleteIcon} alt="Xóa" /> Xóa
            </button>
            <button className="print"><img src={printIcon} alt="In" /> In</button>
          </>
        ) : (
          <>
            <button className="save" onClick={handleSave}>
              <img src={saveIcon} alt="Lưu" /> Lưu
            </button>
            <button className="cancel" onClick={handleCancel}>
              <img src={cancelIcon} alt="Hủy" /> Hủy
            </button>
          </>
        )}
      </div>

      <div className="content">
        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Mã vận đơn</div>
            <div className="info-value-id">#{order.ID}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Mã hóa đơn</div>
            <div className="info-value">#{order.Invoices?.ID}</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Bưu cục gửi</div>
            <div className="info-value">
              {isEditMode ? (
                <select
                  value={editedOrder.postOfficeId}
                  onChange={(e) => handleChange("postOfficeId", parseInt(e.target.value))}
                >
                  {postOffices.map((office) => (
                    <option key={office.ID} value={office.ID}>
                      {office.name}
                    </option>
                  ))}
                </select>
              ) : (
                order.PostOffices?.name
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Tên người nhận</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  value={editedOrder.receiverName}
                  onChange={(e) => handleChange("receiverName", e.target.value)}
                />
              ) : (
                order.receiverName
              )}
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">Số điện thoại</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  value={editedOrder.receiverPhone}
                  onChange={(e) => handleChange("receiverPhone", e.target.value)}
                />
              ) : (
                order.receiverPhone
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Địa chỉ nhận</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  value={editedOrder.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              ) : (
                order.address
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Thời gian gửi</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  className="info-value-time"
                  type="datetime-local"
                  value={new Date(editedOrder.sendTime).toISOString().slice(0, 16)}
                  onChange={(e) => handleChange("sendTime", new Date(e.target.value))}
                />
              ) : (
                formatDate(order.sendTime)
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Thời gian nhận dự kiến</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  className="info-value-time"
                  type="datetime-local"
                  value={new Date(editedOrder.receiveTime).toISOString().slice(0, 16)}
                  onChange={(e) => handleChange("receiveTime", new Date(e.target.value))}
                />
              ) : (
                formatDate(order.receiveTime)
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Kích thước</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  value={editedOrder.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                />
              ) : (
                order.size
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Phí vận chuyển</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  type="number"
                  value={editedOrder.shippingCost}
                  onChange={(e) => handleChange("shippingCost", e.target.value)}
                />
              ) : (
                `${order.shippingCost} đ`
              )}
            </div>
          </div>

          <div className="info-item">
            <div className="info-label">Người thanh toán</div>
            <div className="info-value">
              {isEditMode ? (
                <select
                  value={editedOrder.payer}
                  onChange={(e) => handleChange("payer", e.target.value)}
                >
                  <option value="sender">Người gửi</option>
                  <option value="receiver">Người nhận</option>
                </select>
              ) : (
                order.payer === "sender" ? "Người gửi" : "Người nhận"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailShipping;
