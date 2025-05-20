import React, { useState } from 'react';
import './productTemplate.scss';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error in ProductTemplate:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <div className="error-message">Không thể hiển thị thông tin sản phẩm.</div>;
        }

        return this.props.children;
    }
}

const ProductTemplate = ({ product }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    if (!product) {
        return <div>Không có thông tin sản phẩm</div>;
    }

    return (
        <ErrorBoundary>
            <div className="product-template">
                <div className="header">
                    <div className="company-info">
                        <h1>Hệ Thống ERP</h1>
                        <p>Thông Tin Sản Phẩm</p>
                    </div>
                </div>

                <div className="content">
                    {product.image && (
                        <div className="product-photo">
                            <img
                                src={product.image.startsWith('http')
                                    ? product.image
                                    : `https://res.cloudinary.com/dlrm4ccbs/image/upload/${product.image}`}
                                alt={product.name}
                                className={`photo ${imgLoaded ? 'loaded' : ''}`}
                                crossOrigin="anonymous"
                                onLoad={() => setImgLoaded(true)}
                                onError={(e) => {
                                    console.error("Error loading image:", e);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    <div className="product-details">
                        <h2>{product.name}</h2>
                        <div className="info-row">
                            <span className="label">Mã sản phẩm:</span>
                            <span className="value">{product.ID}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Loại sản phẩm:</span>
                            <span className="value">{product.productCategory?.name || 'Không xác định'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Nhà cung cấp:</span>
                            <span className="value">{product.supplier?.name || 'Không xác định'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Đơn vị tính:</span>
                            <span className="value">{product.unit || 'Không xác định'}</span>
                        </div>
                    </div>

                    <div className="pricing-info">
                        <h3>Thông Tin Giá</h3>
                        <div className="info-row">
                            <span className="label">Giá nhập:</span>
                            <span className="value">{product.inPrice?.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Giá bán:</span>
                            <span className="value">{product.outPrice?.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Số lượng tồn:</span>
                            <span className="value">{product.quantity || 0}</span>
                        </div>
                    </div>

                    <div className="specifications">
                        <h3>Thông Số Kỹ Thuật</h3>
                        <div className="info-row">
                            <span className="label">Kích thước:</span>
                            <span className="value">
                                {product.length && product.width && product.height
                                    ? `${product.length}cm x ${product.width}cm x ${product.height}cm`
                                    : 'Không xác định'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="label">Trọng lượng:</span>
                            <span className="value">{product.weight ? `${product.weight}g` : 'Không xác định'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Xuất xứ:</span>
                            <span className="value">{product.origin || 'Không xác định'}</span>
                        </div>
                    </div>

                    {(product.title || product.description) && (
                        <div className="additional-info">
                            <h3>Thông Tin Bổ Sung</h3>
                            {product.title && (
                                <div className="info-row">
                                    <span className="label">Ghi chú:</span>
                                    <span className="value">{product.title}</span>
                                </div>
                            )}
                            {product.description && (
                                <div className="info-row">
                                    <span className="label">Thông tin chi tiết:</span>
                                    <span className="value">{product.description}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="footer">
                    <p>Tài liệu này được tạo tự động từ Hệ Thống ERP</p>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ProductTemplate;
