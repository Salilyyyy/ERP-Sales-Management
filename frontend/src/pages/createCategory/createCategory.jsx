import backIcon from "../../assets/img/back-icon.svg"
import createIcon from "../../assets/img/create-icon.svg"
import deleteIcon from "../../assets/img/delete-icon.svg"
import "./createCategory.scss"
import { useNavigate } from "react-router-dom";
import ProductCategoryRepository from "../../api/apiProductCategory";
import { useState } from "react";
import { toast } from 'react-toastify';

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

  const [errors, setErrors] = useState({
    name: '',
    unit: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      unit: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập loại sản phẩm';
      isValid = false;
    }

    if (!formData.information.unit) {
      newErrors.unit = 'Vui lòng chọn đơn vị tính';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() && !formData.information.unit &&
      !formData.information.description.trim() && !formData.information.notes.trim()) {
      toast.error('Vui lòng điền thông tin');
      return;
    }

    if (!validateForm()) {
      return;
    }

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
          <div className="input-text">
            <input
              type="text"
              id="category"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="unit">Đơn vị tính</label>
          <div className="select-box">
            <select
              id="unit"
              value={formData.information.unit}
              onChange={handleChange}
              className={errors.unit ? 'error' : ''}
            >
              <option value="">Chọn đơn vị tính</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.unit && <div className="error-message">{errors.unit}</div>}
          </div>
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
