import React, { useState, useRef, useEffect } from "react";
import { compressImage } from "../../utils/imageUtils";
import { uploadToCloudinary } from "../../utils/cloudinaryUtils";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../api/apiUser";
import authApi from "../../api/apiAuth";
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
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        userType: "",
        status: "ACTIVE"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const user = authApi.getCurrentUser();
        setCurrentUser(user);
        if (user?.userType === 'manager') {
            setFormData(prev => ({ ...prev, userType: 'staff' }));
            setErrors(prev => {
                const { userType, ...rest } = prev;
                return rest;
            });
        }
    }, []);
    const [errors, setErrors] = useState({
        userType: "Vui lòng chọn chức vụ",
        department: "Vui lòng chọn phòng ban"
    });

    const resetForm = () => {
        setFormData({
            userType: currentUser?.userType === 'manager' ? 'staff' : "",
            status: "ACTIVE"
        });
        setErrors({
            ...(currentUser?.userType !== 'manager' ? { userType: "Vui lòng chọn chức vụ" } : {}),
            department: "Vui lòng chọn phòng ban"
        });
        setPreviewImage(userIcon);
    };
    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Kiểm tra tên
        if (!formData.name?.trim()) {
            newErrors.name = "Tên không được bỏ trống";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Tên phải có ít nhất 2 ký tự";
        }

        // Kiểm tra email
        if (!formData.email?.trim()) {
            newErrors.email = "Email không được bỏ trống";
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = "Email không đúng định dạng (example@domain.com)";
        }

        // Kiểm tra phòng ban
        if (!formData.department?.trim()) {
            newErrors.department = "Vui lòng chọn phòng ban";
        }

        // Kiểm tra chức vụ (nếu không phải manager đang tạo)
        if (currentUser?.userType !== 'manager' && !formData.userType?.trim()) {
            newErrors.userType = "Vui lòng chọn chức vụ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return typeof email === 'string' && regex.test(email.trim());
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
                    if (!validateForm()) {
                        toast.error("Vui lòng kiểm tra lại thông tin");
                        return;
                    }

                    try {
                        setLoading(true);
                        // Destructure to exclude birthday from formData
                        const { birthday, ...cleanData } = formData;
                        // Build user data without birthday field
                        const userData = {
                            ...cleanData,
                            needsPasswordReset: true,
                            image: formData.image || null
                        };
                        console.log('Creating user with data:', userData);
                        const response = await userApi.createUser(userData);

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
                            toast.warning("Nhân viên đã được tạo nhưng không thể gửi email mời. Vui lòng thử lại sau.");
                        }
                        navigate("/employee");
                    } catch (error) {
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
                        <div className="input-row">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                value={formData.name || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, name: value });
                                    if (!value.trim()) {
                                        setErrors(prev => ({ ...prev, name: "Tên không được bỏ trống" }));
                                    } else if (value.trim().length < 2) {
                                        setErrors(prev => ({ ...prev, name: "Tên phải có ít nhất 2 ký tự" }));
                                    } else {
                                        setErrors(prev => {
                                            const { name, ...rest } = prev;
                                            return rest;
                                        });
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value;
                                    if (!value.trim()) {
                                        setErrors(prev => ({ ...prev, name: "Tên không được bỏ trống" }));
                                    } else if (value.trim().length < 2) {
                                        setErrors(prev => ({ ...prev, name: "Tên phải có ít nhất 2 ký tự" }));
                                    }
                                }}
                                className={errors.name ? "error" : ""}
                            />
                        </div>
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>

                    {currentUser?.userType !== 'manager' && (
                        <div className="form-group">
                            <div className="input-row">
                                <label>Chức vụ</label>
                                <select
                                    value={formData.userType || ""}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        setFormData({ ...formData, userType: value });
                                        if (!value) {
                                            setErrors(prev => ({ ...prev, userType: "Vui lòng chọn chức vụ" }));
                                        } else if (!['manager', 'staff'].includes(value)) {
                                            setErrors(prev => ({ ...prev, userType: "Chức vụ không hợp lệ" }));
                                        } else {
                                            setErrors(prev => {
                                                const { userType, ...rest } = prev;
                                                return rest;
                                            });
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const value = e.target.value.trim();
                                        if (!value) {
                                            setErrors(prev => ({ ...prev, userType: "Vui lòng chọn chức vụ" }));
                                        } else if (!['manager', 'staff'].includes(value)) {
                                            setErrors(prev => ({ ...prev, userType: "Chức vụ không hợp lệ" }));
                                        }
                                    }}
                                    className={errors.userType ? "error" : ""}
                                >
                                    <option value="">Chọn chức vụ</option>
                                    <option value="manager">Quản lý</option>
                                    <option value="staff">Nhân viên</option>
                                </select>
                            </div>
                            {errors.userType && <span className="error-text">{errors.userType}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <div className="input-row">
                            <label>Phòng ban</label>
                            <select
                                value={formData.department || ""}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setFormData({ ...formData, department: value });
                                    if (!value) {
                                        setErrors(prev => ({ ...prev, department: "Vui lòng chọn phòng ban" }));
                                    } else if (!['sales', 'accounting', 'warehouse', 'Customer Service'].includes(value)) {
                                        setErrors(prev => ({ ...prev, department: "Phòng ban không hợp lệ" }));
                                    } else {
                                        setErrors(prev => {
                                            const { department, ...rest } = prev;
                                            return rest;
                                        });
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value.trim();
                                    if (!value) {
                                        setErrors(prev => ({ ...prev, department: "Vui lòng chọn phòng ban" }));
                                    } else if (!['sales', 'accounting', 'warehouse', 'Customer Service'].includes(value)) {
                                        setErrors(prev => ({ ...prev, department: "Phòng ban không hợp lệ" }));
                                    }
                                }}
                                className={errors.department ? "error" : ""}
                            >
                                <option value="">Chọn phòng ban</option>
                                <option value="sales">Kinh doanh</option>
                                <option value="accounting">Kế toán</option>
                                <option value="Customer Service">Chăm sóc khách hàng</option>
                                <option value="warehouse">Kho</option>
                            </select>
                        </div>
                        {errors.department && <span className="error-text">{errors.department}</span>}
                    </div>

                    <div className="form-group">
                        <div className="input-row">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => {
                                    const value = e.target.value.trim();
                                    setFormData({ ...formData, email: value });

                                    if (!value) {
                                        setErrors(prev => ({ ...prev, email: "Email không được bỏ trống" }));
                                    } else if (!isValidEmail(value)) {
                                        setErrors(prev => ({ ...prev, email: "Email không đúng định dạng (example@domain.com)" }));
                                    } else {
                                        setErrors(prev => {
                                            const { email, ...rest } = prev;
                                            return rest;
                                        });
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = e.target.value.trim();
                                    if (!value) {
                                        setErrors(prev => ({ ...prev, email: "Email không được bỏ trống" }));
                                    } else if (!isValidEmail(value)) {
                                        setErrors(prev => ({ ...prev, email: "Email không đúng định dạng (example@domain.com)" }));
                                    }
                                }}
                                className={errors.email ? "error" : ""}
                            />
                        </div>
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;
