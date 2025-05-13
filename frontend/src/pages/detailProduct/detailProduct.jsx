import React from 'react';
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import ProductImg from "../../assets/img/product-img.svg";
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
import "./detailProduct.scss";

const DetailProduct = () => {
  const [cld, setCld] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
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
    const config = {
      cloud: {
        cloudName: 'dlrm4ccbs',
        apiKey: '679573739148611'
      },
      url: {
        secure: true
      }
    };

    try {
      const cloudinary = new Cloudinary(config);
      setCld(cloudinary);
      console.log('Cloudinary initialized successfully');
    } catch (error) {
      console.error('Error initializing Cloudinary:', error);
    }
  }, []);

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }

      const cloudName = 'dlrm4ccbs';
      const apiKey = '679573739148611';
      const apiSecret = '9IqI3iaNI1e9mwTp8V6uomrwFts';

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary configuration is missing');
      }

      const timestamp = Math.round(Date.now() / 1000).toString();
      const folder = 'products';
      const paramsToSign = {
        api_key: apiKey,
        folder: folder,
        timestamp: timestamp
      };
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = sha1(stringToSign).toString();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('cloud_name', cloudName);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || result.error || 'Lỗi tải lên hình ảnh. Vui lòng thử lại.');
      }

      console.log('Image uploaded successfully');

      return { public_id: result.public_id, secure_url: result.secure_url };
    } catch (error) {
      setUploadError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (field, value) => {
    if (field === 'image' && value instanceof File) {
      try {
        const result = await uploadToCloudinary(value);
        const newImage = result.public_id;
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (isEditMode && product) {
      setIsEditing(true);
      setEditedProduct({ ...product });
    } else {
      setIsEditing(false);
    }
  }, [isEditMode, product]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
        {isEditing ? (
          <div className="edit-actions">
            <button className="save" onClick={handleSave} disabled={loading}>
              {loading ? (
                <span className="loading">Đang lưu...</span>
              ) : (
                <>
                  <img src={saveIcon} alt="Lưu" /> Lưu
                </>
              )}
            </button>
            <button className="cancel" onClick={handleCancel} disabled={loading}>Hủy</button>
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <>
            <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
            <button className="edit" onClick={handleEditClick}><img src={editIcon} alt="Sửa" /> Sửa</button>
          </>
        )}
      </div>

      <div className="detail-product-content">
        {product && (
          <div className="content-wrapper">
            <div className="product-image">
              {
                product.image && product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="img-product" />
                ) : product.image && cld ? (
                  <AdvancedImage
                    key={product.image}
                    cldImg={cld.image(product.image)
                      .format('auto')
                      .quality('auto')
                      .resize(auto().gravity(autoGravity()).width(500).height(500))}
                    alt={product.name}
                    className="img-product"
                  />
                ) : (
                  <div className="img-product no-image" />
                )
              }

              {isEditing && (
                <div className="edit-image">
                  {uploading ? (
                    <div className="upload-loading">Đang tải lên...</div>
                  ) : (
                    <>
                      <label htmlFor="image-upload" className="edit-image-label">
                        Sửa hình ảnh
                      </label>
                      <input
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
                        disabled={uploading}
                      />
                      {uploadError && <div className="upload-error">{uploadError}</div>}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="product-info">
              <div className="info-item">
                <div className="info-label">Tên sản phẩm</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProduct.name || ''}
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
                    value={editedProduct.unit || ''}
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
                    value={editedProduct.inPrice || ''}
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
                    value={editedProduct.outPrice || ''}
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
                    value={editedProduct.weight || ''}
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
                      value={editedProduct.width || ''}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      className="info-input dimension"
                    /> cm x
                    <input
                      type="number"
                      value={editedProduct.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="info-input dimension"
                    /> cm x
                    <input
                      type="number"
                      value={editedProduct.length || ''}
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
                    value={editedProduct.supplierID || ''}
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
                    value={editedProduct.produceCategoriesID || ''}
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
                    value={editedProduct.title || ''}
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
                    value={editedProduct.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="info-input description"
                  />
                ) : (
                  <div className="info-value">{product.description}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailProduct;
