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
  const [errors, setErrors] = useState({
    name: '',
    category: '',
    unit: '',
    manufacturer: '',
    origin: '',
    weight: '',
    dimensions: '',
    quantity: '',
    inPrice: '',
    outPrice: ''
  });

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
                setErrors({
                  name: '',
                  category: '',
                  unit: '',
                  manufacturer: '',
                  origin: '',
                  weight: '',
                  dimensions: '',
                  quantity: '',
                  inPrice: '',
                  outPrice: ''
                });
                
                let hasError = false;
                if (!formData.name?.trim()) {
                  setErrors(prev => ({...prev, name: 'Vui lòng nhập tên sản phẩm'}));
                  hasError = true;
                }
                if (!formData.category) {
                  setErrors(prev => ({...prev, category: 'Vui lòng chọn loại sản phẩm'}));
                  hasError = true;
                }
                if (!formData.unit) {
                  setErrors(prev => ({...prev, unit: 'Vui lòng chọn đơn vị tính'}));
                  hasError = true;
                }
                if (!formData.manufacturer) {
                  setErrors(prev => ({...prev, manufacturer: 'Vui lòng chọn nhà sản xuất'}));
                  hasError = true;
                }
                if (!formData.origin) {
                  setErrors(prev => ({...prev, origin: 'Vui lòng chọn xuất xứ'}));
                  hasError = true;
                }
                if (!formData.weight) {
                  setErrors(prev => ({...prev, weight: 'Vui lòng nhập khối lượng'}));
                  hasError = true;
                }
                if (!formData.dimensions.length || !formData.dimensions.width || !formData.dimensions.height) {
                  setErrors(prev => ({...prev, dimensions: 'Vui lòng nhập đầy đủ kích thước'}));
                  hasError = true;
                }
                if (!formData.quantity) {
                  setErrors(prev => ({...prev, quantity: 'Vui lòng nhập số lượng'}));
                  hasError = true;
                }
                if (!formData.inPrice) {
                  setErrors(prev => ({...prev, inPrice: 'Vui lòng nhập giá nhập'}));
                  hasError = true;
                }
                if (!formData.outPrice) {
                  setErrors(prev => ({...prev, outPrice: 'Vui lòng nhập giá bán'}));
                  hasError = true;
                }

                if (hasError) {
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
                toast.success('Tạo sản phẩm thành công', {
                  position: "top-right",
                  autoClose: 1500,
                  onClose: () => navigate("/product")
                });
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
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className={errors.name ? 'error-field' : ''} 
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Thuộc loại</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div className="select-container">
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange}
                      className={errors.category ? 'error-field' : ''}
                    >
                      <option value="">Chọn loại sản phẩm</option>
                      {categories.map((category) => (
                        <option key={category.ID} value={category.ID}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Nhà sản xuất</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div className="select-container">
                    <select
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      className={errors.manufacturer ? 'error-field' : ''}
                    >
                      <option value="">Chọn nhà sản xuất</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.ID} value={supplier.ID}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.manufacturer && <span className="error-message">{errors.manufacturer}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Xuất sứ</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div className={`custom-select ${errors.origin ? 'error-field' : ''}`} ref={selectRef}>
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
                  {errors.origin && <span className="error-message">{errors.origin}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Đơn vị tính</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div className="select-container">
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleInputChange}
                      className={errors.unit ? 'error-field' : ''}
                    >
                      <option value="">Chọn đơn vị</option>
                      {units.map((unit, index) => (
                        <option key={index} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  {errors.unit && <span className="error-message">{errors.unit}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Khối lượng (kg)</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={errors.weight ? 'error-field' : ''}
                  />
                  {errors.weight && <span className="error-message">{errors.weight}</span>}
                </div>
              </div>


              <div className="form-group">
                <label>Kích thước</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <input
                      type="number"
                      name="width"
                      className={`width ${errors.dimensions ? 'error-field' : ''}`}
                      placeholder="Rộng(cm)"
                      value={formData.dimensions.width}
                      onChange={handleDimensionChange}
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="number"
                      name="length"
                      className={`length ${errors.dimensions ? 'error-field' : ''}`}
                      placeholder="Dài(cm)"
                      value={formData.dimensions.length}
                      onChange={handleDimensionChange}
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="number"
                      name="height"
                      className={`height ${errors.dimensions ? 'error-field' : ''}`}
                      placeholder="Cao(cm)"
                      value={formData.dimensions.height}
                      onChange={handleDimensionChange}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  {errors.dimensions && <span className="error-message">{errors.dimensions}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity || ""}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className={errors.quantity ? 'error-field' : ''}
                  />
                  {errors.quantity && <span className="error-message">{errors.quantity}</span>}
                </div>
              </div>


              <div className="form-group">
                <label>Giá nhập</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <input
                    type="number"
                    name="inPrice"
                    value={formData.inPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={errors.inPrice ? 'error-field' : ''}
                  />
                  {errors.inPrice && <span className="error-message">{errors.inPrice}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Giá bán</label>
                <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <input
                    type="number"
                    name="outPrice"
                    value={formData.outPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={errors.outPrice ? 'error-field' : ''}
                  />
                  {errors.outPrice && <span className="error-message">{errors.outPrice}</span>}
                </div>
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
