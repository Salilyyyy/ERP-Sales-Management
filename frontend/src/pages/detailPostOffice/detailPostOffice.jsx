import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./detailPostOffice.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import apiPostOffice from "../../api/apiPostOffice";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";

const DetailPostOffice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const [office, setOffice] = useState(null);
  const [editedOffice, setEditedOffice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const result = await apiPostOffice.getById(id);
        setOffice(result);
        setLoading(false);

        // Gán editedOffice nếu đang ở chế độ chỉnh sửa
        if (searchParams.get("edit") === "true") {
          setEditedOffice(result);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOffice();
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
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(18);
      doc.text("CHI TIẾT BƯU CỤC", 14, 20);

      doc.setFontSize(11);
      doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 30);

      const headers = [["Thông tin", "Chi tiết"]];
      const data = [
        ["Mã bưu cục", `#BC-${office.ID}`],
        ["Tên bưu cục", office.name],
        ["Số điện thoại", office.phoneNumber || ""],
        ["Email", office.email || ""],
        ["Địa chỉ", office.address || ""],
      ];

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 35,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 6,
          font: "helvetica",
          halign: "left",
          overflow: "linebreak",
          cellWidth: "wrap",
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 150 },
        },
        margin: { top: 35, left: 10 },
      });

      doc.save(`chi-tiet-buu-cuc-${office.ID}.pdf`);
      toast.success("Xuất PDF thành công!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Xuất PDF thất bại!");
    }
  };

  const handleChange = (field, value) => {
    setEditedOffice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditClick = () => {
    if (!editedOffice) setEditedOffice({ ...office });

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    try {
      await apiPostOffice.update(id, editedOffice);
      setOffice(editedOffice);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("edit");
      setSearchParams(newSearchParams);
      toast.success("Cập nhật thành công!");
    } catch (err) {
      toast.error("Cập nhật thất bại: " + err.message);
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;
  if (!office) return <h2>Không tìm thấy bưu cục</h2>;

  return (
    <div className="detail-postOffice-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/post-office")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Chi tiết bưu cục</h2>
      </div>

      <div className="actions">
        {!isEditMode && (
          <button className="delete" onClick={() => setShowConfirmPopup(true)}>
            <img src={deleteIcon} alt="Xóa" /> Xóa
          </button>
        )}

        {!isEditMode ? (
          <button className="edit" onClick={handleEditClick}>
            <img src={editIcon} alt="Sửa" /> Sửa
          </button>
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
                <input
                  type="text"
                  value={editedOffice?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
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
                <input
                  type="text"
                  value={editedOffice?.phoneNumber || ""}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
              ) : (
                office.phoneNumber
              )}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">
              {isEditMode ? (
                <input
                  type="email"
                  value={editedOffice?.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
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
                <input
                  type="text"
                  value={editedOffice?.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              ) : (
                office.address
              )}
            </div>
          </div>
        </div>
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
