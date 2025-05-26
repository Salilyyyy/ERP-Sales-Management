import React from 'react';
import "./stockinTemplate.scss";

const StockInTemplate = ({ stockIn }) => {
    const totalAmount = (stockIn.DetailStockins || []).reduce((sum, detail) => 
        sum + (detail.quantity * detail.unitPrice), 0
    );

    return (
        <div className="stockin-template">
            <h2>Phiếu nhập kho</h2>
            <div className="info-section">
                <div className="basic-info">
                    <p><strong>Mã nhập kho:</strong> #{stockIn.ID}</p>
                    <p><strong>Ngày nhập:</strong> {new Date(stockIn.stockinDate).toLocaleDateString()}</p>
                    <p><strong>Người sửa:</strong> {stockIn.updatedBy || 'N/A'}</p>
                    <p><strong>Ngày sửa:</strong> {new Date(stockIn.updatedAt).toLocaleString()}</p>
                </div>
                
                <div className="supplier-info">
                    <p><strong>Nhà cung cấp:</strong> {stockIn.supplier?.name || 'N/A'}</p>
                    <p><strong>Địa chỉ:</strong> {stockIn.supplier?.address || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {stockIn.supplier?.phoneNumber || 'N/A'}</p>
                    <p><strong>Email:</strong> {stockIn.supplier?.email || 'N/A'}</p>
                </div>
            </div>

            <table className="products-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên sản phẩm</th>
                        <th>Loại</th>
                        <th>Số lượng</th>
                        <th>Giá nhập</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {(stockIn.DetailStockins || []).map((detail, index) => {
                        const total = detail.quantity * detail.unitPrice;
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{detail.Products?.name || 'N/A'}</td>
                                <td>{detail.Products?.productCategory?.name || 'N/A'}</td>
                                <td>{detail.quantity}</td>
                                <td>{detail.unitPrice.toLocaleString()} VNĐ</td>
                                <td>{total.toLocaleString()} VNĐ</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="5" className="total-label">Tổng tiền:</td>
                        <td className="total-amount">{totalAmount.toLocaleString()} VNĐ</td>
                    </tr>
                </tfoot>
            </table>

            <div className="signatures">
                <div className="signature-block">
                    <p>Người giao hàng</p>
                    <p>(Ký, họ tên)</p>
                </div>
                <div className="signature-block">
                    <p>Người nhận hàng</p>
                    <p>(Ký, họ tên)</p>
                </div>
            </div>
        </div>
    );
};

export default StockInTemplate;
