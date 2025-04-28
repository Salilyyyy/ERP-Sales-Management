import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./detailEmployee.scss";
import { toast } from 'react-toastify';
import { compressImage } from "../../utils/imageUtils";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";

import { userApi } from "../../api/apiUser";

const DetailEmployee = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Brief delay to show loading state
            setUploadingImage(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
                // Compress image to blob
                const compressedBlob = await compressImage(file);
                
                // Create a temporary preview URL
                const previewUrl = URL.createObjectURL(compressedBlob);
                setPreviewImage(previewUrl);

                // Upload to Firebase Storage
                const timestamp = new Date().getTime();
                const storageRef = ref(storage, `employees/${id}/avatar_${timestamp}.jpg`);
                const uploadResult = await uploadBytes(storageRef, compressedBlob);
                const downloadUrl = await getDownloadURL(uploadResult.ref);
                
                // Update data with Firebase URL
                setEditData({...editData, image: downloadUrl});
                
                // Clean up preview URL
                URL.revokeObjectURL(previewUrl);
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Có lỗi xảy ra khi tải ảnh lên");
            } finally {
                setUploadingImage(false);
            }
        }
    };

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await userApi.getUserById(id);
                setEmployee(response);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!employee) return <div>No employee found</div>;

    return (
        <div className="detail-employee">
            <div className="header">
                <div className="back" onClick={() => navigate("/employee")}>
                    <img src={backIcon} alt="Quay lại" />
                    <h2>Chi tiết nhân viên</h2>
                </div>
            </div>

            <div className="actions">
                <button className="delete" onClick={async () => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
                        try {
                            await userApi.deleteUser(id);
                            navigate('/employee');
                        } catch (err) {
                            toast.error('Có lỗi xảy ra khi xóa nhân viên');
                            console.error(err);
                        }
                    }
                }}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="edit" onClick={() => {
                    if (isEditing) {
                        // Save changes
                        const saveChanges = async () => {
                            if (uploadingImage) {
                                toast.warning('Đang tải ảnh lên, vui lòng đợi');
                                return;
                            }
                            setSaving(true);
                            try {
                                // Update employee data including image URL
                                const updatedEmployee = {
                                    ...editData,
                                    image: editData.image || employee.image // Keep existing image if no new one
                                };
                                await userApi.updateUser(id, updatedEmployee);
                                setEmployee(updatedEmployee);
                                setPreviewImage(null); // Reset preview
                                setIsEditing(false);
                            } catch (err) {
                                toast.error('Có lỗi xảy ra khi cập nhật nhân viên');
                                console.error(err);
                            } finally {
                                setSaving(false);
                            }
                        };
                        saveChanges();
                    } else {
                        // Enter edit mode
                        setEditData({...employee});
                        setPreviewImage(employee.image); // Show current image when entering edit mode
                        setIsEditing(true);
                    }
                }}>
                    <img src={editIcon} alt={isEditing ? "Lưu" : "Sửa"} /> 
                    {isEditing ? (saving ? "Đang lưu..." : "Lưu") : "Sửa"}
                </button>
                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
            </div>

            <div className="avatar-section">
                <img 
                    src={previewImage || employee.image || avatarIcon} 
                    alt="avatar" 
                    className={`avatar ${uploadingImage ? 'uploading' : ''}`}
                />
                {isEditing && (
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
                    {isEditing ? (
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                        />
                    ) : (
                        <span>{employee.name}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Ngày sinh</strong>
                    {isEditing ? (
                        <input
                            type="date"
                            value={editData.birthday?.split('T')[0]}
                            onChange={(e) => setEditData({...editData, birthday: e.target.value})}
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
                    {isEditing ? (
                        <select
                            value={editData.userType}
                            onChange={(e) => setEditData({...editData, userType: e.target.value})}
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
                    {isEditing ? (
                        <select
                            value={editData.department}
                            onChange={(e) => setEditData({...editData, department: e.target.value})}
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
                    {isEditing ? (
                        <input
                            type="text"
                            value={editData.phoneNumber}
                            onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                        />
                    ) : (
                        <span>{employee.phoneNumber}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Email</strong>
                    {isEditing ? (
                        <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                        />
                    ) : (
                        <span>{employee.email}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Địa chỉ</strong>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editData.address}
                            onChange={(e) => setEditData({...editData, address: e.target.value})}
                        />
                    ) : (
                        <span>{employee.address}</span>
                    )}
                </div>
                <div className="info-row">
                    <strong>Trạng thái</strong>
                    {isEditing ? (
                        <select
                            value={editData.status}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
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
