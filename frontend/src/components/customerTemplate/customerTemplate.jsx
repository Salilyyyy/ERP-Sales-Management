import React from "react";
import printIcon from "../../assets/img/print-icon.svg";
import "./customerTemplate.scss";

const CustomerTemplate = React.forwardRef(({ customer, onEdit, onDelete, isPdfMode, onAfterRender, onInvoiceClick }, ref) => {
    React.useEffect(() => {
        if (isPdfMode && onAfterRender) {
            onAfterRender();
        }
    }, [isPdfMode, onAfterRender]);

    if (!customer) return <p>Không có thông tin khách hàng.</p>;

    return (
        <div className="customer-template" ref={ref}>
            {!isPdfMode && (
                <div className="template-actions">
                    <button className="print-button">
                        <img src={printIcon} alt="In" />
                        Xuất PDF
                    </button>
                </div>
            )}
            <div className="customer-info">
                <div className="info-section">
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
                        <div className="info-item full-width">
                            <div className="info-label">Ghi chú</div>
                            <div className="info-value">{customer.notes}</div>
                        </div>
                    </div>
                </div>

                <div className="purchase-history-section">
                    <h3>Lịch sử mua hàng</h3>
                    {customer.Invoices?.length > 0 ? (
                        <div className="table-container">
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
                                        <tr
                                            key={invoice.ID}
                                            onClick={() => isPdfMode ? null : onInvoiceClick?.(invoice.ID)}
                                            className={`invoice-row ${isPdfMode ? '' : 'clickable'}`}
                                        >
                                            <td>#{invoice.ID}</td>
                                            <td>{new Date(invoice.exportTime).toLocaleDateString()}</td>
                                            <td>{invoice.tax.toLocaleString()} VND</td>
                                            <td>
                                                <span className={`status ${invoice.isPaid ? (invoice.isDelivery ? 'delivered' : 'paid') : 'unpaid'}`}>
                                                    {invoice.isPaid
                                                        ? invoice.isDelivery
                                                            ? "Đã giao"
                                                            : "Đã thanh toán"
                                                        : "Chưa thanh toán"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-invoices">Không có đơn hàng nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
});

export default CustomerTemplate;
