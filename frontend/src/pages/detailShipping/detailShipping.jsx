import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./detailShipping.scss";
import { shipping } from "../../mock/mock";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";

const DetailShipping = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const order = shipping.find(item => item.id === id);
    if (!order) {
        return <div className="order-detail-container">Không tìm thấy đơn hàng</div>;
    }

    return (
        <div className="order-detail-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/shipping-list")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết vận đơn</h2>
            </div>

            <div className="actions">
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa </button>
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="content">
                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Mã vận đơn</div>
                        <div className="info-value-id">#{order.id}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Mã hóa đơn</div>
                        <div className="info-value">{order.invoiceCode}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Bưu cục gửi</div>
                        <div className="info-value">{order.senderPost}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Tên người nhận</div>
                        <div className="info-value">{order.receiverName}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{order.phone}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Địa chỉ nhận</div>
                        <div className="info-value">{order.address}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Tỉnh/Thành</div>
                        <div className="info-value">{order.province}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Quận/Huyện</div>
                        <div className="info-value">{order.district}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Xã/Phường</div>
                        <div className="info-value">{order.ward}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Thời gian gửi</div>
                        <div className="info-value">{order.sendTime}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Thời gian nhận dự kiến</div>
                        <div className="info-value">{order.estimatedDelivery}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Kích thước</div>
                        <div className="info-value">{order.size}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Khối lượng</div>
                        <div className="info-value">{order.weight}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Phí vận chuyển</div>
                        <div className="info-value">{order.shippingFee}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Phí thu hộ</div>
                        <div className="info-value">{order.codFee}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Người thanh toán</div>
                        <div className="info-value">{order.payer}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        <div className="info-value">{order.note}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default DetailShipping;
