import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./detailEmployee.scss";
import { toast } from 'react-toastify';
import { compressImage } from "../../utils/imageUtils";
import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";

import { userApi } from "../../api/apiUser";

const DetailEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [employee, setEmployee] = useState(null);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await userApi.getUserById(id);
                setEmployee(response);
                if (isEditMode) {
                    setEditedEmployee(response);
                    setPreviewImage(response.image);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id, isEditMode]);

    useEffect(() => {
        if (isEditMode && employee) {
            setEditedEmployee({ ...employee });
            setPreviewImage(employee.image);
        }
    }, [isEditMode, employee]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingImage(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
                const compressedBlob = await compressImage(file);
                const previewUrl = URL.createObjectURL(compressedBlob);
                setPreviewImage(previewUrl);

                // Create form data for Cloudinary upload
                const formData = new FormData();
                formData.append('file', compressedBlob);
                formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
                formData.append('upload_preset', 'ml_default');

                // Upload to Cloudinary
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                setEditedEmployee(prev => ({ ...prev, image: data.secure_url }));
                URL.revokeObjectURL(previewUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Có lỗi xảy ra khi tải ảnh lên");
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleEditClick = () => {
        setEditedEmployee({ ...employee });
        setPreviewImage(employee.image);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const handleChange = (field, value) => {
        setEditedEmployee(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (uploadingImage) {
            toast.warning('Đang tải ảnh lên, vui lòng đợi');
            return;
        }
        setSaving(true);
        try {
            await userApi.updateUser(id, editedEmployee);
            setEmployee(editedEmployee);
            setPreviewImage(null);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
            toast.success("Cập nhật thành công!");
        } catch (err) {
            toast.error("Cập nhật thất bại: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
        setEditedEmployee(null);
        setPreviewImage(employee.image);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;
    if (!employee) return <div>Không tìm thấy nhân viên</div>;

    return (
        <div className="detail-employee">
            <div className="header">
                <div className="back" onClick={() => navigate("/employee")}>
                    <img src={backIcon} alt="Quay lại" />
                    <h2>Chi tiết nhân viên</h2>
                </div>
            </div>

            <div className="actions">
                {!isEditMode ? (
                    <>
                        <button className="delete" onClick={async () => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
                                try {
                                    await userApi.deleteUser(id);
                                    navigate('/employee');
                                    toast.success("Xóa nhân viên thành công!");
                                } catch (err) {
                                    toast.error('Có lỗi xảy ra khi xóa nhân viên');
                                    console.error(err);
                                }
                            }
                        }}>
                            <img src={deleteIcon} alt="Xóa" /> Xóa
                        </button>
                        <button className="edit" onClick={handleEditClick}>
                            <img src={editIcon} alt="Sửa" /> Sửa
                        </button>
                    </>
                ) : (
                    <>
                        <button className="cancel" onClick={handleCancel}>
                            <img src={cancelIcon} alt="Hủy" /> Hủy
                        </button>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> {saving ? "Đang lưu..." : "Lưu"}
                        </button>
                    </>
                )}
            </div>

            <div className="avatar-section">
                <img
                    src={previewImage || employee.image || avatarIcon}
                    alt="avatar"
                    className={`avatar ${uploadingImage ? 'uploading' : ''}`}
                />
                {isEditMode && (
                    <>
                        <p
                            className="edit-photo"
                            onClick={() => !uploadingImage && fileInputRef.current.click()}
                        >
                            {uploadingImage ? "Đang tải ảnh..." : "Sửa hình ảnh"}
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                    </>
                )}
            </div>

            <div className="info-card">
                <div className="info-row">
                    <strong>Họ tên</strong>
                    {isEditMode ? (
                        <input
                            type="text"
                            value={editedEmployee.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    ) : (
                        <span>{employee.name}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Ngày sinh</strong>
                    {isEditMode ? (
                        <input
                            type="date"
                            value={editedEmployee.birthday?.split('T')[0] || ""}
                            onChange={(e) => handleChange("birthday", e.target.value)}
                        />
                    ) : (
                        <span>{new Date(employee.birthday).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Chức vụ</strong>
                    {isEditMode ? (
                        <select
                            value={editedEmployee.userType || ""}
                            onChange={(e) => handleChange("userType", e.target.value)}
                        >
                            <option value="admin">Quản lý</option>
                            <option value="employee">Nhân viên</option>
                        </select>
                    ) : (
                        <span>{employee.userType}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Phòng ban</strong>
                    {isEditMode ? (
                        <select
                            value={editedEmployee.department || ""}
                            onChange={(e) => handleChange("department", e.target.value)}
                        >
                            <option value="sales">Kinh doanh</option>
                            <option value="accounting">Kế toán</option>
                            <option value="wavehouse">Kho</option>
                        </select>
                    ) : (
                        <span>{employee.department}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>ID Nhân viên</strong>
                    <span>{employee.ID}</span>
                </div>
                <div className="info-row">
                    <strong>Số điện thoại</strong>
                    {isEditMode ? (
                        <input
                            type="text"
                            value={editedEmployee.phoneNumber || ""}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                        />
                    ) : (
                        <span>{employee.phoneNumber}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Email</strong>
                    {isEditMode ? (
                        <input
                            type="email"
                            value={editedEmployee.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                    ) : (
                        <span>{employee.email}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Địa chỉ</strong>
                    {isEditMode ? (
                        <input
                            type="text"
                            value={editedEmployee.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    ) : (
                        <span>{employee.address}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Trạng thái</strong>
                    {isEditMode ? (
                        <select
                            value={editedEmployee.status || ""}
                            onChange={(e) => handleChange("status", e.target.value)}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    ) : (
                        <span>{employee.status}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailEmployee;
