import React, { useState, useEffect, useRef, useMemo } from "react";
import apiAuth from "../../api/apiAuth";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import SupplierTemplate from "../../components/supplierTemplate/supplierTemplate";
import html2pdf from "html2pdf.js";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import apiCountry from "../../api/apiCountry";
import { postalCodes } from "../../mock/mock";
import "./detailSupplier.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import supplierApi from "../../api/apiSupplier";
import { toast } from 'react-toastify';

const DetailSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const currentUser = useMemo(() => {
        const user = apiAuth.getCurrentUser();
        console.log('Current user:', user);
        return user;
    }, []);
    const isStaff = currentUser?.userType === 'staff';
    console.log('Is staff:', isStaff);
    const [supplier, setSupplier] = useState(null);
    const [editedSupplier, setEditedSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        phoneNumber: '',
        postalCode: ''
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [isEditing, setIsEditing] = useState(isEditMode);
    const [countries, setCountries] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const selectRef = useRef(null);
    const lastValidEmailRef = useRef('');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchCountries = async () => {
            const countriesData = await apiCountry.getAll();
            setCountries(countriesData);
        };
        fetchCountries();
    }, []);

    const handleInputChange = (field, value) => {
        // Always update the value first
        setEditedSupplier(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error if field is empty
        if (!value || value.trim() === '') {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
            return;
        }

        // Only validate non-empty values
        let errorMessage = '';
        switch (field) {
            case 'email':
                // Only show error if there's content but it's not in valid format
                if (value.trim() !== '' && (!value.includes('@') || !value.includes('.'))) {
                    errorMessage = 'Email phải chứa @ và .';
                }
                break;

            case 'phoneNumber':
                if (!/^\d*$/.test(value)) { // Allow partial number input
                    errorMessage = 'Số điện thoại chỉ được chứa số';
                } else if (value.length > 0 && value.length !== 10) {
                    errorMessage = 'Số điện thoại phải có 10 chữ số';
                }
                break;

            case 'postalCode':
                if (value.trim() !== '') {
                    const validCode = postalCodes.some(pc => {
                        const codes = pc.code.split('-');
                        if (codes.length === 1) return value === codes[0];
                        const [start, end] = codes;
                        const valueNum = parseInt(value);
                        const startNum = parseInt(start);
                        const endNum = parseInt(end);
                        return valueNum >= startNum && valueNum <= endNum;
                    });
                    if (!validCode) {
                        errorMessage = 'Mã bưu chính không hợp lệ';
                    }
                }
                break;
        }

        setValidationErrors(prev => ({
            ...prev,
            [field]: errorMessage
        }));
    };

    const handleEditClick = () => {
        setEditedSupplier({ ...supplier });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const validateFields = () => {
        const errors = {};

        // Validate email if not empty
        if (editedSupplier.email) {
            if (!editedSupplier.email.includes('@') || !editedSupplier.email.includes('.')) {
                errors.email = 'Email phải chứa @ và .';
            }
        }

        // Validate phone number if not empty
        if (editedSupplier.phoneNumber) {
            if (!/^\d{10}$/.test(editedSupplier.phoneNumber)) {
                errors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
            }
        }

        // Validate postal code if not empty
        if (editedSupplier.postalCode) {
            const validCode = postalCodes.some(pc => {
                const codes = pc.code.split('-');
                if (codes.length === 1) return editedSupplier.postalCode === codes[0];
                const [start, end] = codes;
                const valueNum = parseInt(editedSupplier.postalCode);
                const startNum = parseInt(start);
                const endNum = parseInt(end);
                return valueNum >= startNum && valueNum <= endNum;
            });
            if (!validCode) {
                errors.postalCode = 'Mã bưu chính không hợp lệ';
            }
        }

        return errors;
    };

    const handleSave = async () => {
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Vui lòng kiểm tra lại thông tin");
            return;
        }

        try {
            setLoading(true);
            await supplierApi.update(id, editedSupplier);
            setSupplier(editedSupplier);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
            setIsEditing(false);
            toast.success("Cập nhật thành công");
        } catch (error) {
            setError(error.response?.data?.error || error.message);
            toast.error(error.response?.data?.error || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSupplier = async () => {
            try {
                const data = await supplierApi.getById(id);
                setSupplier(data);
                if (isEditMode) {
                    setEditedSupplier(data);
                    // Store initial valid email
                    if (data.email?.includes('@') && data.email?.includes('.')) {
                        lastValidEmailRef.current = data.email;
                    }
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error || "Không thể tải thông tin nhà cung cấp";
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchSupplier();
    }, [id, isEditMode]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!supplier) {
        return <h2>Không tìm thấy nhà cung cấp</h2>;
    }

    return (
        <div className="page-container detail-supplier-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/supplier-list")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết nhà cung cấp</h2>
            </div>

            <div className="actions">
                {!isEditing && !isStaff ? (
                    <>
                        <button className="delete" onClick={() => setShowConfirmDialog(true)}>
                            <img src={deleteIcon} alt="Xóa" /> Xóa
                        </button>

                        <button className="edit" onClick={handleEditClick}>
                            <img src={editIcon} alt="Sửa" /> Sửa
                        </button>
                        <button className="print" onClick={() => {
                            const element = document.createElement('div');
                            element.style.position = 'absolute';
                            element.style.left = '-9999px';
                            document.body.appendChild(element);

                            const root = document.createElement('div');
                            element.appendChild(root);
                            import('react-dom/client').then((ReactDOM) => {
                                ReactDOM.createRoot(root).render(<SupplierTemplate supplier={supplier} />);

                                setTimeout(() => {
                                    const opt = {
                                        margin: 10,
                                        filename: `supplier-${supplier.ID}.pdf`,
                                        image: { type: 'jpeg', quality: 0.98 },
                                        html2canvas: { scale: 2, letterRendering: true },
                                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                    };

                                    html2pdf().from(root).set(opt).save().then(() => {
                                        document.body.removeChild(element);
                                    });
                                }, 1000);
                            });
                        }}>
                            <img src={printIcon} alt="Xuất" /> Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                    </>
                )}
            </div>

            <div className="detail-supplier-content">
                <div className="supplier-info">
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Tên nhà cung cấp</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="info-input"
                                    value={editedSupplier.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            ) : (
                                <div className="info-value">{supplier.name}</div>
                            )}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Mã nhà cung cấp</div>
                            <div className="info-value-id">#NCC-{supplier.ID}</div>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Email</div>
                            {isEditing ? (
                                <div className="input-container">
                                    <input
                                        type="email"
                                        className="info-input"
                                        value={editedSupplier.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                    {validationErrors.email && <div className="error-message">{validationErrors.email}</div>}
                                </div>
                            ) : (
                                <div className="info-value">{supplier.email}</div>
                            )}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Số điện thoại</div>
                            {isEditing ? (
                                <div className="input-container">
                                    <input
                                        type="text"
                                        className="info-input"
                                        value={editedSupplier.phoneNumber}
                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    />
                                    {validationErrors.phoneNumber && <div className="error-message">{validationErrors.phoneNumber}</div>}
                                </div>
                            ) : (
                                <div className="info-value">{supplier.phoneNumber}</div>
                            )}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Quốc gia</div>
                            {isEditing ? (
                                <div className="custom-select" ref={selectRef}>
                                    <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                                        <div className="selected-content">
                                            {editedSupplier.country ? (
                                                <>
                                                    <img
                                                        src={countries.find(c => c.name === editedSupplier.country)?.flag}
                                                        alt={editedSupplier.country}
                                                        className="country-flag"
                                                    />
                                                    <span>{editedSupplier.country}</span>
                                                </>
                                            ) : (
                                                <span className="placeholder">Chọn quốc gia</span>
                                            )}
                                        </div>
                                        <img
                                            src={downIcon}
                                            alt="down"
                                            className={`down-icon ${isOpen ? 'rotate' : ''}`}
                                        />
                                    </div>
                                    {isOpen && (
                                        <div className="options-list">
                                            {countries.map((country) => (
                                                <div
                                                    key={country.code}
                                                    className="option"
                                                    onClick={() => {
                                                        handleInputChange('country', country.name);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <img
                                                        src={country.flag}
                                                        alt={country.name}
                                                        className="country-flag"
                                                    />
                                                    <span>{country.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="info-value">
                                    {supplier.country && (
                                        <>
                                            <img
                                                src={countries.find(c => c.name === supplier.country)?.flag}
                                                alt={supplier.country}
                                                className="country-flag"
                                            />
                                            <span>{supplier.country}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Mã số thuế</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="info-input"
                                    value={editedSupplier.taxId || ''}
                                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                                />
                            ) : (
                                <div className="info-value">{supplier.taxId}</div>
                            )}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Mã bưu chính</div>
                            {isEditing ? (
                                <div className="input-container">
                                    <input
                                        type="text"
                                        className="info-input"
                                        value={editedSupplier.postalCode || ''}
                                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                    />
                                    {validationErrors.postalCode && <div className="error-message">{validationErrors.postalCode}</div>}
                                </div>
                            ) : (
                                <div className="info-value">{supplier.postalCode}</div>
                            )}
                        </div>
                        <div className="info-item">
                            <div className="info-label">Địa chỉ</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="info-input"
                                    value={editedSupplier.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                />
                            ) : (
                                <div className="info-value">{supplier.address}</div>
                            )}
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Ghi chú</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="info-input"
                                    value={editedSupplier.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                />
                            ) : (
                                <div className="info-value">{supplier.notes}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmPopup
                isOpen={showConfirmDialog}
                message="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                onConfirm={async () => {
                    try {
                        await supplierApi.delete(id);
                        toast.success("Xóa nhà cung cấp thành công!");
                        navigate("/supplier-list");
                    } catch (err) {
                        toast.error(err.response?.data?.error || "Không thể xóa nhà cung cấp");
                    }
                    setShowConfirmDialog(false);
                }}
                onCancel={() => setShowConfirmDialog(false)}
            />
            <div className="supplier-products">
                <h3>Sản phẩm của nhà cung cấp</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn vị</th>
                                <th>Số lượng</th>
                                <th>Giá nhập</th>
                                <th>Giá bán</th>
                                <th>Xuất xứ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplier.Products && supplier.Products.map(product => (
                                <tr key={product.ID}>
                                    <td>#{product.ID}</td>
                                    <td>{product.name}</td>
                                    <td>{product.unit}</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.inPrice.toLocaleString('vi-VN')} đ</td>
                                    <td>{product.outPrice.toLocaleString('vi-VN')} đ</td>
                                    <td>{product.origin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailSupplier;
