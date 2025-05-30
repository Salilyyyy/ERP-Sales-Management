import React, { useState, useEffect } from "react";
import axios from "axios";
import apiCustomer from "../../api/apiCustomer";
import { toast } from "react-toastify";
import { postalCodes } from "../../mock/mock";
import "./createCustomer.scss";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import { useNavigate } from "react-router-dom";

const CustomerForm = () => {
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [locationError, setLocationError] = useState("");

    const [customerName, setCustomerName] = useState("");
    const [customerNameError, setCustomerNameError] = useState("");
    const [organization, setOrganization] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [customerType, setCustomerType] = useState("cá nhân");
    const [points, setPoints] = useState("");
    const [address, setAddress] = useState("");
    const [addressError, setAddressError] = useState("");
    const [notes, setNotes] = useState("");
    const [postCode, setPostCode] = useState("");
    const [postCodeError, setPostCodeError] = useState("");

    const resetForm = () => {
        setCustomerName("");
        setCustomerNameError("");
        setOrganization("");
        setTaxCode("");
        setPhone("");
        setPhoneError("");
        setEmail("");
        setEmailError("");
        setNotes("");
        setCustomerType("cá nhân");
        setPoints("");
        setAddress("");
        setAddressError("");
        setPostCode("");
        setPostCodeError("");
        setLocationError("");
        setSelectedCity("");
        setSelectedDistrict("");
        setSelectedWard("");
        setCities([]);
        setDistricts([]);
        setWards([]);
    };

    const validatePostalCode = (code) => {
        if (!code) return true;
        return postalCodes.some(pc => {
            const codes = pc.code.split('-');
            if (codes.length === 1) {
                return code === codes[0];
            } else {
                const [min, max] = codes;
                return code >= min && code <= max;
            }
        });
    };

    const validateForm = () => {
        let isValid = true;

        if (!customerName.trim()) {
            setCustomerNameError("Vui lòng nhập tên khách hàng");
            isValid = false;
        } else {
            setCustomerNameError("");
        }

        if (!phone) {
            setPhoneError("Vui lòng nhập số điện thoại");
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            setPhoneError("Số điện thoại phải có 10 số");
            isValid = false;
        } else {
            setPhoneError("");
        }

        if (!email) {
            setEmailError("Vui lòng nhập email");
            isValid = false;
        } else if (!email.includes('@')) {
            setEmailError("Email phải chứa ký tự @");
            isValid = false;
        } else {
            setEmailError("");
        }

        if (!postCode) {
            setPostCodeError("Vui lòng nhập mã bưu chính");
            isValid = false;
        } else if (!/^\d{5}$/.test(postCode)) {
            setPostCodeError("Mã bưu chính phải có 5 số");
            isValid = false;
        } else if (!validatePostalCode(postCode)) {
            setPostCodeError("Mã bưu chính không hợp lệ");
            isValid = false;
        } else {
            setPostCodeError("");
        }

        if (!address.trim()) {
            setAddressError("Vui lòng nhập địa chỉ");
            isValid = false;
        } else {
            setAddressError("");
        }

        if (!selectedCity || !selectedDistrict || !selectedWard) {
            setLocationError("Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, và Phường/Xã");
            isValid = false;
        } else {
            setLocationError("");
        }

        return isValid;
    };

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

    const handleCreateCustomer = () => {
        if (!validateForm()) {
            return;
        }

        const cityObj = cities.find(c => c.code === parseInt(selectedCity));
        const districtObj = districts.find(d => d.code === parseInt(selectedDistrict));
        const wardObj = wards.find(w => w.code === parseInt(selectedWard));
        const fullAddress = `${address}, ${wardObj.name}, ${districtObj.name}, ${cityObj.name}`;

        apiCustomer.create({
            name: customerName,
            organization,
            tax: taxCode,
            phoneNumber: phone,
            email,
            introduce: customerType,
            postalCode: postCode,
            bonusPoints: points,
            address: fullAddress,
            notes
        })
            .then(() => {
                toast.success("Tạo khách hàng thành công!");
                resetForm();
                navigate("/customer");
            })
    };

    return (
        <div className="customer-form-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/customer")}> <img src={backIcon} alt="Quay lại" /> </div>
                <h2>Tạo khách hàng mới</h2>
            </div>
            <div className="actions">
                <button className="delete" onClick={resetForm}> <img src={deleteIcon} alt="Xóa" /> Xóa nội dung </button>
                <button className="create" onClick={handleCreateCustomer}> <img src={createIcon} alt="Tạo" /> Tạo khách hàng </button>
            </div>
            <form className="customer-form">
                <div className="form-group">
                    <label>Tên khách hàng</label>
                    <div className="valua">
                        <input type="text" value={customerName} onChange={(e) => {
                            setCustomerName(e.target.value);
                            setCustomerNameError("");
                        }} />
                        {customerNameError && <div className="error-message">{customerNameError}</div>}
                    </div>
                </div>
                <div className="form-group">
                    <label>Loại khách hàng</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio" name="customerType" value="cá nhân" checked={customerType === "cá nhân"} onChange={(e) => setCustomerType(e.target.value)} /> Cá nhân
                        </label>
                        <label>
                            <input type="radio" name="customerType" value="tổ chức" checked={customerType === "tổ chức"} onChange={(e) => setCustomerType(e.target.value)} /> Tổ chức
                        </label>
                    </div>
                </div>
                {customerType === "tổ chức" && (
                    <>
                        <div className="form-group">
                            <label>Tên tổ chức</label>
                            <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Mã số thuế</label>
                            <input type="text" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
                        </div>
                    </>
                )}
                <div className="form-group">
                    <label>Điện thoại</label>
                    <div className="valua">
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length > 10) return;
                                setPhone(value);
                                setPhoneError("");
                            }}
                        />
                        {phoneError && <div className="error-message">{phoneError}</div>}
                    </div>
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <div className="valua">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                setEmailError("");
                            }}
                        />
                        {emailError && <div className="error-message">{emailError}</div>}
                    </div>
                </div>
                <div className="form-group">
                    <label>Mã bưu chính</label>
                    <div className="valua">
                        <input
                            type="text"
                            value={postCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length > 5) return;
                                setPostCode(value);
                                setPostCodeError("");
                            }}
                        />
                        {postCodeError && <div className="error-message">{postCodeError}</div>}
                    </div>
                </div>
                <div className="form-group">
                    <label>Điểm thưởng</label>
                    <input type="text" value={points} onChange={(e) => setPoints(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Địa chỉ</label>
                    <div className="valua">
                        <input type="text" value={address} onChange={(e) => {
                            setAddress(e.target.value);
                            setAddressError("");
                        }} />
                        {addressError && <div className="error-message">{addressError}</div>}
                    </div>
                </div>
                <div className="form-group select-group">
                    <label>Địa phương</label>
                    <div className="valua">
                        <div className="select-container">
                            <select onChange={(e) => setSelectedCity(e.target.value)} value={selectedCity}>
                                <option value="">Chọn thành phố/tỉnh</option>
                                {cities.map((city) => (
                                    <option key={city.code} value={city.code}> {city.name} </option>
                                ))}
                            </select>
                            <select onChange={(e) => setSelectedDistrict(e.target.value)} value={selectedDistrict} disabled={!selectedCity}>
                                <option value="">Chọn quận/huyện</option>
                                {districts.map((district) => (
                                    <option key={district.code} value={district.code}> {district.name} </option>
                                ))}
                            </select>
                            <select onChange={(e) => setSelectedWard(e.target.value)} value={selectedWard} disabled={!selectedDistrict}>
                                <option value="">Chọn xã/phường</option>
                                {wards.map((ward) => (
                                    <option key={ward.code} value={ward.code}> {ward.name} </option>
                                ))}
                            </select>
                        </div>
                        {locationError && <div className="error-message">{locationError}</div>}
                    </div>
                </div>
                <div className="form-group">
                    <label>Ghi chú</label>
                    <input type="text" className="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
