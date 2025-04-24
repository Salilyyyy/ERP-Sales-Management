import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomerRepository from "../../api/apiCustomer"; 
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailCustomer.scss";

const DetailCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await CustomerRepository.getById(id);
                setCustomer(response);
            } catch (err) {
                console.error("Lỗi khi lấy dữ liệu khách hàng:", err);
                setError("Không tìm thấy khách hàng hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

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
                <button className="delete">
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="edit">
                    <img src={editIcon} alt="Sửa" /> Sửa
                </button>
                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
            </div>

            <div className="detail-customer-content">
                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Tên khách hàng</div>
                        <div className="info-value">{customer.name}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Mã khách hàng</div>
                        <div className="info-value">#KH-{customer.ID}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{customer.phoneNumber}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{customer.email}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Địa chỉ</div>
                        <div className="info-value">{customer.address}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Mã số thuế</div>
                        <div className="info-value">{customer.tax}</div>
                    </div>
                </div>

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
                        <div className="info-value">{customer.notes}</div>
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
        </div>
    );
};

export default DetailCustomer;
