import React, { useState, useEffect } from "react";
import "./createShipping.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import InvoiceRepository from "../../api/apiInvoice";
import PostOfficeRepository from "../../api/apiPostOffice";
import ShippingRepository from "../../api/apiShipping";

const CreateShipping = () => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];
    
    const [invoices, setInvoices] = useState([]);
    const [postOffices, setPostOffices] = useState([]);
    const [errors, setErrors] = useState({});
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
                const filteredInvoices = invoicesData.filter(invoice => 
                    invoice.isDelivery === true && 
                    invoice.Shipments.some(shipment => shipment.postOfficeID === null)
                );
                setInvoices(filteredInvoices);

                const postOfficesData = await PostOfficeRepository.getAll();
                setPostOffices(postOfficesData);

                if (invoicesData.length > 0 && postOfficesData.length > 0) {
                    const firstInvoice = invoicesData[0];
                    const firstPostOffice = postOfficesData[0];
                    setFormData(prev => ({
                        ...prev,
                        invoiceCode: firstInvoice.ID,
                        senderPost: firstPostOffice.ID,
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

        if (name === 'length' || name === 'width' || name === 'height') {
            setErrors(prev => ({ ...prev, size: undefined }));
        } else {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.invoiceCode) {
            newErrors.invoiceCode = t.pleaseSelectInvoice;
        }
        if (!formData.senderPost) {
            newErrors.senderPost = t.pleaseSelectPostOffice;
        }
        if (!formData.receiverName?.trim()) {
            newErrors.receiverName = t.pleaseEnterReceiverName;
        }
        if (!formData.sendTime) {
            newErrors.sendTime = t.pleaseSelectSendTime;
        }
        if (!formData.estimatedDelivery) {
            newErrors.estimatedDelivery = t.pleaseSelectReceiveTime;
        }
        if (!formData.shippingFee) {
            newErrors.shippingFee = t.pleaseEnterShippingFee;
        }
        if (!formData.length || !formData.width || !formData.height) {
            newErrors.size = t.pleaseEnterCompleteDimensions;
        }
        if (!formData.weight) {
            newErrors.weight = t.pleaseEnterWeight;
        }
        if (!formData.payer) {
            newErrors.payer = t.pleaseSelectPayer;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        try {
            if (!validateForm()) {
                return;
            }

            const formatDate = (dateString) => {
                if (!dateString) {
                    const now = new Date();
                    const thailandOffset = 7 * 60;
                    const userOffset = now.getTimezoneOffset();
                    const offsetDiff = thailandOffset + userOffset;
                    now.setMinutes(now.getMinutes() + offsetDiff);
                    return now.toISOString();
                }
                const date = new Date(dateString);
                const thailandOffset = 7 * 60;
                const userOffset = date.getTimezoneOffset();
                const offsetDiff = thailandOffset + userOffset;
                date.setMinutes(date.getMinutes() + offsetDiff);
                return date.toISOString();
            };

            const sendTimeValue = formatDate(formData.sendTime);
            const receiveTimeValue = formatDate(formData.estimatedDelivery);

            const shippingData = {
                invoiceID: parseInt(formData.invoiceCode),
                postOfficeID: parseInt(formData.senderPost),
                receiverName: formData.receiverName || t.noName,
                receiverPhone: formData.phone || t.noPhone,
                sendTime: sendTimeValue,
                receiveTime: receiveTimeValue,
                size: `${formData.length || 0} x ${formData.width || 0} x ${formData.height || 0}`,
                shippingCost: parseFloat(formData.shippingFee) || 0,
                payer: formData.payer || "receiver",
                address: formData.address || t.noAddress,
                recipientAddress: formData.address || t.noAddress,
                recipientName: formData.receiverName || t.noName,
                recipientPhone: formData.phone || t.noPhone
            };

            await ShippingRepository.create(shippingData);
            navigate("/shipping-list");
        } catch (error) {
            console.error("Error creating shipment:", error);
        }
    };

    const resetForm = async () => {
        if (invoices.length > 0 && postOffices.length > 0) {
            const firstInvoice = invoices[0];
            const firstPostOffice = postOffices[0];
            
            try {
                const invoiceResponse = await InvoiceRepository.get(`/${firstInvoice.ID}`);
                if (!invoiceResponse) {
                    throw new Error('Failed to fetch invoice details');
                }
                const customer = invoiceResponse?.data?.Customers || {};
                const shipment = invoiceResponse?.data?.Shipments?.[0];

                setFormData({
                    invoiceCode: firstInvoice.ID,
                    senderPost: firstPostOffice.ID,
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
                    payer: shipment?.payer || 'receiver',
                    note: '',
                    codFee: ''
                });
            } catch (error) {
                console.error("Failed to reset form:", error);
            }
        }
    };


    return (
        <div className="create-shipping-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/shipping-list")}>
                    <img src={backIcon} alt={t.back} />
                </div>
                <h2>{t.createShipping}</h2>
            </div>

            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt={t.delete} /> {t.clearContent}
                </button>
                <button className="create" onClick={handleSubmit}>
                    <img src={createIcon} alt={t.create} /> {t.createInvoice}
                </button>
            </div>

            <form className="form">
                <div className="row">
                    <div className="form-group">
                        <label>{t.invoiceCode} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            {invoices.length > 0 ? (
                                <>
                                    <select
                                        name="invoiceCode"
                                        value={formData.invoiceCode}
                                        onChange={handleChange}
                                        className={errors.invoiceCode ? 'error' : ''}
                                    >
                                        <option value="">{t.selectInvoiceCode}</option>
                                        {invoices.map((invoice) => (
                                            <option key={invoice.ID} value={invoice.ID}>
                                                {invoice.ID}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.invoiceCode && (
                                        <div className="error-message">
                                            {errors.invoiceCode}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="error-message">
                                    {t.noInvoicesWaiting}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.senderPostOffice} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            {postOffices.length > 0 ? (
                                <>
                                    <select
                                        name="senderPost"
                                        value={formData.senderPost}
                                        onChange={handleChange}
                                        className={errors.senderPost ? 'error' : ''}
                                    >
                                        <option value="">{t.selectSenderPostOffice}</option>
                                        {postOffices.map((office) => (
                                            <option key={office.ID} value={office.ID}>
                                                {office.name || t.postOfficeNoName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.senderPost && (
                                        <div className="error-message">
                                            {errors.senderPost}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="error-message">
                                    {t.noPostOffices}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.receiverName} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="receiverName"
                                value={formData.receiverName}
                                onChange={handleChange}
                                className={errors.receiverName ? 'error' : ''}
                            />
                            {errors.receiverName && (
                                <div className="error-message">
                                    {errors.receiverName}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.phoneNumber}</label>
                        <div className="input-wrapper">
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.receiverAddress}</label>
                        <div className="input-wrapper">
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.sendTime} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <input
                                type="datetime-local"
                                name="sendTime"
                                value={formData.sendTime}
                                onChange={handleChange}
                                className={errors.sendTime ? 'error' : ''}
                            />
                            {errors.sendTime && (
                                <div className="error-message">
                                    {errors.sendTime}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.estimatedReceive} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <input
                                type="datetime-local"
                                name="estimatedDelivery"
                                value={formData.estimatedDelivery}
                                onChange={handleChange}
                                className={errors.estimatedDelivery ? 'error' : ''}
                            />
                            {errors.estimatedDelivery && (
                                <div className="error-message">
                                    {errors.estimatedDelivery}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.dimensions} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <div className="size-inputs">
                                <input
                                    type="number"
                                    placeholder={t.length}
                                    name="length"
                                    value={formData.length}
                                    onChange={handleChange}
                                    className={errors.size ? 'error' : ''}
                                />
                                <input
                                    type="number"
                                    placeholder={t.width}
                                    name="width"
                                    value={formData.width}
                                    onChange={handleChange}
                                    className={errors.size ? 'error' : ''}
                                />
                                <input
                                    type="number"
                                    placeholder={t.height}
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    className={errors.size ? 'error' : ''}
                                />
                            </div>
                            {errors.size && (
                                <div className="error-message">
                                    {errors.size}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t.weight} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                placeholder={t.weightUnit}
                                className={errors.weight ? 'error' : ''}
                            />
                            {errors.weight && (
                                <div className="error-message">
                                    {errors.weight}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.shippingFee} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                name="shippingFee"
                                value={formData.shippingFee}
                                onChange={handleChange}
                                className={errors.shippingFee ? 'error' : ''}
                            />
                            {errors.shippingFee && (
                                <div className="error-message">
                                    {errors.shippingFee}
                                </div>
                            )}
                        </div>
                    </div>
                    {formData.payer === "receiver" && (
                        <div className="form-group">
                            <label>{t.codFee}</label>
                            <div className="input-wrapper">
                                <input type="number" name="codFee" value={formData.codFee} onChange={handleChange} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>{t.payer} <span style={{ color: 'red' }}>*</span></label>
                        <div className="input-wrapper">
                            <div className="payer-options">
                                <label>
                                    <input type="radio" name="payer" value="receiver" checked={formData.payer === "receiver"} onChange={handleChange} /> {t.receiver}
                                </label>
                                <label>
                                    <input type="radio" name="payer" value="seller" checked={formData.payer === "seller"} onChange={handleChange} /> {t.seller}
                                </label>
                            </div>
                            {errors.payer && (
                                <div className="error-message">
                                    {errors.payer}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="form-group full">
                        <label>{t.note}</label>
                        <div className="input-wrapper">
                            <input type="text" name="note" value={formData.note} onChange={handleChange} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateShipping;
