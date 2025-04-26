import React, { useState, useEffect } from "react";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailSupplier.scss";
import { useParams, useNavigate } from "react-router-dom";
import supplierApi from "../../api/apiSupplier";

const DetailSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSupplier(prev => {
            const updatedSupplier = { ...prev };
            if (value === '') {
                updatedSupplier[name] = null;
            } else {
                updatedSupplier[name] = value;
            }
            return updatedSupplier;
        });
    };

    const handleClear = () => {
        setSupplier(prev => ({
            ...prev,
            name: "",
            phoneNumber: "",
            email: "",
            taxId: "",
            country: "",
            representative: "",
            phoneNumberRep: "",
            address: "",
            postalCode: "",
            notes: "",
        }));
    };

    const handleSave = async () => {
        try {
            const payload = {
                ID: supplier.ID,
                name: supplier.name,
                address: supplier.address,
                phoneNumber: supplier.phoneNumber,
                email: supplier.email,
                country: supplier.country || null,
                representative: supplier.representative,
                phoneNumberRep: supplier.phoneNumberRep,
                postalCode: supplier.postalCode,
                taxId: supplier.taxId || null,
                notes: supplier.notes || null
            };

            const updatedSupplier = await supplierApi.update(supplier.ID, payload);
            setSupplier(updatedSupplier);
            alert("Cập nhật thành công");
            setEditing(false);
        } catch (error) {
            console.error("Error updating supplier: ", error);
            alert("Cập nhật thất bại");
        }
    };

    useEffect(() => {
        async function fetchSupplier() {
            try {
                const data = await supplierApi.getById(id);
                setSupplier(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchSupplier();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!supplier) {
        return <h2>Không tìm thấy nhà cung cấp</h2>;
    }

    return (
        <div className="detail-supplier-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/supplier-list")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết nhà cung cấp</h2>
            </div>

            <div className="actions">
                {editing && (
                    <button className="delete" onClick={handleClear}>
                        <img src={deleteIcon} alt="Xóa" /> Xóa
                    </button>
                )}
                {editing ? (
                    <button className="save" onClick={handleSave}>
                        <img src={saveIcon} alt="Lưu" /> Lưu
                    </button>
                ) : (
                    <button className="edit" onClick={() => setEditing(true)}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
                )}
                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
            </div>

            <div className="detail-supplier-content">
                <div className="supplier-info">
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Tên nhà cung cấp</div>
                            {editing ? <input type="text" className="info-input" name="name" value={supplier.name} onChange={handleInputChange} /> : <div className="info-value">{supplier.name}</div>}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Mã nhà cung cấp</div>
                            <div className="info-value-id">#NCC-{supplier.ID}</div>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Số điện thoại</div>
                            {editing ? <input type="text" className="info-input" name="phoneNumber" value={supplier.phoneNumber} onChange={handleInputChange} /> : <div className="info-value">{supplier.phoneNumber}</div>}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Email</div>
                            {editing ? <input type="text" className="info-input" name="email" value={supplier.email} onChange={handleInputChange} /> : <div className="info-value">{supplier.email}</div>}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Mã số thuế</div>
                            {editing ? <input type="text" className="info-input" name="taxId" value={supplier.taxId || ''} onChange={handleInputChange} /> : <div className="info-value">{supplier.taxId}</div>}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Mã bưu chính</div>
                            {editing ? <input type="text" className="info-input" name="postalCode" value={supplier.postalCode || ''} onChange={handleInputChange} /> : <div className="info-value">{supplier.postalCode}</div>}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Quốc gia</div>
                            {editing ? <input type="text" className="info-input" name="country" value={supplier.country || ''} onChange={handleInputChange} /> : <div className="info-value">{supplier.country}</div>}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Đại diện</div>
                            {editing ? <input type="text" className="info-input" name="representative" value={supplier.representative} onChange={handleInputChange} /> : <div className="info-value">{supplier.representative}</div>}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Điện thoại người đại diện</div>
                            {editing ? <input type="text" className="info-input" name="phoneNumberRep" value={supplier.phoneNumberRep} onChange={handleInputChange} /> : <div className="info-value">{supplier.phoneNumberRep}</div>}
                        </div>
                    </div>
                    <div className="info-row full-width">
                        <div className="info-item">
                            <div className="info-label">Địa chỉ</div>
                            {editing ? <input type="text" className="info-input" name="address" value={supplier.address} onChange={handleInputChange} /> : <div className="info-value">{supplier.address}</div>}
                        </div>
                    </div>
                    <div className="info-row full-width">
                        <div className="info-item">
                            <div className="info-label">Ghi chú</div>
                            {editing ? <input type="text" className="info-input" name="notes" value={supplier.notes || ''} onChange={handleInputChange} /> : <div className="info-value">{supplier.notes}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailSupplier;
