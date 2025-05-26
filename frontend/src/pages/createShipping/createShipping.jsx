import React, { useState, useEffect } from "react";
import "./createShipping.scss";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import { useNavigate } from "react-router-dom";
import InvoiceRepository from "../../api/apiInvoice";
import PostOfficeRepository from "../../api/apiPostOffice";
import ShippingRepository from "../../api/apiShipping";

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: invoicesData } = await InvoiceRepository.getAll({ unshippedOnly: true });
                setInvoices(invoicesData);

                const postOfficesData = await PostOfficeRepository.getAll();
                setPostOffices(postOfficesData);

                if (invoicesData.length > 0) {
                    const firstInvoice = invoicesData[0];
                    setFormData(prev => ({
                        ...prev,
                        invoiceCode: firstInvoice.ID,
                    }));

                    try {
                        const invoiceResponse = await InvoiceRepository.get(`/${firstInvoice.ID}`);
                        if (!invoiceResponse) {
                            throw new Error('Failed to fetch invoice details');
                        }
                        const customer = invoiceResponse?.data?.Customers || {};
                        const shipment = invoiceResponse?.data?.Shipments?.[0];

                        setFormData(prev => ({
                            ...prev,
                            receiverName: customer.name || '',
                            phone: customer.phoneNumber || '',
                            address: customer.address || '',
                            sendTime: shipment?.sendTime || '',
                            estimatedDelivery: shipment?.receiveTime || '',
                            length: shipment?.size?.length || '',
                            width: shipment?.size?.width || '',
                            height: shipment?.size?.height || '',
                            shippingFee: shipment?.shippingCost || '',
                            weight: shipment?.size?.weight || '',
                            payer: shipment?.payer || 'receiver'
                        }));

                    } catch (error) {
                        console.error("Failed to fetch invoice details:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []);

const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "invoiceCode") {
            try {
                const invoiceResponse = await InvoiceRepository.get(`/${value}`);
                if (!invoiceResponse) {
                    throw new Error('Failed to fetch invoice details');
                }
                const customer = invoiceResponse?.data?.Customers || {};

                const shipment = invoiceResponse?.data?.Shipments?.[0];

                setFormData(prev => ({
                    ...prev,
                    receiverName: customer.name || '',
                    phone: customer.phoneNumber || '',
                    address: customer.address || '',
                    sendTime: shipment?.sendTime || '',
                    estimatedDelivery: shipment?.receiveTime || '',
                    length: shipment?.size?.length || '',
                    width: shipment?.size?.width || '',
                    height: shipment?.size?.height || '',
                    shippingFee: shipment?.shippingCost || '',
                    weight: shipment?.size?.weight || '',
                    payer: shipment?.payer || 'receiver'
                }));
            } catch (error) {
                console.error("Failed to fetch invoice details:", error);
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const formatDate = (dateString) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                const thailandOffset = 7 * 60; 
                const userOffset = date.getTimezoneOffset();
                const offsetDiff = thailandOffset + userOffset;
                date.setMinutes(date.getMinutes() + offsetDiff);
                return date.toISOString();
            };

            const shippingData = {
                invoiceID: parseInt(formData.invoiceCode),
                postOfficeID: parseInt(formData.senderPost),
                receiverName: formData.receiverName,
                receiverPhone: formData.phone,
                sendTime: formatDate(formData.sendTime),
                receiveTime: formatDate(formData.estimatedDelivery),
                size: `${formData.width} x ${formData.height} x ${formData.weight}`,
                shippingCost: parseFloat(formData.shippingFee) || 0,
                payer: formData.payer,
                address: formData.address,
                recipientAddress: formData.address,
                recipientName: formData.receiverName,
                recipientPhone: formData.phone
            };

            await ShippingRepository.create(shippingData);
            navigate("/shipping-list");
        } catch (error) {
            console.error("Error creating shipment:", error);
        }
    };

    const resetForm = async () => {
        if (invoices.length > 0) {
            const firstInvoice = invoices[0];
            setFormData({
                invoiceCode: firstInvoice.ID,
                senderPost: "",
                receiverName: "",
                phone: "",
                address: "",
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

            try {
                const invoiceResponse = await InvoiceRepository.get(`/${firstInvoice.ID}`);
                if (!invoiceResponse) {
                    throw new Error('Failed to fetch invoice details');
                }
                const customer = invoiceResponse?.data?.Customers || {};
                const shipment = invoiceResponse?.data?.Shipments?.[0];

                setFormData(prev => ({
                    ...prev,
                    receiverName: customer.name || '',
                    phone: customer.phoneNumber || '',
                    address: customer.address || '',
                    sendTime: shipment?.sendTime || '',
                    estimatedDelivery: shipment?.receiveTime || '',
                    length: shipment?.size?.length || '',
                    width: shipment?.size?.width || '',
                    height: shipment?.size?.height || '',
                    shippingFee: shipment?.shippingCost || '',
                    weight: shipment?.size?.weight || '',
                    payer: shipment?.payer || 'receiver'
                }));
            } catch (error) {
                console.error("Failed to fetch invoice details:", error);
            }
        }
    };



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
                                Không có hoá đơn chờ tạo vận đơn
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
                                {postOffices.map((office) => (
                                    <option key={office.ID} value={office.ID}>
                                        {office.name || 'Bưu cục không có tên'}
                                    </option>
                                ))}
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
