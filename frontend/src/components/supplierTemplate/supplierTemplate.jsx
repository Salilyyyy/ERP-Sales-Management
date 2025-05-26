import React from 'react';
import './supplierTemplate.scss';

const SupplierTemplate = ({ supplier }) => {
    return (
        <div className="supplier-template">
            <div className="supplier-header">
                <h1>THÔNG TIN NHÀ CUNG CẤP</h1>
            </div>
            <div className="supplier-info">
                <div className="info-group">
                    <div className="info-item">
                        <label>Mã số:</label>
                        <span>{supplier.ID}</span>
                    </div>
                    <div className="info-item">
                        <label>Tên nhà cung cấp:</label>
                        <span>{supplier.name}</span>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Địa chỉ:</label>
                        <span>{supplier.address}</span>
                    </div>
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{supplier.email}</span>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Số điện thoại:</label>
                        <span>{supplier.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                        <label>Mã bưu điện:</label>
                        <span>{supplier.postalCode}</span>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Người đại diện:</label>
                        <span>{supplier.representative}</span>
                    </div>
                    <div className="info-item">
                        <label>SĐT người đại diện:</label>
                        <span>{supplier.phoneNumberRep}</span>
                    </div>
                </div>

                <div className="info-group">
                    <div className="info-item">
                        <label>Mã số thuế:</label>
                        <span>{supplier.taxId || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>Quốc gia:</label>
                        <span>{supplier.country || 'N/A'}</span>
                    </div>
                </div>

                {supplier.notes && (
                    <div className="info-group">
                        <div className="info-item full-width">
                            <label>Ghi chú:</label>
                            <span>{supplier.notes}</span>
                        </div>
                    </div>
                )}
            </div>

            {supplier.Products && supplier.Products.length > 0 && (
                <div className="supplier-products">
                    <h2>Sản phẩm của nhà cung cấp</h2>
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
                                {supplier.Products.map(product => (
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
            )}
        </div>
    );
};

export default SupplierTemplate;
