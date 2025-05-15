import backIcon from "../../assets/img/back-icon.svg"
import createIcon from "../../assets/img/create-icon.svg"
import deleteIcon from "../../assets/img/delete-icon.svg"
import "./createCategory.scss"
import { useNavigate } from "react-router-dom";
import ProductCategoryRepository from "../../api/apiProductCategory";
import { useState } from "react";

const units = [
  "Cái",
  "Chiếc", 
  "Bộ"
];

const CreateCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    information: {
      unit: '',
      status: '',
      promotion: '',
      tax: '',
      description: '',
      notes: ''
    }
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'category') {
      setFormData(prev => ({
        ...prev,
        name: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        information: {
          ...prev.information,
          [id]: value
        }
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        unit: formData.information.unit,
        status: formData.information.status,
        promotion: formData.information.promotion,
        tax: formData.information.tax,
        description: formData.information.description,
        notes: formData.information.notes
      };
      await ProductCategoryRepository.create(payload);
      navigate("/categories");
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      information: {
        unit: '',
        status: '',
        promotion: '',
        tax: '',
        description: '',
        notes: ''
      }
    });
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
        <button className="create" onClick={handleSubmit}><img src={createIcon} alt="Tạo" /> Thêm loại </button>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="category">Loại sản phẩm</label>
          <input
            type="text"
            id="category"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="unit">Đơn vị tính</label>
          <select
            id="unit"
            value={formData.information.unit}
            onChange={handleChange}
          >
            <option value="">Chọn đơn vị tính</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <input
            type="text"
            id="description"
            className="long-input"
            value={formData.information.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Ghi chú</label>
          <input
            type="text"
            id="notes"
            className="long-input"
            value={formData.information.notes}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateCategory
