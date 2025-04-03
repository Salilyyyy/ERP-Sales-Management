import React, { useState, useEffect } from "react";
import axios from "axios";
import "./createCustomer.scss";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import { useNavigate } from "react-router-dom";
const CustomerForm = () => {
    const resetForm = () => {
        setSelectedCity("");
        setSelectedDistrict("");
        setCities([]);
        setDistricts([]);
        setWards([]);
    };
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

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
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(response => setWards(response.data.wards))
                .catch(error => console.error("Lỗi khi lấy danh sách xã/phường:", error));
        }
    }, [selectedDistrict]);

    return (
        <div className="customer-form-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/customer")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Tạo khách hàng mới</h2>
            </div>
            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
                </button>
                <button className="create"><img src={createIcon} alt="Tạo" /> Tạo khách hàng</button>
            </div>
            <form className="customer-form">
                <div className="form-group">
                    <label>Tên khách hàng</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Tên tổ chức</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Mã số thuế</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Điện thoại</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" />
                </div>
                <div className="form-group">
                    <label>Điểm thưởng</label>
                    <input type="text" />
                </div>
                <div className="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" />
                </div>
                <div className="form-group select-group">
                    <label>Tỉnh/ thành phố</label>
                    <div className="select-container">
                        <select onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value="">Chọn thành phố/tỉnh</option>
                            {cities.map((city) => (
                                <option key={city.code} value={city.code}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <select onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedCity}>
                            <option value="">Chọn quận/huyện</option>
                            {districts.map((district) => (
                                <option key={district.code} value={district.code}>
                                    {district.name}
                                </option>
                            ))}
                        </select>
                        <select disabled={!selectedDistrict}>
                            <option value="">Chọn xã/phường</option>
                            {wards.map((ward) => (
                                <option key={ward.code} value={ward.code}>
                                    {ward.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Ghi chú</label>
                    <input type="text"  className="notes" />
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
