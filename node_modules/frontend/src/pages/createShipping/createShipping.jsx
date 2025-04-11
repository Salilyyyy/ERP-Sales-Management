import React, { useState, useEffect } from "react";
import "./createShipping.scss";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { invoices } from "../../mock/mock";

const CreateShipping = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        invoiceCode: "",
        senderPost: "",
        receiverName: "",
        phone: "",
        address: "",
        province: "",
        district: "",
        ward: "",
        sendTime: "",
        estimatedDelivery: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        shippingFee: "",
        codFee: "",
        payer: "receiver",
        note: ""
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");

    useEffect(() => {
        if (invoices.length > 0) {
            setFormData(prev => ({
                ...prev,
                invoiceCode: invoices[0].id
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        alert("Đã tạo vận đơn thành công!");
        console.log(formData);
    };

    const resetForm = () => {
        setFormData({
            invoiceCode: invoices.length > 0 ? invoices[0].id : "",
            senderPost: "",
            receiverName: "",
            phone: "",
            address: "",
            province: "",
            district: "",
            ward: "",
            sendTime: "",
            estimatedDelivery: "",
            length: "",
            width: "",
            height: "",
            weight: "",
            shippingFee: "",
            codFee: "",
            payer: "receiver",
            note: ""
        });
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setDistricts([]);
        setWards([]);
    };

    useEffect(() => {
        axios.get("https://provinces.open-api.vn/api/p/")
            .then(res => setProvinces(res.data))
            .catch(err => console.error("Lỗi lấy tỉnh:", err));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => {
                    setDistricts(res.data.districts);
                    setSelectedDistrict("");
                    setSelectedWard("");
                    setWards([]);
                })
                .catch(err => console.error("Lỗi lấy huyện:", err));
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => {
                    setWards(res.data.wards);
                    setSelectedWard("");
                })
                .catch(err => console.error("Lỗi lấy xã:", err));
        }
    }, [selectedDistrict]);

    return (
        <div className="create-shipping-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/shipping-list")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Thêm vận đơn</h2>
            </div>

            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
                </button>
                <button className="create" onClick={handleSubmit}>
                    <img src={createIcon} alt="Tạo" /> Tạo hoá đơn
                </button>
            </div>

            <form className="form">
                <div className="row">
                    <div className="form-group">
                        <label>Mã hoá đơn</label>
                        <select
                            name="invoiceCode"
                            value={formData.invoiceCode}
                            onChange={handleChange}
                        >
                            {invoices.map((invoice) => (
                                <option key={invoice.id} value={invoice.id}>
                                    {invoice.id}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Bưu cục gửi</label>
                        <input type="text" name="senderPost" value={formData.senderPost} onChange={handleChange} />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Tên người nhận</label>
                        <input type="text" name="receiverName" value={formData.receiverName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Địa chỉ nhận</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Tỉnh/Thành</label>
                        <select value={selectedProvince} onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setFormData({ ...formData, province: e.target.value });
                        }}>
                            <option value="">Chọn Tỉnh/Thành phố</option>
                            {provinces.map(p => (
                                <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Quận/huyện</label>
                        <select value={selectedDistrict} onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setFormData({ ...formData, district: e.target.value });
                        }} disabled={!selectedProvince}>
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map(d => (
                                <option key={d.code} value={d.code}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Xã/phường</label>
                        <select value={selectedWard} onChange={(e) => {
                            setSelectedWard(e.target.value);
                            setFormData({ ...formData, ward: e.target.value });
                        }} disabled={!selectedDistrict}>
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map(w => (
                                <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Thời gian gửi</label>
                        <input type="datetime-local" name="sendTime" value={formData.sendTime} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Nhận dự kiến</label>
                        <input type="datetime-local" name="estimatedDelivery" value={formData.estimatedDelivery} onChange={handleChange} />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Kích thước</label>
                        <div className="size-inputs">
                            <input type="number" placeholder="Dài (cm)" name="length" value={formData.length} onChange={handleChange} />
                            <input type="number" placeholder="Rộng (cm)" name="width" value={formData.width} onChange={handleChange} />
                            <input type="number" placeholder="Cao (cm)" name="height" value={formData.height} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Khối lượng</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="gam" />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Phí vận chuyển</label>
                        <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} />
                    </div>
                    {formData.payer === "receiver" && (
                        <div className="form-group">
                            <label>Phí thu hộ</label>
                            <input type="number" name="codFee" value={formData.codFee} onChange={handleChange} />
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Người thanh toán</label>
                        <div className="payer-options">
                            <label>
                                <input type="radio" name="payer" value="receiver" checked={formData.payer === "receiver"} onChange={handleChange} /> Người nhận hàng (COD)
                            </label>
                            <label>
                                <input type="radio" name="payer" value="seller" checked={formData.payer === "seller"} onChange={handleChange} /> Người bán
                            </label>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group full">
                        <label>Ghi chú</label>
                        <input type="text" name="note" value={formData.note} onChange={handleChange} />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateShipping;
