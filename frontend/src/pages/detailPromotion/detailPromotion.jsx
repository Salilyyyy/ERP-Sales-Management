import backIcon from "../../assets/img/back-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailPromotion.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import apiPromotion from "../../api/apiPromotion";

const DetailPromotion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [promotion, setPromotion] = useState(null);
    const [editedPromotion, setEditedPromotion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const result = await apiPromotion.getById(id);
                setPromotion(result);
                if (isEditMode) {
                    setEditedPromotion(result);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPromotion();
    }, [id, isEditMode]);

    useEffect(() => {
        if (isEditMode && promotion) {
            setEditedPromotion({ ...promotion });
        }
    }, [isEditMode, promotion]);

    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Returns YYYY-MM-DDThh:mm
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleChange = (field, value) => {
        setEditedPromotion(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditClick = () => {
        setEditedPromotion({ ...promotion });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const handleSave = async () => {
        try {
            await apiPromotion.update(id, editedPromotion);
            setPromotion(editedPromotion);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
            toast.success("Cập nhật thành công!");
        } catch (err) {
            toast.error("Cập nhật thất bại: " + err.message);
        }
    };

    const handleCancel = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
        setEditedPromotion(null);
    };
    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này không?")) {
            try {
                await apiPromotion.delete(id);
                toast.success("Xóa khuyến mãi thành công!");
                navigate("/promotion");
            } catch (err) {
                toast.error("Xóa khuyến mãi thất bại: " + err.message);
            }
        }
    };
    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write("<html><head><title>In khuyến mãi</title></head><body>");
            printWindow.document.write("<h1>Chi tiết khuyến mãi</h1>");
            printWindow.document.write("<h2>" + promotion.name + "</h2>");
            printWindow.document.write("<p>Ngày bắt đầu: " + formatDateDisplay(promotion.dateCreate) + "</p>");
            printWindow.document.write("<p>Ngày kết thúc: "
                + formatDateDisplay(promotion.dateEnd) + "</p>");
            printWindow.document.write("<p>Loại khuyến mãi: " + (promotion.type === 'percentage' ? 'Theo phần trăm' : 'Theo số tiền') + "</p>");
            printWindow.document.write("<p>Giá trị: " + promotion.value + " VNĐ</p>");
            printWindow.document.write("<p>Giá trị tối thiểu: " + promotion.minValue + " VNĐ</p>");
            printWindow.document.write("<p>Số lượng: " + promotion.quantity + "</p>");
            printWindow.document.write("</body></html>");
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        } else {
            toast.error("Không thể mở cửa sổ in.");
        }
    };



    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;
    if (!promotion) return <div>Không tìm thấy khuyến mãi</div>;

    return (
        <div className="promotion-detail-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/promotion")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết khuyến mãi</h2>
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
                        <button className="print" onClick={handlePrint}>
                            <img src={printIcon} alt="In" /> In
                        </button>
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

            <div className="promotion-detail-content">
                <div className="product-info">

                    <div className="info-item">
                        <div className="info-label">Tên khuyến mãi</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={editedPromotion.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                promotion.name
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Ngày bắt đầu</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="datetime-local"
                                    value={formatDateForInput(editedPromotion.dateCreate)}
                                    onChange={(e) => handleChange("dateCreate", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                formatDateDisplay(promotion.dateCreate)
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Ngày kết thúc</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="datetime-local"
                                    value={formatDateForInput(editedPromotion.dateEnd)}
                                    onChange={(e) => handleChange("dateEnd", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                formatDateDisplay(promotion.dateEnd)
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Loại khuyến mãi</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <select
                                    value={editedPromotion.type || ""}
                                    onChange={(e) => handleChange("type", e.target.value)}
                                    className="info-input"
                                >
                                    <option value="">Chọn loại</option>
                                    <option value="percentage">Theo phần trăm</option>
                                    <option value="fixed">Theo số tiền</option>
                                </select>
                            ) : (
                                <>{promotion.type === 'percentage' ? 'Theo phần trăm' :
                                    promotion.type === 'fixed' ? 'Theo số tiền' : ''}</>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Giá trị</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={editedPromotion.value || ""}
                                    onChange={(e) => handleChange("value", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                <>{promotion.value} VNĐ</>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Giá trị tối thiểu</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={editedPromotion.minValue || ""}
                                    onChange={(e) => handleChange("minValue", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                <>{promotion.minValue} VNĐ</>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Số lượng</div>
                        <div className="info-value">
                            {isEditMode ? (
                                <input
                                    type="number"
                                    value={editedPromotion.quantity || ""}
                                    onChange={(e) => handleChange("quantity", e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                promotion.quantity
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPromotion;
