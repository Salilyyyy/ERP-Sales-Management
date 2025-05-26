import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./detailShipping.scss";
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import moment from "moment";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import ShippingTemplate from "../../components/shippingTemplate/shippingTemplate";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import apiShipping from "../../api/apiShipping";
import apiPostOffice from "../../api/apiPostOffice";
import apiCustomer from "../../api/apiCustomer";

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
  const [customers, setCustomers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [selectedShippingData, setSelectedShippingData] = useState(null);
  const shippingTemplateRef = useRef(null);

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

    const fetchCustomers = async () => {
      try {
        const result = await apiCustomer.getAll();
        setCustomers(result);
      } catch (err) {
        console.error("Error fetching customers:", err);
        toast.error("Không thể tải danh sách khách hàng");
      }
    };

    fetchCustomers();
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
      if (!editedOrder.postOfficeId) {
        throw new Error("Vui lòng chọn bưu cục");
      }

      // Transform data to match expected API format
      const updatedData = {
        ...editedOrder,
        postOfficeID: parseInt(editedOrder.postOfficeId)
      };
      delete updatedData.postOfficeId;

      const response = await apiShipping.update(id, updatedData);
      setOrder(updatedData);
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

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const checkShipping = await apiShipping.getById(id);
      if (!checkShipping) {
        toast.error("Vận đơn không tồn tại hoặc đã bị xóa");
        navigate("/shipping-list");
        return;
      }

      await apiShipping.delete(id);
      toast.success("Xóa vận đơn thành công!");
      navigate("/shipping-list");
    } catch (err) {
      console.error("Error deleting shipping:", err);
      const errorMessage = err.message?.includes("not found") || err.message?.includes("does not exist")
        ? "Vận đơn không tồn tại hoặc đã bị xóa"
        : "Lỗi khi xóa vận đơn: " + (err.message || "Đã xảy ra lỗi");
      
      toast.error(errorMessage);
      if (errorMessage.includes("không tồn tại")) {
        navigate("/shipping-list");
      }
    }
  };

  if (loading) return <div className="order-detail-container">Đang tải dữ liệu...</div>;
  if (error) return <div className="order-detail-container">Lỗi: {error}</div>;
  if (!order) return <div className="order-detail-container">Không tìm thấy đơn hàng</div>;

  return (
    <div className="order-detail-container">
      <ConfirmPopup
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa vận đơn này không?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
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
            <button className="print" onClick={async () => {
              try {
                setIsPrinting(true);
                setSelectedShippingData({
                  ...order,
                  id: order.ID,
                  date: order.sendTime,
                  sender: {
                    name: 'ERP System',
                    phone: '0123456789',
                    address: '02 Quang Trung',
                    city: 'Hải Châu, Đà Nẵng'
                  },
                  receiver: {
                    name: order.receiverName || 'N/A',
                    phone: order.receiverPhone || 'N/A',
                    address: order.address || 'N/A',
                    city: order.city || 'N/A'
                  },
                  method: order.shippingMethod || "Standard Delivery",
                  status: order.status || 'Pending',
                  trackingNumber: order.trackingNumber || order.ID,
                  estimatedDelivery: order.receiveTime,
                  shippingCost: parseFloat(order.shippingCost) || 0,
                  totalCost: parseFloat(order.shippingCost) || 0
                });

                await new Promise(resolve => setTimeout(resolve, 100));

                const canvas = await html2canvas(shippingTemplateRef.current, {
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: '#ffffff',
                  logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pdf = new jsPDF('p', 'pt', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = 515;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const xOffset = (pageWidth - imgWidth) / 2;

                pdf.addImage(imgData, 'JPEG', xOffset, 20, imgWidth, imgHeight, '', 'FAST');
                pdf.save(`shipping_${order.ID}_${moment().format('YYYYMMDD_HHmmss')}.pdf`);

                toast.success("Xuất PDF thành công");
              } catch (error) {
                console.error("Error printing shipping:", error);
                toast.error("Có lỗi xảy ra khi in vận đơn");
              } finally {
                setIsPrinting(false);
                setSelectedShippingData(null);
              }
            }}><img src={printIcon} alt="In" /> In</button>
          </>
        ) : (
          <>
            <button className="save" onClick={handleSave}>
              <img src={saveIcon} alt="Lưu" /> Lưu
            </button>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={shippingTemplateRef} style={{ width: '595px', background: '#fff', margin: '0 auto' }}>
          {isPrinting && selectedShippingData && (
            <ShippingTemplate 
              shipping={selectedShippingData}
              items={order.Invoices?.InvoiceDetails?.map(detail => ({
                description: detail.Products?.name || 'N/A',
                quantity: detail.quantity || 0,
                weight: detail.Products?.weight || 'N/A',
                length: detail.Products?.length || 'N/A',
                width: detail.Products?.width || 'N/A',
                height: detail.Products?.height || 'N/A',
                value: parseFloat(detail.price || 0)
              })) || []}
            />
          )}
        </div>
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
                  value={editedOrder.postOfficeId || ""}
                  onChange={(e) => {
                    const selectedOffice = postOffices.find(office => office.ID === parseInt(e.target.value));
                    if (selectedOffice) {
                      handleChange("postOfficeId", selectedOffice.ID);
                    }
                  }}
                >
                  <option value="">Chọn bưu cục</option>
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
                <select
                  value={editedOrder.receiverName || ""}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.name === e.target.value);
                    if (selectedCustomer) {
                      handleChange("receiverName", selectedCustomer.name);
                      handleChange("receiverPhone", selectedCustomer.phoneNumber);
                      handleChange("address", selectedCustomer.address);
                    }
                  }}
                >
                  <option value="">Chọn người nhận</option>
                  {customers.map((customer) => (
                    <option key={customer.ID} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
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
                  value={editedOrder.receiverPhone || ""}
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
                  value={editedOrder.address || ""}
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
