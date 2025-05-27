import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiProduct from "../../api/apiProduct";
import apiProductCategory from "../../api/apiProductCategory";
import apiSupplier from "../../api/apiSupplier";
import apiCountry from "../../api/apiCountry";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import { compressImage, generateSHA1 } from "../../utils/imageUtils";

import "./createProduct.scss";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [productImage, setProductImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const units = ["Cái", "Hộp", "Thùng", "Kg", "Gói"];

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesData, suppliersData, countriesData] = await Promise.all([
        apiProductCategory.getAll(),
        apiSupplier.getAll(),
        apiCountry.getAll()
      ]);
      if (!Array.isArray(countriesData)) {
        console.error('Expected array of countries but got:', typeof countriesData);
        return;
      }
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setCountries(countriesData);

    };
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    inPrice: "",
    outPrice: "",
    weight: "",
    quantity: "",
    dimensions: { length: "", width: "", height: "" },
    manufacturer: "",
    origin: "",
    category: "",
    shortDescription: "",
    details: ""
  });

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        const compressedImage = await compressImage(file);
        const timestamp = Math.round((new Date).getTime() / 1000);

        const params = {
          timestamp: timestamp,
          upload_preset: 'ml_default'
        };

        const paramString = Object.keys(params)
          .sort()
          .map(key => `${key}=${params[key]}`)
          .join('&') + process.env.REACT_APP_CLOUDINARY_API_SECRET;

        const signature = await generateSHA1(paramString);

        const formData = new FormData();
        formData.append('file', compressedImage);
        formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp);
        formData.append('upload_preset', 'ml_default');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        setProductImage(data.secure_url);
        setPreviewImage(data.secure_url);
      } catch (error) {
        toast.error('Không thể tải lên hình ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [name]: value }
    }));
  };

  const resetForm = () => {
    setProductImage(null);
    setPreviewImage(null);
    setFormData({
      name: "",
      unit: "",
      inPrice: "",
      outPrice: "",
      weight: "",
      quantity: "",
      dimensions: { length: "", width: "", height: "" },
      manufacturer: "",
      origin: "",
      category: "",
      shortDescription: "",
      details: ""
    });
  };

  const categoriesLoading = BaseRepository.getLoadingState('/categories');
  const suppliersLoading = BaseRepository.getLoadingState('/suppliers');
  const countriesLoading = BaseRepository.getLoadingState('/countries');
  const isLoading = categoriesLoading || suppliersLoading || countriesLoading;

  return (
    <div className="create-product-container">
      <ToastContainer />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="header">
            <div className="back" onClick={() => navigate("/product")}>
              <img src={backIcon} alt="Quay lại" />
            </div>
            <h2>Thêm sản phẩm</h2>
          </div>
          <div className="actions">
            <button className="delete" onClick={resetForm}>
              <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
            </button>
            <button className="create" onClick={async () => {
              try {
                if (!formData.name?.trim()) {
                  toast.error('Vui lòng nhập tên sản phẩm');
                  return;
                }
                if (!formData.category) {
                  toast.error('Vui lòng chọn loại sản phẩm');
                  return;
                }
                if (!formData.unit) {
                  toast.error('Vui lòng chọn đơn vị tính');
                  return;
                }

                const productData = {
                  name: formData.name,
                  unit: formData.unit,
                  outPrice: parseFloat(formData.outPrice),
                  weight: parseFloat(formData.weight),
                  length: parseFloat(formData.dimensions.length),
                  width: parseFloat(formData.dimensions.width),
                  height: parseFloat(formData.dimensions.height),
                  image: productImage,
                  origin: formData.origin,
                  title: formData.shortDescription,
                  description: formData.details,
                  quantity: parseInt(formData.quantity) || 0,
                  produceCategoriesID: parseInt(formData.category),
                  supplierID: parseInt(formData.manufacturer),
                  inPrice: parseFloat(formData.inPrice)
                };
                await apiProduct.create(productData);
                toast.success('Tạo sản phẩm thành công');
                navigate("/product");
              } catch (error) {
                if (error?.response?.data?.error?.includes('Argument') && error?.response?.data?.error?.includes('is missing')) {
                  toast.error('Vui lòng điền đầy đủ thông tin');
                } else {
                  toast.error('Có lỗi xảy ra khi tạo sản phẩm');
                }
              }

            }}>
              <img src={createIcon} alt="Tạo" /> Tạo sản phẩm
            </button>
          </div>
          <div className="product-form">
            <div className="image-upload-section">
              <div className="image-container">
                {previewImage ? (
                  <img src={previewImage} alt="Product preview" />
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
                <label>Thuộc loại</label>
                <div className="select-container">
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="">Chọn loại sản phẩm</option>
                    {categories.map((category) => (
                      <option key={category.ID} value={category.ID}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Nhà sản xuất</label>
                <div className="select-container">
                  <select
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn nhà sản xuất</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.ID} value={supplier.ID}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Xuất sứ</label>
                <div className="custom-select" ref={selectRef}>
                  <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                    {formData.origin ? (
                      <>
                        <img
                          src={countries.find(c => c.name === formData.origin)?.flag}
                          alt={formData.origin}
                          className="country-flag"
                        />
                        <span>{formData.origin}</span>
                      </>
                    ) : (
                      <span className="placeholder">Chọn xuất xứ</span>
                    )}
                  </div>
                  {isOpen && (
                    <div className="options-list">
                      {countries.map((country) => (
                        <div
                          key={country.code}
                          className={`option ${formData.origin === country.name ? 'selected' : ''}`}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, origin: country.name }));
                            setIsOpen(false);
                          }}
                        >
                          <img
                            src={country.flag}
                            alt={country.name}
                            className="country-flag"
                          />
                          <span>{country.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Đơn vị tính</label>
                <div className="select-container">
                  <select name="unit" value={formData.unit} onChange={handleInputChange}>
                    <option value="">Chọn đơn vị</option>
                    {units.map((unit, index) => (
                      <option key={index} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Khối lượng (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>


              <div className="form-group">
                <label>Kích thước</label>
                <input
                  type="number"
                  name="width"
                  className="width"
                  placeholder="Rộng(cm)"
                  value={formData.dimensions.width}
                  onChange={handleDimensionChange}
                  min="0"
                  step="0.1"
                />
                <input
                  type="number"
                  name="length"
                  className="length"
                  placeholder="Dài(cm)"
                  value={formData.dimensions.length}
                  onChange={handleDimensionChange}
                  min="0"
                  step="0.1"
                />
                <input
                  type="number"
                  name="height"
                  className="height"
                  placeholder="Cao(cm)"
                  value={formData.dimensions.height}
                  onChange={handleDimensionChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                />
              </div>


              <div className="form-group">
                <label>Giá nhập</label>
                <input
                  type="number"
                  name="inPrice"
                  value={formData.inPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label>Giá bán</label>
                <input
                  type="number"
                  name="outPrice"
                  value={formData.outPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
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
        </>
      )}
    </div>
  );
};

export default CreateProduct;
