import React, { useState, useEffect } from "react";
import { userApi } from "../../api/apiUser";
import "./profile.scss";
import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        ID: null,
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
            
            // Get user ID from localStorage
            const userDataStr = localStorage.getItem('user');
            if (!userDataStr) {
                console.error('No user data in localStorage');
                throw new Error('Vui lòng đăng nhập lại');
            }

            const userData = JSON.parse(userDataStr);
            if (!userData.ID) {
                console.error('No user ID in localStorage data');
                throw new Error('Thông tin người dùng không hợp lệ');
            }

            // Get fresh user data from API using ID
            console.log('Fetching user data with ID:', userData.ID);
            const response = await userApi.getUserById(userData.ID);
            console.log('Profile data from API:', response);
            
            if (!response) {
                console.error('No response from API');
                throw new Error('Không thể kết nối đến máy chủ');
            }

            if (!response.ID) {
                console.error('Invalid response data:', response);
                throw new Error('Dữ liệu không hợp lệ từ máy chủ');
            }

            // Format birthday date if it exists
            let formattedBirthday = "";
            if (response.birthday) {
                const date = new Date(response.birthday);
                if (!isNaN(date.getTime())) {
                    formattedBirthday = date.toISOString().split('T')[0];
                }
            }

            const formattedData = {
                ID: response.ID,
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

            console.log('Formatted profile data:', formattedData);
            setFormData(formattedData);
            
            // Clear any previous error
            setError(null);
        } catch (err) {
            const errorMessage = err.message || "Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.";
            setError(errorMessage);
            console.error("Error loading profile:", {
                message: err.message,
                response: err.response,
                details: err.response?.data
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Validate required fields
            const requiredFields = ['email', 'address', 'phoneNumber', 'department', 'IdentityCard', 'userType', 'birthday'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                setError(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
                return;
            }

            // Format birthday to ISO string if it exists
            const dataToUpdate = {
                ...formData,
                birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null
            };

            if (!dataToUpdate.password) {
                delete dataToUpdate.password;
            }

            console.log('Sending update request with data:', dataToUpdate);
            console.log('User ID:', formData.ID);
            console.log('Auth token:', localStorage.getItem('auth_token'));

            // Get current user ID from localStorage to ensure we're updating the correct user
            const userDataStr = localStorage.getItem('user');
            if (!userDataStr) {
                throw new Error('User data not found in localStorage');
            }

            const userData = JSON.parse(userDataStr);
            if (!userData.ID) {
                throw new Error('User ID not found in localStorage');
            }

            console.log('Updating user with ID:', userData.ID);
            const response = await userApi.updateUser(userData.ID, dataToUpdate);
            console.log('Update response:', response);

            setIsEditing(false);
            await loadProfile(); // This will refresh the data from the API
            
        } catch (err) {
            console.error("Full error object:", err);
            console.error("Error response:", err.response);
            console.error("Error message:", err.message);
            console.error("Error details:", err.response?.data || err);
            
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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl); 
        }
    };

    const [avatar, setAvatar] = useState(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const { image } = JSON.parse(userData);
            return image || avatarIcon;
        }
        return avatarIcon;
    });


    return (
        <div className="profile-container">
            <h2>Hồ sơ cá nhân</h2>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-message">Đang tải...</div>}
            <div className="profile-actions">
                {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <img src={editIcon} alt="Edit icon" /> Chỉnh sửa
                    </button>
                ) : (
                    <button className="save-btn" onClick={handleSave}>
                        <img src={saveIcon} alt="Save icon" /> Lưu
                    </button>
                )}
            </div>

            <div className="avatar-section">
                <img src={avatar} alt="avatar" className="avatar" />
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
                    <label>Chức vụ</label>
                    <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="">-- Chọn chức vụ --</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Quản lý</option>
                        <option value="STAFF">Nhân viên</option>
                    </select>
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
