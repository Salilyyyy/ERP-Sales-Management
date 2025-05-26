import React from 'react';
import './shippingTemplate.scss';
import { format } from 'date-fns';

const ShippingTemplate = ({ shipping, items }) => {
    return (
        <div className="shipping-template">
            <h2>Vận Đơn</h2>

            <div className="shipping-header">
                <div>
                    <div className="shipping-id">#{shipping?.id || 'N/A'}</div>
                    <div className="shipping-date">
                        Ngày: {shipping?.date ? format(new Date(shipping.date), 'dd/MM/yyyy') : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="address-section">
                <div className="address-block">
                    <h3>Từ</h3>
                    <p><strong>Tên:</strong> {shipping?.sender?.name || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {shipping?.sender?.phone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {shipping?.sender?.address || 'N/A'}</p>
                    <p><strong>Thành phố:</strong> {shipping?.sender?.city || 'N/A'}</p>
                </div>

                <div className="address-block">
                    <h3>Đến</h3>
                    <p><strong>Tên:</strong> {shipping?.receiver?.name || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {shipping?.receiver?.phone || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {shipping?.receiver?.address || 'N/A'}</p>
                    <p><strong>Thành phố:</strong> {shipping?.receiver?.city || 'N/A'}</p>
                </div>
            </div>

            <div className="shipping-details">
                <h3>Chi Tiết Vận Chuyển</h3>
                <div className="details-grid">
                    <div className="detail-item">
                        <p>
                            <strong>Phương thức vận chuyển</strong>
                            <span>{shipping?.method || 'N/A'}</span>
                        </p>
                    </div>
                    <div className="detail-item">
                        <p>
                            <strong>Dự kiến giao hàng</strong>
                            <span>
                                {shipping?.estimatedDelivery 
                                    ? format(new Date(shipping.estimatedDelivery), 'dd/MM/yyyy')
                                    : 'N/A'}
                            </span>
                        </p>
                    </div>
                    <div className="detail-item">
                        <p>
                            <strong>Trạng thái</strong>
                            <span>{shipping?.status || 'N/A'}</span>
                        </p>
                    </div>
                    <div className="detail-item">
                        <p>
                            <strong>Mã vận đơn</strong>
                            <span>{shipping?.trackingNumber || 'N/A'}</span>
                        </p>
                    </div>
                </div>
            </div>


            <div className="shipping-summary">
                <div className="summary-row">
                    <span className="label">Phí vận chuyển</span>
                    <span className="value">{shipping?.shippingCost?.toFixed(2) || '0.00'}đ</span>
                </div>
                <div className="summary-row">
                    <span className="label">Phí bảo hiểm</span>
                    <span className="value">{shipping?.insurance?.toFixed(2) || '0.00'}đ</span>
                </div>
                <div className="summary-row">
                    <span className="label">Phí phụ thu</span>
                    <span className="value">{shipping?.additionalFees?.toFixed(2) || '0.00'}đ</span>
                </div>
                <div className="summary-row">
                    <span className="label">Tổng cộng</span>
                    <span className="value total">
                        {(
                            (shipping?.shippingCost || 0) +
                            (shipping?.insurance || 0) +
                            (shipping?.additionalFees || 0)
                        ).toFixed(2)}đ
                    </span>
                </div>
            </div>

            <div className="signatures">
                <div className="signature-block">
                    <p className="title">Chữ ký người gửi</p>
                    <div className="signature-line"></div>
                    <p className="date">{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
                <div className="signature-block">
                    <p className="title">Chữ ký người vận chuyển</p>
                    <div className="signature-line"></div>
                    <p className="date">{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
                <div className="signature-block">
                    <p className="title">Chữ ký người nhận</p>
                    <div className="signature-line"></div>
                    <p className="date">{format(new Date(), 'dd/MM/yyyy')}</p>
                </div>
            </div>
        </div>
    );
};

export default ShippingTemplate;
