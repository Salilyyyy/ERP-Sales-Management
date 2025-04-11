import React, { useState } from "react";
import "./profile.scss";
import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        password: "",
        role: "",
        phone: "",
        email: "",
        address: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setIsEditing(false);
    };
    const handleAvatarClick = () => {
        document.getElementById("avatarInput").click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setAvatar(imageUrl); // cần thêm state avatar
        }
    };

    // Thêm vào useState phía trên
    const [avatar, setAvatar] = useState(avatarIcon);


    return (
        <div className="profile-container">
            <h2>Hồ sơ cá nhân</h2>

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
                    <label>Họ tên</label>
                    <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="form-row">
                    <label>Mật khẩu</label>
                    {isEditing ? (
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    ) : (
                        <span className="change-password-text">Đổi mật khẩu</span>
                    )}
                </div>

                <div className="form-row">
                    <label>Chức vụ</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="">-- Chọn chức vụ --</option>
                        <option value="doctor">Admin</option>
                        <option value="nurse">Quản lý</option>
                        <option value="admin">Nhân viên</option>
                    </select>
                </div>

                <div className="form-row">
                    <label>Số điện thoại</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
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
