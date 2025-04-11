import backIcon from "../../assets/img/back-icon.svg"
import createIcon from "../../assets/img/create-icon.svg"
import deleteIcon from "../../assets/img/delete-icon.svg"
import "./createCategory.scss"
import { useNavigate } from "react-router-dom";

const CreateCategory = () => {
  const navigate = useNavigate();

  const resetForm = () => {
    document.querySelectorAll('.form-group input').forEach(input => input.value = '');
  };

  return (
    <div className="create-category-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/categories")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Thêm loại sản phẩm</h2>
      </div>
      <div className="actions">
        <button className="delete" onClick={resetForm}>
          <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
        </button>
        <button className="create"><img src={createIcon} alt="Tạo" /> Thêm loại </button>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="category">Loại sản phẩm</label>
          <input type="text" id="category" />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Đơn vị tính</label>
          <input type="text" id="unit" />
        </div>

        <div className="form-group">
          <label htmlFor="status">Trạng thái</label>
          <input type="text" id="status" />
        </div>

        <div className="form-group">
          <label htmlFor="promotion">Khuyến mãi</label>
          <input type="text" id="promotion" />
        </div>

        <div className="form-group">
          <label htmlFor="tax">Thuế</label>
          <input type="text" id="tax" />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <input type="text" id="description" className="long-input" />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Ghi chú</label>
          <input type="text" id="notes" className="long-input" />
        </div>
      </div>
    </div>
  )
}

export default CreateCategory

