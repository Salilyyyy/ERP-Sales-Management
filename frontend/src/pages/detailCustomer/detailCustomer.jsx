import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import CustomerRepository from "../../api/apiCustomer";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import CustomerTemplate from "../../components/customerTemplate/customerTemplate";
import { generateCustomerPDF } from "../../utils/pdfUtils";
import { toast } from 'react-toastify';
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import "./detailCustomer.scss";

const DetailCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [editedCustomer, setEditedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        phoneNumber: '',
        email: ''
    });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [isEditing, setIsEditing] = useState(isEditMode);

    const handleEditClick = () => {
        setEditedCustomer({ ...customer });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await CustomerRepository.update(id, editedCustomer);
            setCustomer(editedCustomer);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
            setIsEditing(false);
            toast.success('Cập nhật thông tin khách hàng thành công');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedCustomer(null);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
    };

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(phone) ? '' : 'Số điện thoại phải có đúng 10 chữ số';
    };

    const validateEmail = (email) => {
        return email.includes('@') ? '' : 'Email phải chứa ký tự @';
    };

    const handleInputChange = (field, value) => {
        setEditedCustomer(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'phoneNumber') {
            setValidationErrors(prev => ({
                ...prev,
                phoneNumber: validatePhoneNumber(value)
            }));
        } else if (field === 'email') {
            setValidationErrors(prev => ({
                ...prev,
                email: validateEmail(value)
            }));
        }
    };

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await CustomerRepository.getById(id);
                setCustomer(response);
                if (isEditMode) {
                    setEditedCustomer(response);
                }
            } catch (err) {
                setError("Không tìm thấy khách hàng hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id, isEditMode]);

    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <h2>{error}</h2>;
    if (!customer) return <p>Không tìm thấy thông tin khách hàng.</p>;

    return (
        <div className="detail-customer-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/customer")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết khách hàng</h2>
            </div>

            <div className="actions">
                {isEditing ? (
                    <>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                    </>
                ) : (
                    <>
                        <button className="delete" onClick={() => setShowDeleteConfirm(true)}>
                            <img src={deleteIcon} alt="Xóa" /> Xóa
                        </button>
                        <button className="edit" onClick={handleEditClick}>
                            <img src={editIcon} alt="Sửa" /> Sửa
                        </button>
                        <button className="print" onClick={async () => {
                            try {
                                const pdf = await generateCustomerPDF(customer);
                                pdf.save(`customer_${customer.ID}_${new Date().toISOString().split('T')[0]}.pdf`);
                                toast.success('Xuất PDF thành công');
                            } catch (error) {
                                toast.error("Xuất PDF thất bại: " + error.message);
                            }
                        }}>
                            <img src={printIcon} alt="Xuất" /> Xuất
                        </button>
                    </>
                )}
            </div>

            <div className="detail-customer-content">
                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Tên khách hàng</div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedCustomer.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="info-input"
                            />
                        ) : (
                            <div className="info-value">{customer.name}</div>
                        )}
                    </div>
                    <div className="info-item">
                        <div className="info-label">Mã khách hàng</div>
                        <div className="info-value">#KH-{customer.ID}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="valua">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedCustomer.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    className={`info-input ${validationErrors.phoneNumber ? 'error' : ''}`}
                                />
                            ) : (
                                <div className="info-value">{customer.phoneNumber}</div>
                            )}
                            {isEditing && validationErrors.phoneNumber && (
                                <div className="validation-error">{validationErrors.phoneNumber}</div>
                            )}
                        </div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="valua">
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={editedCustomer.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`info-input ${validationErrors.email ? 'error' : ''}`}
                                />
                            ) : (
                                <div className="info-value">{customer.email}</div>
                            )}
                            {isEditing && validationErrors.email && (
                                <div className="validation-error">{validationErrors.email}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Địa chỉ</div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedCustomer.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                className="info-input-full"
                            />
                        ) : (
                            <div className="info-value">{customer.address}</div>
                        )}
                    </div>
                    {customer.organization && (
                        <div className="info-item">
                            <div className="info-label">Tên tổ chức</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedCustomer.organization}
                                    onChange={(e) => handleInputChange('organization', e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                <div className="info-value">{customer.organization}</div>
                            )}
                        </div>
                    )}
                </div>

                {customer.organization && (
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Mã số thuế</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedCustomer.tax}
                                    onChange={(e) => handleInputChange('tax', e.target.value)}
                                    className="info-input"
                                />
                            ) : (
                                <div className="info-value">{customer.tax}</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Điểm thưởng</div>
                        <div className="info-value">{customer.bonusPoints}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Số lượng đơn hàng</div>
                        <div className="info-value">{customer.Invoices?.length || 0}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedCustomer.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="info-input-full"
                            />
                        ) : (
                            <div className="info-value">{customer.notes}</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="purchase-history">
                <h3>Lịch sử mua hàng</h3>
                {customer.Invoices?.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Ngày mua</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customer.Invoices.map((invoice) => (
                                <tr key={invoice.ID} onClick={() => navigate(`/invoice/${invoice.ID}`)}>
                                    <td>#{invoice.ID}</td>
                                    <td>{new Date(invoice.exportTime).toLocaleDateString()}</td>
                                    <td>{invoice.tax} VND</td>
                                    <td>
                                        {invoice.isPaid
                                            ? invoice.isDelivery
                                                ? "Đã giao"
                                                : "Đã thanh toán"
                                            : "Chưa thanh toán"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Không có đơn hàng nào.</p>
                )}
            </div>

            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message="Bạn có chắc muốn xóa khách hàng này không?"
                onConfirm={async () => {
                    try {
                        await CustomerRepository.deleteCustomer(id);
                        navigate('/customer');
                        toast.success("Xóa khách hàng thành công!");
                    } catch (err) {
                        toast.error('Có lỗi xảy ra khi xóa khách hàng');
                        console.error(err);
                    }
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default DetailCustomer;
