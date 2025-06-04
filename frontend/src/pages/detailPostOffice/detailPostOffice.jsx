import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import { generatePostOfficePDF } from "../../utils/pdfUtils";
import "./detailPostOffice.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect, useMemo } from "react";
import apiAuth from "../../api/apiAuth";
import apiPostOffice from "../../api/apiPostOffice";
import apiShipping from "../../api/apiShipping";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";

const DetailPostOffice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    const user = apiAuth.getCurrentUser();
    console.log('Current user:', user);
    return user;
  }, []);
  const isStaff = currentUser?.userType === 'staff';
  console.log('Is staff:', isStaff);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [office, setOffice] = useState(null);
  const [editedOffice, setEditedOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: !editedOffice?.name?.trim() ? "Vui lòng nhập tên bưu cục" : "",
      phoneNumber: !editedOffice?.phoneNumber ? "Vui lòng nhập số điện thoại" :
        !validatePhoneNumber(editedOffice.phoneNumber) ? "Số điện thoại phải có đúng 10 chữ số" : "",
      email: !editedOffice?.email ? "Vui lòng nhập email" :
        !validateEmail(editedOffice.email) ? "Email phải chứa @ và ." : "",
      address: !editedOffice?.address?.trim() ? "Vui lòng nhập địa chỉ" : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const fetchShipments = async () => {
    try {
      const allShipments = await apiShipping.getAll();
      const officeShipments = allShipments.filter(
        shipment => shipment.postOfficeID === parseInt(id)
      );
      setShipments(officeShipments);
    } catch (err) {
      console.error("Error fetching shipments:", err);
    }
  };

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const result = await apiPostOffice.getById(id);
        setOffice(result);
        setLoading(false);

        if (searchParams.get("edit") === "true") {
          setEditedOffice(result);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOffice();
    fetchShipments();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await apiPostOffice.api.delete(`/post-offices/${id}`);
      if (response) {
        toast.success("Xóa bưu cục thành công!");
        setShowConfirmPopup(false);
        navigate("/post-office");
      }
    } catch (err) {
      toast.error("Xóa bưu cục thất bại: " + err.message);
      setShowConfirmPopup(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmPopup(false);
  };

  const handleExport = () => {
    const success = generatePostOfficePDF(office);
    if (success) {
      toast.success("Xuất PDF thành công!");
    } else {
      toast.error("Xuất PDF thất bại!");
    }
  };

  const handleChange = (field, value) => {
    if (field === 'phoneNumber' && value !== '' && !/^\d*$/.test(value)) {
      return;
    }

    setEditedOffice((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation errors when field is emptied or modified
    if (value === '' || (field === 'phoneNumber' && value.length < 10)) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Only validate email while typing
    if (field === 'email' && value.length > 0) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: "Email phải chứa @ và ." }));
      } else {
        setErrors(prev => ({ ...prev, email: "" }));
      }
    }
  };

  const handleEditClick = () => {
    if (!editedOffice) setEditedOffice({ ...office });
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const data = {
        name: editedOffice.name,
        phoneNumber: editedOffice.phoneNumber,
        email: editedOffice.email,
        address: editedOffice.address,
      };

      const response = await apiPostOffice.update(id, data);
      if (response) {
        setOffice({ ...office, ...data });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
        toast.success("Cập nhật thành công!");
      }
    } catch (err) {
      toast.error("Cập nhật thất bại: " + err.message);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;
  if (!office) return <h2>Không tìm thấy bưu cục</h2>;

  return (
    <div className="page-container detail-postOffice-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/post-office")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Chi tiết bưu cục</h2>
      </div>

      <div className="actions">
        {!isEditMode && !isStaff && (
          <button className="delete" onClick={() => setShowConfirmPopup(true)}>
            <img src={deleteIcon} alt="Xóa" /> Xóa
          </button>
        )}

        {!isEditMode ? (
          !isStaff && (
            <button className="edit" onClick={handleEditClick}>
              <img src={editIcon} alt="Sửa" /> Sửa
            </button>
          )
        ) : (
          <button className="save" onClick={handleSave}>
            <img src={saveIcon} alt="Lưu" /> Lưu
          </button>
        )}

        {!isEditMode && (
          <button className="print" onClick={handleExport}>
            <img src={printIcon} alt="Xuất" /> Xuất
          </button>
        )}
      </div>

      <div className="detail-postOffice-content">
        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Mã bưu cục</div>
            <div className="info-value-id">#BC-{office.ID}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Tên bưu cục</div>
            <div className="info-value">
              {isEditMode ? (
                <div className="input-group">
                  <input
                    type="text"
                    value={editedOffice?.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
              ) : (
                office.name
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Số điện thoại</div>
            <div className="info-value">
              {isEditMode ? (
                <div className="input-group">
                  <input
                    type="text"
                    value={editedOffice?.phoneNumber || ""}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    maxLength={10}
                  />
                  {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                </div>
              ) : (
                office.phoneNumber
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">
              {isEditMode ? (
                <div className="input-group">
                  <input
                    type="email"
                    value={editedOffice?.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
              ) : (
                office.email
              )}
            </div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Địa chỉ</div>
            <div className="info-value">
              {isEditMode ? (
                <div className="input-group">
                  <input
                    type="text" value={editedOffice?.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                  {errors.address && <div className="error-message">{errors.address}</div>}
                </div>
              ) : (
                office.address
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="shipments-section">
        <h3>Danh sách vận đơn</h3>
        {shipments.length > 0 ? (
          <div className="shipments-table">
            <table>
              <thead>
                <tr>
                  <th>Mã vận đơn</th>
                  <th>Người nhận</th>
                  <th>SĐT người nhận</th>
                  <th>Địa chỉ nhận</th>
                  <th>Thời gian gửi</th>
                  <th>Phí ship</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.ID}>
                    <td>#{shipment.ID}</td>
                    <td>{shipment.receiverName}</td>
                    <td>{shipment.receiverPhone}</td>
                    <td>{shipment.recipientAddress}</td>
                    <td>{new Date(shipment.sendTime).toLocaleString('vi-VN')}</td>
                    <td>{shipment.shippingCost.toLocaleString('vi-VN')}đ</td>
                    <td>{shipment.receiveTime ? 'Đã giao' : 'Đang giao'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Chưa có vận đơn nào</p>
        )}
      </div>

      <ConfirmPopup
        isOpen={showConfirmPopup}
        message="Bạn có chắc chắn muốn xóa bưu cục này không?"
        onConfirm={handleDelete}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default DetailPostOffice;
