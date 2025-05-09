import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailPostOffice.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import apiPostOffice from "../../api/apiPostOffice";

const DetailPostOffice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [office, setOffice] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [editedOffice, setEditedOffice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOffice = async () => {
            try {
                const result = await apiPostOffice.getById(id);
                setOffice(result);
                if (isEditMode) {
                    setEditedOffice(result);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchOffice();
    }, [id, isEditMode]);

    useEffect(() => {
        if (isEditMode && office) {
            setEditedOffice({ ...office });
        }
    }, [isEditMode, office]);

    const handleChange = (field, value) => {
        setEditedOffice(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditClick = () => {
        setEditedOffice({ ...office });
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

    const handleCancel = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
        setEditedOffice(null);
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
                    <button className="delete">
                        <img src={deleteIcon} alt="Xóa" /> Xóa
                    </button>
                )}

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

                {!isEditMode && (
                    <button className="print">
                        <img src={printIcon} alt="In" /> In
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
                                    value={editedOffice.name || ""}
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
                                    value={editedOffice.phoneNumber || ""}
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
                                    value={editedOffice.email || ""}
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
                                    value={editedOffice.address || ""}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                />
                            ) : (
                                office.address
                            )}
                        </div>
                    </div>
                </div>


            </div>
        </div >
    );
};

export default DetailPostOffice;
