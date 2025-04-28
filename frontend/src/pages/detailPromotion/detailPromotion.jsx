import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
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
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                {!isEditMode ? (
                    <button className="edit" onClick={handleEditClick}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
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
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="promotion-detail-content">
                <div className="info-item">
                    <div className="info-label">Tên khuyến mãi</div>
                    <div className="info-value">
                        {isEditMode ? (
                            <input
                                type="text"
                                value={editedPromotion.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
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
                                value={editedPromotion.dateCreate || ""}
                                onChange={(e) => handleChange("dateCreate", e.target.value)}
                            />
                        ) : (
                            promotion.dateCreate
                        )}
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ngày kết thúc</div>
                    <div className="info-value">
                        {isEditMode ? (
                            <input
                                type="datetime-local"
                                value={editedPromotion.dateEnd || ""}
                                onChange={(e) => handleChange("dateEnd", e.target.value)}
                            />
                        ) : (
                            promotion.dateEnd
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
                            />
                        ) : (
                            promotion.value
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
                            />
                        ) : (
                            promotion.minValue
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
                            />
                        ) : (
                            promotion.quantity
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPromotion;
