import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import "./detailProduct.scss";
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import sha1 from 'crypto-js/sha1';
import apiProduct from "../../api/apiProduct";
import apiCountry from "../../api/apiCountry";
import apiProductCategory from "../../api/apiProductCategory";
import apiSupplier from "../../api/apiSupplier";
import ProductImg from "../../assets/img/product-img.svg";

const DetailProduct = () => {
  const cld = new Cloudinary({ cloud: { cloudName: 'dlrm4ccbs' } });
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const units = ["Cái", "Hộp", "Thùng", "Kg", "Gói"];
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditMode);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditClick = () => {
    setEditedProduct({ ...product });
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiProduct.update(id, editedProduct);
      setProduct(editedProduct);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("edit");
      setSearchParams(newSearchParams);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProduct(null);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("edit");
    setSearchParams(newSearchParams);
  };

  const generateSignature = (params) => {
    const apiSecret = '9IqI3iaNI1e9mwTp8V6uomrwFts';
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return sha1(sortedParams + apiSecret).toString();
  };

  const uploadToCloudinary = async (file) => {
    try {
      const timestamp = Math.round((new Date()).getTime() / 1000);
      const params = {
        timestamp,
        api_key: '679573739148611',
        resource_type: 'image',
        folder: 'products'
      };
      const signature = generateSignature(params);
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => formData.append(key, value));
      formData.append('signature', signature);
      const response = await fetch(`https://api.cloudinary.com/v1_1/dlrm4ccbs/auto/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error((await response.json()).error?.message || 'Upload failed');
      const data = await response.json();
      return { public_id: data.public_id, secure_url: data.secure_url };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleInputChange = async (field, value) => {
    if (field === 'image' && value instanceof File) {
      try {
        const result = await uploadToCloudinary(value);
        const newImage = `${result.public_id}`;
        setEditedProduct(prev => ({ ...prev, image: newImage }));
        setProduct(prev => ({ ...prev, image: newImage }));
      } catch (error) {
        setError('Lỗi khi tải lên hình ảnh');
      }
    } else {
      setEditedProduct(prev => ({ ...prev, [field]: value }));
      if (field === 'supplierID') {
        const selectedSupplier = suppliers.find(s => s.ID === parseInt(value));
        const supplierCategories = selectedSupplier?.productCategories || [];
        setFilteredCategories(supplierCategories);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [response, countriesData, categoriesData, suppliersData] = await Promise.all([
          apiProduct.getById(id),
          apiCountry.getAll(),
          apiProductCategory.getAll(),
          apiSupplier.getAll()
        ]);
        setProduct(response.data);
        setCountries(countriesData);
        setAllCategories(categoriesData);
        setSuppliers(suppliersData);
        const currentSupplier = suppliersData.find(s => s.ID === response.data.supplierID);
        const supplierCategories = currentSupplier?.productCategories || [];
        setFilteredCategories(supplierCategories);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      setIsEditing(true);
      setEditedProduct({ ...product });
    } else {
      setIsEditing(false);
    }
  }, [isEditMode, searchParams, product]);

  if (loading) return <h2>Đang tải...</h2>;
  if (error) return <h2>Lỗi: {error}</h2>;
  if (!product) return <h2>Không tìm thấy sản phẩm</h2>;


  return (
    <div className="detail-product-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/product")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Chi tiết sản phẩm</h2>
      </div>
      <div className="actions">
        {isEditing ? (
          <div className="edit-actions">
            <button className="save" onClick={handleSave}><img src={saveIcon} alt="Lưu" /> Lưu</button>
            <button className="cancel" onClick={handleCancel}>Hủy</button>
          </div>
        ) : (
          <>
            <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
            <button className="edit" onClick={handleEditClick}><img src={editIcon} alt="Sửa" /> Sửa</button>
          </>
        )}
      </div>

      <div className="detail-product-content">
        <div className="product-image">
          {product.image ? (
            <AdvancedImage
              key={product.image} // Add key to force re-render when image changes
              cldImg={cld.image(product.image)
                .format('auto')
                .quality('auto')
                .resize(auto().gravity(autoGravity()).width(500).height(500))}
              alt={product.name}
              className="img-product"
            />
          ) : (
            <img src={ProductImg} alt={product.name} className="img-product" />
          )}
          {isEditing && (
            <div className="edit-image">
              <label htmlFor="image-upload" className="edit-image-label">
                Sửa hình ảnh
              </label>
              <input
                htmlFor="image-upload"
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleInputChange('image', file);
                  }
                }}
                className="image-upload"
              />
            </div>
          )}
        </div>

        <div className="product-info">
          <div className="info-item">
            <div className="info-label">Tên sản phẩm</div>
            {isEditing ? (
              <input
                type="text"
                value={editedProduct.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.name}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Mã sản phẩm</div>
            <div className="info-value">{product.ID}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Đơn vị tính</div>
            {isEditing ? (
              <select
                value={editedProduct.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="info-input"
              >
                <option value="">Chọn đơn vị</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            ) : (
              <div className="info-value">{product.unit}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Giá nhập</div>
            {isEditing ? (
              <input
                type="number"
                value={editedProduct.inPrice}
                onChange={(e) => handleInputChange('inPrice', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.inPrice} VNĐ</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Giá bán</div>
            {isEditing ? (
              <input
                type="number"
                value={editedProduct.outPrice}
                onChange={(e) => handleInputChange('outPrice', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.outPrice} VNĐ</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Khối lượng {"(g)"}</div>
            {isEditing ? (
              <input
                type="number"
                value={editedProduct.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.weight}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Kích thước</div>
            {isEditing ? (
              <div className="dimensions-input">
                <input
                  type="number"
                  value={editedProduct.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  className="info-input dimension"
                /> cm x
                <input
                  type="number"
                  value={editedProduct.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="info-input dimension"
                /> cm x
                <input
                  type="number"
                  value={editedProduct.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="info-input dimension"
                /> cm
              </div>
            ) : (
              <div className="info-value">{product.width} cm x {product.height} cm x {product.length} cm</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Nhà sản xuất</div>
            {isEditing ? (
              <select
                value={editedProduct.supplierID}
                onChange={(e) => handleInputChange('supplierID', e.target.value)}
                className="info-input"
              >
                <option value="">Chọn nhà sản xuất</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.ID} value={supplier.ID}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="info-value">{product.supplier?.name || 'N/A'}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Xuất sứ</div>
            {isEditing ? (
              <div className="custom-select" ref={selectRef}>
                <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                  {editedProduct.origin ? (
                    <>
                      <img
                        src={countries.find(c => c.name === editedProduct.origin)?.flag}
                        alt={editedProduct.origin}
                        className="country-flag"
                      />
                      <span>{editedProduct.origin}</span>
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
                        className={`option ${editedProduct.origin === country.name ? 'selected' : ''}`}
                        onClick={() => {
                          handleInputChange('origin', country.name);
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
            ) : (
              <div className="info-value">
                {product.origin && countries.find(c => c.name === product.origin) ? (
                  <>
                    <img
                      src={countries.find(c => c.name === product.origin)?.flag}
                      alt={product.origin}
                      className="country-flag"
                    />
                    <span>{product.origin}</span>
                  </>
                ) : (
                  product.origin || 'N/A'
                )}
              </div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Thuộc loại</div>
            {isEditing ? (
              <select
                value={editedProduct.produceCategoriesID}
                onChange={(e) => handleInputChange('produceCategoriesID', e.target.value)}
                className="info-input"
              >
                <option value="">Chọn loại sản phẩm</option>
                {filteredCategories.map((category) => (
                  <option key={category.ID} value={category.ID}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="info-value">{product.productCategory?.name || "N/A"}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Tồn kho</div>
            <div className="info-value">{product.quantity}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Ghi chú</div>
            {isEditing ? (
              <input
                type="text"
                value={editedProduct.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.title}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Thông tin chi tiết</div>
            {isEditing ? (
              <textarea
                value={editedProduct.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="info-input description"
              />
            ) : (
              <div className="info-value">{product.description}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailProduct
