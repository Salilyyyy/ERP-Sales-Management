import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailStockIn.scss";
import { useParams, useNavigate } from "react-router-dom";
import { stockIn } from "../../mock/mock"; // Đảm bảo mock có chứa dữ liệu nhập kho

const DetailStockIn = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const stockinData = stockIn.find((item) => item.id.toString() === id);

    if (!stockinData) {
        return <h2>Không tìm thấy đơn nhập kho</h2>;
    }

    return (
        <div className="detail-stockin-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/stock-history")}>
                    <img src={backIcon} alt="Quay lại" /> 
                </div>
                <h2>Chi tiết đơn nhập kho</h2>
            </div>
            <div className="actions">
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa </button>
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="detail-stockin-content">
                <div className="info-item">
                    <div className="info-label">Mã đơn nhập kho</div>
                    <div className="info-value">{stockinData.id}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ngày nhập kho</div>
                    <div className="info-value">{stockinData.date}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Nhà cung cấp</div>
                    <div className="info-value">{stockinData.supplier}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Trạng thái thanh toán</div>
                    <div className="info-value">{stockinData.paid ? "Đã thanh toán" : "Chưa thanh toán"}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Trạng thái giao hàng</div>
                    <div className="info-value">{stockinData.delivered ? "Đã nhận hàng" : "Chưa nhận hàng"}</div>
                </div>
                
                <div className="info-table">
                    <div className="list-product">Danh sách sản phẩm</div>
                    <div className="info-value">
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Tên sản phẩm</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Loại</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Số lượng</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Đơn giá</th>
                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockinData.products.map((product) => (
                                    <tr key={product.id}>
                                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.name}</td>
                                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{product.type}</td>
                                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{product.quantity}</td>
                                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{product.price.toLocaleString()} VNĐ</td>
                                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>{(product.quantity * product.price).toLocaleString()} VNĐ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4" style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontWeight: "bold" }}>Tổng cộng:</td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontWeight: "bold" }}>
                                        {stockinData.products.reduce((total, product) => total + (product.quantity * product.price), 0).toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailStockIn;
