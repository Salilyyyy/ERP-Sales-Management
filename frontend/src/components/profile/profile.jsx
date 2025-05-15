import React, { useState, useEffect } from "react";
import { userApi } from "../../api/apiUser";
import "./profile.scss";
import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import { uploadImageToCloudinary, compressImage } from "../../utils/imageUtils";
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        ID: null,
        name: "",
        email: "",
        address: "",
        phoneNumber: "",
        department: "",
        IdentityCard: "",
        userType: "",
        birthday: "",
        image: "",
        status: true
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const userDataStr = localStorage.getItem('user');
            if (!userDataStr) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            const userData = JSON.parse(userDataStr);
            if (!userData.ID) {
                throw new Error('Thông tin người dùng không hợp lệ');
            }


            const response = await userApi.getUserById(userData.ID);

            if (!response) {
                throw new Error('Không thể kết nối đến máy chủ');
            }

            if (!response.ID) {
                throw new Error('Dữ liệu không hợp lệ từ máy chủ');
            }

            let formattedBirthday = "";
            if (response.birthday) {
                const date = new Date(response.birthday);
                if (!isNaN(date.getTime())) {
                    formattedBirthday = date.toISOString().split('T')[0];
                }
            }

            const formattedData = {
                ID: response.ID,
                name: response.name || "",
                email: response.email || "",
                address: response.address || "",
                phoneNumber: response.phoneNumber || "",
                department: response.department || "",
                IdentityCard: response.IdentityCard || "",
                userType: response.userType || "",
                birthday: formattedBirthday,
                image: response.image || "",
                status: response.status
            };

            setFormData(formattedData);

            setError(null);
        } catch (err) {
            const errorMessage = err.message || "Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const [changedFields, setChangedFields] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setChangedFields(prev => ({ ...prev, [name]: true }));
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const dataToUpdate = {
                email: formData.email,
                name: formData.name,
                department: formData.department,
                userType: formData.userType,
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                IdentityCard: formData.IdentityCard,
                image: formData.image,
                status: formData.status
            };

            if (changedFields.birthday) {
                dataToUpdate.birthday = formData.birthday ?
                    new Date(formData.birthday).toISOString() : "2025-05-05T00:00:00.000Z";
            } else {
                dataToUpdate.birthday = "2025-05-05T00:00:00.000Z";
            }

            const userDataStr = localStorage.getItem('user');
            if (!userDataStr) {
                throw new Error('User data not found in localStorage');
            }

            const userData = JSON.parse(userDataStr);
            if (!userData.ID) {
                throw new Error('User ID not found in localStorage');
            }
            const response = await userApi.updateUser(userData.ID, dataToUpdate);

            setIsEditing(false);
            setChangedFields({});
            await loadProfile();

        } catch (err) {


            let errorMessage = "Không thể cập nhật hồ sơ. ";
            if (err.response?.data?.errors) {
                errorMessage += err.response.data.errors.map(e => e.msg).join(', ');
            } else if (err.response?.data?.error) {
                errorMessage += err.response.data.error;
            } else {
                errorMessage += "Vui lòng thử lại sau.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    const handleAvatarClick = () => {
        document.getElementById("avatarInput").click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setError(null);
                setIsLoading(true);

                const previewUrl = URL.createObjectURL(file);
                setAvatar(previewUrl);
                const compressedImage = await compressImage(file);

                const uploadedImageUrl = await uploadImageToCloudinary(compressedImage);

                const updateData = {
                    email: formData.email,
                    name: formData.name,
                    department: formData.department,
                    userType: formData.userType,
                    address: formData.address,
                    phoneNumber: formData.phoneNumber,
                    IdentityCard: formData.IdentityCard,
                    birthday: "2025-05-05T00:00:00.000Z",
                    status: formData.status,
                    image: uploadedImageUrl
                };
                await userApi.updateUser(formData.ID, updateData);

                setFormData(prev => ({
                    ...prev,
                    image: uploadedImageUrl
                }));

            } catch (err) {
                setError("Không thể tải lên ảnh. Vui lòng thử lại sau.");
                setAvatar(formData.image || avatarIcon);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const [avatar, setAvatar] = useState(avatarIcon);

    useEffect(() => {
        setAvatar(formData.image || avatarIcon);
    }, [formData.image]);


    return (
        <div className="profile-container">
            <h2>Hồ sơ cá nhân</h2>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-message">Đang tải...</div>}
            <div className="profile-actions">
                {!isEditing ? (
                    <button className="edit-btn" onClick={() => {
                        setIsEditing(true);
                        setChangedFields({});
                    }}>
                        <img src={editIcon} alt="Edit icon" /> Chỉnh sửa
                    </button>
                ) : (
                    <button className="save-btn" onClick={handleSave}>
                        <img src={saveIcon} alt="Save icon" /> Lưu
                    </button>
                )}
            </div>

            <div className="avatar-section">
                <img
                    src={avatar}
                    alt="avatar"
                    className="avatar"
                    onError={(e) => { e.target.src = avatarIcon }}
                />
                {isEditing && (
                    <>
                        <p className="add-photo-text" onClick={handleAvatarClick}>
                            + Tải lên ảnh đại diện
                        </p>
                        <input
                            type="file"
                            id="avatarInput"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleAvatarChange}
                        />
                    </>
                )}
            </div>



            <form className="profile-form">
                <div className="user-name">
                    {formData.name || "N/A"}
                </div>
                <div className="user-type-display">
                    {formData.userType}
                </div>



                <div className="form-row">
                    <label>Email</label>
                    <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>Số điện thoại</label>
                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>CMND/CCCD</label>
                    <input
                        name="IdentityCard"
                        value={formData.IdentityCard}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>Phòng ban</label>
                    <input
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>Ngày sinh</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>Địa chỉ</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>
            </form>
        </div>
    );
};

export default Profile;
