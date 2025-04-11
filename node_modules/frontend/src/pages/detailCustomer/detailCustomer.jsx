import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailCustomer.scss";
import { useParams, useNavigate } from "react-router-dom";
import { customers } from "../../mock/mock";

const DetailCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const customer = customers.find((inv) => inv.id.toString() === id);

    if (!customer) {
        return <h2>Không tìm thấy khách hàng</h2>;
    }

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
                        <div className="info-value">#KH-{customer.id}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{customer.phone}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{customer.mail}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Địa chỉ</div>
                        <div className="info-value">{customer.address}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Mã số thuế</div>
                        <div className="info-value">{customer.taxId}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Điểm thưởng</div>
                        <div className="info-value">{customer.points}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Số lượng đơn hàng</div>
                        <div className="info-value">{customer.invoices.length}</div>
                    </div>
                </div>
                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        <div className="info-value">{customer.note}</div>
                    </div>
                </div>
            </div>

            <div className="purchase-history">
                <h3>Lịch sử mua hàng</h3>
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
                        {customer.invoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td>#{invoice.id}</td>
                                <td>{invoice.date}</td>
                                <td>{invoice.total} VND</td>
                                <td>{invoice.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DetailCustomer;
