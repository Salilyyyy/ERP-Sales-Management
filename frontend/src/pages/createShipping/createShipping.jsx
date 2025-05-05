import React, { useState, useEffect } from "react";
import "./createShipping.scss";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InvoiceRepository from "../../api/apiInvoice";
import PostOfficeRepository from "../../api/apiPostOffice";

const CreateShipping = () => {
    const navigate = useNavigate();

    const [invoices, setInvoices] = useState([]);
    const [postOffices, setPostOffices] = useState([]);
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
        const fetchData = async () => {
            try {
                // Fetch invoices
                const rawInvoiceResponse = await InvoiceRepository.get('');
                if (rawInvoiceResponse.success) {
                    const deliveredInvoices = rawInvoiceResponse.data.filter(invoice => invoice.isDelivery);
                    setInvoices(deliveredInvoices);
                    if (deliveredInvoices.length > 0) {
                        const firstInvoice = deliveredInvoices[0];
                        setFormData(prev => ({
                            ...prev,
                            invoiceCode: firstInvoice.ID,
                        }));
                        
                        // Fetch and set customer details for the first invoice
                        try {
                            const invoiceDetailResponse = await InvoiceRepository.get(`/${firstInvoice.ID}`);
                            if (invoiceDetailResponse.success) {
                                const invoice = invoiceDetailResponse.data;
                                const customer = invoice.Customers;
                                const shipment = invoice.Shipments && invoice.Shipments[0];

                                setFormData(prev => ({
                                    ...prev,
                        receiverName: shipment?.recipientName || customer.name || '',
                        phone: shipment?.recipientPhone || customer.phoneNumber || '',
                        address: shipment?.recipientAddress || customer.address || '',
                        province: shipment?.province || '',
                        district: shipment?.district || '',
                        ward: shipment?.ward || '',
                        sendTime: shipment?.sendTime || '',
                        estimatedDelivery: shipment?.receiveTime || '',
                        length: shipment?.size?.length || '',
                        width: shipment?.size?.width || '',
                        height: shipment?.size?.height || '',
                        shippingFee: shipment?.shippingCost || '',
                        weight: shipment?.size?.weight || '',
                        payer: shipment?.payer || 'receiver'
                                }));

                                // Set province/district/ward and fetch corresponding data
                                const provinceCode = shipment?.province;
                                if (provinceCode) {
                                    setSelectedProvince(provinceCode);
                                    const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                                    setDistricts(districtResponse.data.districts);
                                }

                                const districtCode = shipment?.district;
                                if (districtCode) {
                                    setSelectedDistrict(districtCode);
                                    const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                                    setWards(wardResponse.data.wards);
                                }

                                const wardCode = shipment?.ward;
                                if (wardCode) {
                                    setSelectedWard(wardCode);
                                }
                            }
                        } catch (error) {
                            console.error("Failed to fetch first invoice details:", error);
                        }
                    }
                }

                // Fetch post offices
                // Get post office data directly with auth token
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/post-offices`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log("Raw post office response:", response);
                console.log("Full response:", response);
                // Check if data is directly an array or nested
                const officesData = Array.isArray(response.data) ? response.data : 
                                  (response.data?.data || []);
                console.log("Processed post office data:", officesData);
                setPostOffices(officesData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // When invoice code changes, fetch customer details
        if (name === "invoiceCode") {
            try {
                const response = await InvoiceRepository.get(`/${value}`);
                if (response.success) {
                    const invoice = response.data;
                    const customer = invoice.Customers;
                    const shipment = invoice.Shipments && invoice.Shipments[0];

                    // Auto fill customer details
                    setFormData(prev => ({
                        ...prev,
                        receiverName: shipment?.recipientName || customer.name || '',
                        phone: shipment?.recipientPhone || customer.phoneNumber || '',
                        address: shipment?.recipientAddress || customer.address || '',
                        province: shipment?.province || '',
                        district: shipment?.district || '',
                        ward: shipment?.ward || '',
                        sendTime: shipment?.sendTime || '',
                        estimatedDelivery: shipment?.receiveTime || '',
                        length: shipment?.size?.length || '',
                        width: shipment?.size?.width || '',
                        height: shipment?.size?.height || '',
                        shippingFee: shipment?.shippingCost || '',
                        weight: shipment?.size?.weight || '',
                        payer: shipment?.payer || 'receiver'
                    }));

                    // Update province/district/ward selectors
                    const provinceCode = shipment?.province;
                    if (provinceCode) {
                        setSelectedProvince(provinceCode);
                        // Fetch districts for selected province
                        const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                        setDistricts(districtResponse.data.districts);
                    }

                    const districtCode = shipment?.district;
                    if (districtCode) {
                        setSelectedDistrict(districtCode);
                        // Fetch wards for selected district
                        const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                        setWards(wardResponse.data.wards);
                    }

                    const wardCode = shipment?.ward;
                    if (wardCode) {
                        setSelectedWard(wardCode);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch invoice details:", error);
            }
        }
    };

    const handleSubmit = () => {
        alert("Đã tạo vận đơn thành công!");
        console.log(formData);
    };

    const resetForm = async () => {
        const deliveredInvoices = invoices.filter(invoice => invoice.isDelivery);
        if (deliveredInvoices.length > 0) {
            const firstInvoice = deliveredInvoices[0];
            // Reset form with first invoice ID
            setFormData({
                invoiceCode: firstInvoice.ID,
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

            // Fetch and set customer details for the first invoice
            try {
                const response = await InvoiceRepository.get(`/${firstInvoice.ID}`);
                if (response.success) {
                    const invoice = response.data;
                    const customer = invoice.Customers;
                    const shipment = invoice.Shipments && invoice.Shipments[0];

                    setFormData(prev => ({
                        ...prev,
                        receiverName: shipment?.recipientName || customer.name || '',
                        phone: shipment?.recipientPhone || customer.phoneNumber || '',
                        address: shipment?.recipientAddress || customer.address || '',
                        province: shipment?.province || '',
                        district: shipment?.district || '',
                        ward: shipment?.ward || '',
                        sendTime: shipment?.sendTime || '',
                        estimatedDelivery: shipment?.receiveTime || '',
                        length: shipment?.size?.length || '',
                        width: shipment?.size?.width || '',
                        height: shipment?.size?.height || '',
                        shippingFee: shipment?.shippingCost || '',
                        weight: shipment?.size?.weight || '',
                        payer: shipment?.payer || 'receiver'
                    }));

                    // Set province/district/ward and fetch corresponding data
                    const provinceCode = shipment?.province;
                    if (provinceCode) {
                        setSelectedProvince(provinceCode);
                        const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
                        setDistricts(districtResponse.data.districts);
                    }

                    const districtCode = shipment?.district;
                    if (districtCode) {
                        setSelectedDistrict(districtCode);
                        const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
                        setWards(wardResponse.data.wards);
                    }

                    const wardCode = shipment?.ward;
                    if (wardCode) {
                        setSelectedWard(wardCode);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch first invoice details on reset:", error);
                // If error occurs, clear all location related fields
                setSelectedProvince("");
                setSelectedDistrict("");
                setSelectedWard("");
                setDistricts([]);
                setWards([]);
            }
        } else {
            // If no invoices, clear everything
            setFormData({
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
            setSelectedProvince("");
            setSelectedDistrict("");
            setSelectedWard("");
            setDistricts([]);
            setWards([]);
        }
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
                        {invoices.length > 0 ? (
                            <select
                                name="invoiceCode"
                                value={formData.invoiceCode}
                                onChange={handleChange}
                            >
                                {invoices.map((invoice) => (
                                    <option key={invoice.ID} value={invoice.ID}>
                                        {invoice.ID}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="error-message" style={{ color: 'red', padding: '8px 0' }}>
                                Không có hoá đơn đã giao nào
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Bưu cục gửi</label>
                        {postOffices.length > 0 ? (
                            <select
                                name="senderPost"
                                value={formData.senderPost}
                                onChange={handleChange}
                            >
                                <option value="">Chọn bưu cục gửi</option>
                                {postOffices.map((office) => {
                                    console.log("Rendering office:", office);
                                    return (
                                        <option key={office.ID} value={office.ID}>
                                            {office.name || 'Bưu cục không có tên'}
                                        </option>
                                    );
                                })}
                            </select>
                        ) : (
                            <div className="error-message" style={{ color: 'red', padding: '8px 0' }}>Không có bưu cục nào</div>
                        )}
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
