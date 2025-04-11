import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailPromotion.scss";
import { useParams, useNavigate } from "react-router-dom";
import { promotions } from "../../mock/mock";

const DetailPromotion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const promotion = promotions.find((item) => item.id.toString() === id);

    if (!promotion) {
        return <h2>Không tìm thấy khuyến mãi</h2>;
    }

    return (
        <div className="promotion-detail-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/promotion")}> 
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết khuyến mãi</h2>
            </div>

            <div className="actions">
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa </button>
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="promotion-detail-content">
                <div className="info-item">
                    <div className="info-label">Tên khuyến mãi</div>
                    <div className="info-value">{promotion.name}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ngày bắt đầu</div>
                    <div className="info-value">{promotion.startDate}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ngày kết thúc</div>
                    <div className="info-value">{promotion.endDate}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Giá trị</div>
                    <div className="info-value">{promotion.discount}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Giá trị tối thiểu</div>
                    <div className="info-value">{promotion.minPurchase}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Số lượng</div>
                    <div className="info-value">{promotion.stock}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Sản phẩm áp dụng</div>
                    <div className="info-value">{promotion.product}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Trạng thái</div>
                    <div className="info-value">{promotion.status}</div>
                </div>
            </div>
        </div>
    );
};

export default DetailPromotion;