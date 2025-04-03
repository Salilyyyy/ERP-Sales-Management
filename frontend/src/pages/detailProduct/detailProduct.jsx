import backIcon from "../../assets/img/back-icon.svg"
import deleteIcon from "../../assets/img/delete-icon.svg"
import editIcon from "../../assets/img/white-edit.svg"
import printIcon from "../../assets/img/print-icon.svg"
import "./detailProduct.scss"
import { useParams, useNavigate } from "react-router-dom";
import { products } from "../../mock/mock"

const DetailProduct = () => {
  const { id } = useParams();  
  const navigate = useNavigate(); 
  const product = products.find((inv) => inv.id.toString() === id); 

  if (!product) {
    return <h2>Không tìm thấy sản phẩm</h2>;
  }


return (
  <div className="detail-product-container">
    <div className="header">
      <div className="back" onClick={() => navigate("/product")}>
        <img src={backIcon} alt="Quay lại" />
      </div>
      <h2>Chi tiết sản phẩm</h2>
    </div>
    <div className="actions">
      <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
      <button className="edit"><img src={editIcon} alt="Sửa" /> Sửa </button>
      <button className="print"><img src={printIcon} alt="In" /> In </button>
    </div>

    <div className="detail-product-content">
      <div className="product-image">
        <img src={product.image} alt={product.name} className="img-product"/>
      </div>

      <div className="product-info">
        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Tên sản phẩm</div>
            <div className="info-value">{product.name}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Mã sản phẩm</div>
            <div className="info-value">{product.id}</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Đơn vị tính</div>
            <div className="info-value">{product.unit}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Đơn giá</div>
            <div className="info-value">{product.price}</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Khối lượng {"(g)"}</div>
            <div className="info-value">{product.weight}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Kích thước</div>
            <div className="info-value">{product.width} cm x {product.height} cm x {product.length} cm</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Nhà sản xuất</div>
            <div className="info-value">{product.supplier}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Xuất sứ</div>
            <div className="info-value">{product.madein}</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-item">
            <div className="info-label">Thuộc loại</div>
            <div className="info-value">{product.category}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Tồn kho</div>
            <div className="info-value">{product.inventory}</div>
          </div>
        </div>

        <div className="info-row full-width">
          <div className="info-item">
            <div className="info-label">Ghi chú</div>
            <div className="info-value">{product.instruction}</div>
          </div>
        </div>

        <div className="info-row full-width">
          <div className="info-item">
            <div className="info-label">Thông tin chi tiết</div>
            <div className="info-value">{product.decription}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}

export default DetailProduct

