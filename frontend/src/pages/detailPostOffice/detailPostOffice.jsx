import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailPostOffice.scss";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import PostOfficeRepository from "../../api/apiPostOffice";

const DetailPostOffice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [office, setOffice] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        PostOfficeRepository.getById(id)
            .then(data => {
                setOffice(data);
                setFormData(data); 
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            await PostOfficeRepository.update(id, formData);
            setOffice(formData);
            setIsEditing(false);
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
                <button className="delete">
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>

                {!isEditing ? (
                    <button className="edit" onClick={() => setIsEditing(true)}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
                ) : (
                    <button className="edit" onClick={handleSave}>
                        💾 Lưu
                    </button>
                )}

                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
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
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={handleChange}
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
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ""}
                                    onChange={handleChange}
                                />
                            ) : (
                                office.phoneNumber
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">
                            {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ""}
                                    onChange={handleChange}
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
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                />
                            ) : (
                                office.address
                            )}
                        </div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        <div className="info-value">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="note"
                                    value={formData.note || ""}
                                    onChange={handleChange}
                                />
                            ) : (
                                office.note
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPostOffice;
