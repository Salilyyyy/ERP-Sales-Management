import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userApi } from "../../api/apiUser";
import "./createEmployee.scss";

import userIcon from "../../assets/img/avatar.png";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";

const CreateEmployee = () => {
    const navigate = useNavigate();

    // Avatar upload
    const fileInputRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(userIcon);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        console.log("Form reset");
        setPreviewImage(userIcon);
        setSelectedCity("");
        setSelectedDistrict("");
        setSelectedWard("");
        setFormData({
            userType: "employee",
            status: "ACTIVE",
            password: "password123"
        });
        setErrors({});
    };

    // Location selection
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");

    const [formData, setFormData] = useState({
        userType: "employee",
        status: "ACTIVE",
        password: "password123" 
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/?depth=1")
            .then(response => setCities(response.data))
            .catch(error => console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error));
    }, []);

    useEffect(() => {
        if (selectedCity) {
            axios.get(`https://provinces.open-api.vn/api/p/${selectedCity}?depth=2`)
                .then(response => setDistricts(response.data.districts))
                .catch(error => console.error("Lỗi khi lấy danh sách quận/huyện:", error));
        } else {
            setDistricts([]);
            setSelectedDistrict("");
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(response => setWards(response.data.wards))
                .catch(error => console.error("Lỗi khi lấy danh sách xã/phường:", error));
        } else {
            setWards([]);
            setSelectedWard("");
        }
    }, [selectedDistrict]);

    return (
        <div className="create-employee">
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
                    // Validate form
                    const newErrors = {};
                    if (!formData.email?.trim()) newErrors.email = "Email is required";
                    if (!formData.name?.trim()) newErrors.name = "Name is required";
                    if (!formData.address?.trim()) newErrors.address = "Address is required";
                    if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = "Phone number is required";
                    if (!formData.department?.trim()) newErrors.department = "Department is required";
                    if (!formData.IdentityCard?.trim()) newErrors.IdentityCard = "Identity card is required";
                    if (!formData.birthday) newErrors.birthday = "Birthday is required";

                    if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        alert("Please fill in all required fields");
                        return;
                    }

                    try {
                        setLoading(true);
                        // Get the selected location names instead of codes
                        const selectedCityName = cities.find(c => c.code === parseInt(selectedCity))?.name || '';
                        const selectedDistrictName = districts.find(d => d.code === parseInt(selectedDistrict))?.name || '';
                        const selectedWardName = wards.find(w => w.code === parseInt(selectedWard))?.name || '';
                        
                        // Combine address components
                        const fullAddress = [
                            formData.address,
                            selectedWardName,
                            selectedDistrictName,
                            selectedCityName
                        ].filter(Boolean).join(', ');

                        const dataToSend = {
                            ...formData,
                            address: fullAddress,
                            image: previewImage !== userIcon ? previewImage : null
                        };
                        await userApi.createUser(dataToSend);
                        navigate("/employee");
                    } catch (error) {
                        console.error("Error creating employee:", error);
                        alert(error.response?.data?.error || "Failed to create employee. Please try again.");
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
                        >
                            <option value="">Chọn chức vụ</option>
                            <option value="admin">Quản lý</option>
                            <option value="employee">Nhân viên</option>
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
                            <option value="wavehouse">Kho</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                            type="date"
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                            className={errors.birthday ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Số CMND/CCCD</label>
                        <input
                            type="text"
                            onChange={(e) => setFormData({ ...formData, IdentityCard: e.target.value })}
                            className={errors.IdentityCard ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className={errors.phoneNumber ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={errors.password ? "error" : ""}
                            placeholder="Mặc định: password123"
                        />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ (Số nhà, tên đường)</label>
                        <input
                            type="text"
                            placeholder="Nhập số nhà, tên đường"
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={errors.address ? "error" : ""}
                        />
                    </div>

                    <div className="form-group">
                        <label>Tỉnh/Thành phố</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => {
                                setSelectedCity(e.target.value);
                                setFormData({ ...formData, city: e.target.value });
                            }}
                        >
                            <option value="">Chọn Tỉnh/Thành phố</option>
                            {cities.map(city => (
                                <option key={city.code} value={city.code}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quận/Huyện</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                setFormData({ ...formData, district: e.target.value });
                            }}
                            disabled={!selectedCity}
                        >
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map(d => (
                                <option key={d.code} value={d.code}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Xã/Phường</label>
                        <select
                            value={selectedWard}
                            onChange={(e) => {
                                setSelectedWard(e.target.value);
                                setFormData({ ...formData, ward: e.target.value });
                            }}
                            disabled={!selectedDistrict}
                        >
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map(w => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEmployee;
