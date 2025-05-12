import React, { useState, useEffect } from "react";
import axios from "axios";
import apiCustomer from "../../api/apiCustomer";
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

    const [customerName, setCustomerName] = useState("");
    const [organization, setOrganization] = useState("");
    const [taxCode, setTaxCode] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [customerType, setCustomerType] = useState("cá nhân");
    const [points, setPoints] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [postCode, setPostCode] = useState("");

    const resetForm = () => {
        setCustomerName("");
        setOrganization("");
        setTaxCode("");
        setPhone("");
        setEmail("");
        setNotes("");
        setCustomerType("cá nhân");
        setPoints("");
        setAddress("");
        setPostCode("");
        setSelectedCity("");
        setSelectedDistrict("");
        setSelectedWard("");
        setCities([]);
        setDistricts([]);
        setWards([]);
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
        // Validate required location fields
        if (!selectedCity || !selectedDistrict || !selectedWard) {
            alert("Vui lòng chọn đầy đủ Thành phố/Tỉnh, Quận/Huyện, và Phường/Xã");
            return;
        }

        const cityObj = cities.find(c => c.code === parseInt(selectedCity));
        const districtObj = districts.find(d => d.code === parseInt(selectedDistrict));
        const wardObj = wards.find(w => w.code === parseInt(selectedWard));

        if (!cityObj || !districtObj || !wardObj) {
            alert("Có lỗi khi lấy thông tin địa chỉ. Vui lòng thử lại.");
            return;
        }

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
            console.log("Customer created successfully");
            resetForm();
            navigate("/customer");
        })
        .catch(error => {
            console.error("Error creating customer:", error);
        });
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
                    <input type="text" value={customerName} onChange={(e)=> setCustomerName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Loại khách hàng</label>
                    <div className="radio-group">
                        <label>
                            <input type="radio" name="customerType" value="cá nhân" checked={customerType === "cá nhân"} onChange={(e)=> setCustomerType(e.target.value)} /> Cá nhân
                        </label>
                        <label>
                            <input type="radio" name="customerType" value="tổ chức" checked={customerType === "tổ chức"} onChange={(e)=> setCustomerType(e.target.value)} /> Tổ chức
                        </label>
                    </div>
                </div>
                {customerType === "tổ chức" && (
                    <div className="form-group">
                        <label>Tên tổ chức</label>
                        <input type="text" value={organization} onChange={(e)=> setOrganization(e.target.value)} />
                    </div>
                )}
                <div className="form-group">
                    <label>Mã số thuế</label>
                    <input type="text" value={taxCode} onChange={(e)=> setTaxCode(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Điện thoại</label>
                    <input type="text" value={phone} onChange={(e)=> setPhone(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e)=> setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Mã bưu chính</label>
                    <input type="text" value={postCode} onChange={(e)=> setPostCode(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Điểm thưởng</label>
                    <input type="text" value={points} onChange={(e)=> setPoints(e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Địa chỉ</label>
                    <input type="text" value={address} onChange={(e)=> setAddress(e.target.value)} />
                </div>
                <div className="form-group select-group">
                    <label>Địa phương</label>
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
                </div>
                <div className="form-group">
                    <label>Ghi chú</label>
                    <input type="text" className="notes" value={notes} onChange={(e)=> setNotes(e.target.value)} />
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
