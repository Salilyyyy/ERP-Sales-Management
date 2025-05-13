import React, { useState, useRef } from "react";
import { compressImage } from "../../utils/imageUtils";
import { uploadToCloudinary } from "../../utils/cloudinaryUtils";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/apiUser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./createEmployee.scss";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import userIcon from "../../assets/img/avatar.png";

const CreateEmployee = () => {
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(userIcon);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));

            try {
                const compressedImage = await compressImage(file);

                const responseData = await uploadToCloudinary(compressedImage);

                setFormData(prev => ({ ...prev, image: responseData.secure_url }));
                setPreviewImage(responseData.secure_url);
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
            }
        }
    };
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userType: "employee",
        status: "ACTIVE"
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setFormData({
            userType: "employee",
            status: "ACTIVE"
        });
        setErrors({});
        setPreviewImage(userIcon);
    };

    return (
        <div className="create-employee">
            <ToastContainer />
            <div className="header">
                <div className="back" onClick={() => navigate("/employee")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Tạo nhân viên mới</h2>
            </div>

            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="create" onClick={async () => {
                    const newErrors = {};
                    if (!formData.email?.trim()) newErrors.email = "Email is required";
                    if (!formData.name?.trim()) newErrors.name = "Name is required";
                    if (!formData.department?.trim()) newErrors.department = "Department is required";
                    if (!formData.userType?.trim()) newErrors.userType = "Position is required";

                    if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        toast.error("Vui lòng điền đầy đủ thông tin");
                        return;
                    }

                    try {
                        setLoading(true);
                        const response = await userApi.createUser({
                            ...formData,
                            needsPasswordReset: true
                        });

                        if (!response || !response.ID) {
                            toast.error("Không thể tạo nhân viên. Vui lòng thử lại sau.");
                            return;
                        }

                        try {
                            await userApi.sendInvitationEmail({
                                email: formData.email,
                                name: formData.name,
                                userId: response.ID
                            });
                            toast.success("Tạo nhân viên thành công");
                            toast.success("Email mời đã được gửi thành công");
                        } catch (emailError) {
                            console.error("Error sending invitation email:", emailError);
                            toast.warning("Nhân viên đã được tạo nhưng không thể gửi email mời. Vui lòng thử lại sau.");
                        }
                        navigate("/employee");
                    } catch (error) {
                        console.error("Error creating employee:", error);
                        toast.error(error.message || "Có lỗi xảy ra khi tạo nhân viên");
                    } finally {
                        setLoading(false);
                    }
                }}>
                    <img src={createIcon} alt="Tạo" /> {loading ? "Đang xử lý..." : "Tạo"}
                </button>
            </div>

            <div className="form-card">
                <div className="avatar-section">
                    <img src={previewImage} alt="avatar" className="avatar" />
                    <p
                        className="add-photo"
                        onClick={() => fileInputRef.current.click()}
                    >
                        + Thêm hình ảnh
                    </p>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </div>

                <div className="form-inputs">
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={errors.name ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Chức vụ</label>
                        <select
                            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                            className={errors.userType ? "error" : ""}
                            value={formData.userType}
                        >
                            <option value="">Chọn chức vụ</option>
                            <option value="manager">Quản lý</option>
                            <option value="staff">Nhân viên</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Phòng ban</label>
                        <select
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className={errors.department ? "error" : ""}
                        >
                            <option value="">Chọn phòng ban</option>
                            <option value="sales">Kinh doanh</option>
                            <option value="accounting">Kế toán</option>
                            <option value="warehouse">Kho</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? "error" : ""}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;
