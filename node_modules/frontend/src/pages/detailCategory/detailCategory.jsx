import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailCategory.scss";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../../mock/mock"; // Đảm bảo mock có chứa dữ liệu loại sản phẩm

const DetailCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const category = categories.find((cat) => cat.id.toString() === id); // Sửa từ inv thành cat

    if (!category) {
        return <h2>Không tìm thấy loại sản phẩm</h2>;
    }

    return (
        <div className="detail-category-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/categories")}>
                    <img src={backIcon} alt="Quay lại" /> 
                </div>
                <h2>Chi tiết loại sản phẩm</h2>
            </div>
            <div className="actions">
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa </button>
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="detail-category-content">
                    <div className="info-item">
                        <div className="info-label">Loại sản phẩm</div>
                        <div className="info-value">{category.name}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Đơn vị tính</div>
                        <div className="info-value">{category.unit}</div>
                    </div>
                <div className="info-item">
                    <div className="info-label">Trạng thái</div>
                    <div className="info-value">{category.status}</div>
                </div>


                <div className="info-item">
                    <div className="info-label">Khuyến mãi</div>
                    <div className="info-value">5%</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Thuế</div>
                    <div className="info-value">10%</div>
                </div>

                <div className="info-item">
                    <div className="info-label">Mô tả</div>
                    <div className="info-value">{category.decription}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ghi chú</div>
                    <div className="info-value">{category.notes}</div>
                </div>

            </div>
        </div>
    );
}

export default DetailCategory;
