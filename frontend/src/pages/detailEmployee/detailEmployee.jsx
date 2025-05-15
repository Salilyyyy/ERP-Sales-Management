import React, { useState, useEffect, useCallback, useRef } from "react";
import { compressImage, generateSHA1 } from "../../utils/imageUtils";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./detailEmployee.scss";
import { toast } from 'react-toastify';
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import EmployeeTemplate from "../../components/employeeTemplate/employeeTemplate";
import { generateEmployeePDF } from "../../utils/pdfUtils";
import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import exportIcon from "../../assets/img/white-export.svg";

import { userApi } from "../../api/apiUser";

const DetailEmployee = () => {
    const employeeTemplateRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [employee, setEmployee] = useState(null);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [modifiedFields, setModifiedFields] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [generating, setGenerating] = useState(false);

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
            const employeeData = {
                ...employee,
                birthday: employee.birthday || null
            };
            setEditedEmployee(employeeData);
            setPreviewImage(employee.image);
        }
    }, [isEditMode, employee]);

    const handleExport = async () => {
        if (generating) return;
        setGenerating(true);
        try {
            if (!employeeTemplateRef.current) {
                throw new Error("Template not ready");
            }

            // Wait for images to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            const pdf = await generateEmployeePDF([employee], employeeTemplateRef.current);
            pdf.save(`employee-${employee.ID}.pdf`);
            toast.success("Xuất thông tin nhân viên thành công!");
        } catch (error) {
            toast.error("Có lỗi khi xuất thông tin nhân viên");
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const handleImageUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadingImage(true);

            try {
                const compressedImage = await compressImage(file);

                const timestamp = Math.round(new Date().getTime() / 1000);
                const signString = `timestamp=${timestamp}${process.env.REACT_APP_CLOUDINARY_API_SECRET}`;

                const signature = await generateSHA1(signString);

                const formData = new FormData();
                formData.append('file', compressedImage);
                formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
                formData.append('timestamp', timestamp);
                formData.append('signature', signature);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'Upload failed');
                }

                const data = await response.json();
                setPreviewImage(data.secure_url);
                setEditedEmployee(prev => ({ ...prev, image: data.secure_url }));
                setModifiedFields(prev => new Set([...prev, 'image']));
                toast.success('Tải ảnh lên thành công');
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error(`Có lỗi khi tải ảnh lên: ${error.message}`);
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleEditClick = () => {
        setEditedEmployee({
            ...employee,
            birthday: employee.birthday || null
        });
        setPreviewImage(employee.image);
        setModifiedFields(new Set());
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const handleChange = (field, value) => {
        setModifiedFields(prev => new Set([...prev, field]));
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
            const allFields = [
                'name', 'birthday', 'userType', 'department',
                'phoneNumber', 'email', 'address', 'status', 'image'
            ];

            const updatedFields = {};
            allFields.forEach(field => {
                updatedFields[field] = editedEmployee[field] !== undefined && editedEmployee[field] !== ''
                    ? editedEmployee[field]
                    : null;
            });

            await userApi.updateUser(id, updatedFields);
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
                        <button className="delete" onClick={() => setShowDeleteConfirm(true)}>
                            <img src={deleteIcon} alt="Xóa" /> Xóa
                        </button>
                        <button className="export" onClick={handleExport} disabled={generating}>
                            <img src={exportIcon} alt="Xuất" /> {generating ? "Đang xuất..." : "Xuất"}
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
                    src={previewImage || (employee.image ? employee.image : avatarIcon)}
                    alt="avatar"
                    className={`avatar ${uploadingImage ? 'uploading' : ''}`}
                />
                {isEditMode && (
                    <>
                        <label className="edit-photo-btn" htmlFor="image-upload">
                            {uploadingImage ? "Đang tải ảnh..." : "Sửa hình ảnh"}
                        </label>
                        <input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            hidden
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
                            onChange={(e) => {
                                const value = e.target.value || '';
                                handleChange("birthday", value);
                            }}
                        />
                    ) : (
                        <span>{employee.birthday ? new Date(employee.birthday).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }) : ''}</span>
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

            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message="Bạn có chắc muốn xóa nhân viên này không?"
                onConfirm={async () => {
                    try {
                        await userApi.deleteUser(id);
                        navigate('/employee');
                        toast.success("Xóa nhân viên thành công!");
                    } catch (err) {
                        toast.error('Có lỗi xảy ra khi xóa nhân viên');
                        console.error(err);
                    }
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div style={{ width: '794px', background: '#fff', padding: '20px' }}>
                    <EmployeeTemplate ref={employeeTemplateRef} user={employee} />
                </div>
            </div>
        </div>
    );
};

export default DetailEmployee;
