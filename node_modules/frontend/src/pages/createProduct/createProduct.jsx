import { useState } from "react";
import { useNavigate } from "react-router-dom";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import "./createProduct.scss";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [productImage, setProductImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    price: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    manufacturer: "",
    origin: "",
    category: "",
    inventory: "",
    shortDescription: "",
    details: ""
  });

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      dimensions: { ...formData.dimensions, [name]: value },
    });
  };

  const resetForm = () => {
    setProductImage(null);
    setFormData({
      name: "",
      unit: "",
      price: "",
      weight: "",
      dimensions: { length: "", width: "", height: "" },
      manufacturer: "",
      origin: "",
      category: "",
      stock: "",
      shortDescription: "",
      details: ""
    });
  };

  return (
    <div className="create-product-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/categories")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Thêm sản phẩm</h2>
      </div>
      <div className="actions">
        <button className="delete" onClick={resetForm}>
          <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
        </button>
        <button className="create">
          <img src={createIcon} alt="Tạo" /> Tạo hoá đơn
        </button>
      </div>
      <div className="product-form">
        <div className="image-upload-section">
          <div className="image-container">
            {productImage ? (
              <img src={productImage} alt="Product preview" />
            ) : (
              <div className="placeholder">
                <span>Hình ảnh</span>
              </div>
            )}
          </div>
          <label htmlFor="image-upload" className="upload-label">
            + Thêm hình ảnh
          </label>
          <input type="file" id="image-upload" accept="image/*" onChange={handleImageUpload} hidden />
        </div>

        <div className="form-fields">
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Đơn vị tính</label>
            <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Đơn giá</label>
            <input type="text" name="price" value={formData.price} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Khối lượng</label>
            <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Kích thước</label>
            <input type="text" className="width" placeholder="Rộng(cm)" value={formData.dimensions.width} onChange={handleDimensionChange} />
            <input type="text" className="length" placeholder="Dài(cm)" value={formData.dimensions.length} onChange={handleDimensionChange} />
            <input type="text" className="height" placeholder="Cao(cm)" value={formData.dimensions.height} onChange={handleDimensionChange} />
          </div>

          <div className="form-group">
            <label>Nhà sản xuất</label>
            <input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Xuất sứ</label>
            <input type="text" name="origin" value={formData.origin} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Thuộc loại</label>
            <input type="text" name="category" value={formData.category} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} />
          </div>

          <div className="form-group">
            <label>Thông tin chi tiết</label>
            <input type="text" name="details" value={formData.details} onChange={handleInputChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
