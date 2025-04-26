import backIcon from "../../assets/img/back-icon.svg"
import deleteIcon from "../../assets/img/delete-icon.svg"
import editIcon from "../../assets/img/white-edit.svg"
import printIcon from "../../assets/img/print-icon.svg"
import saveIcon from "../../assets/img/save-icon.svg"
import "./detailProduct.scss"
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import apiProduct from "../../api/apiProduct";
import ProductImg from "../../assets/img/product-img.svg"

const DetailProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [editedProduct, setEditedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //use url query param to handle edit/non-edit mode
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditMode);

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
  };

  const handleInputChange = (field, value) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiProduct.getById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
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
        <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
        {isEditing ? (
          <>
            <button className="save" onClick={handleSave}><img src={saveIcon} alt="Lưu" /> Lưu</button>
            <button className="cancel" onClick={handleCancel}>Hủy</button>
          </>
        ) : (
          <button className="edit" onClick={handleEditClick}><img src={editIcon} alt="Sửa" /> Sửa</button>
        )}
        <button className="print"><img src={printIcon} alt="In" /> In </button>
      </div>

      <div className="detail-product-content">
        <div className="product-image">
          <img src={product.image || ProductImg} alt={product.name} className="img-product" />
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
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleInputChange('image', reader.result);
                    };
                    reader.readAsDataURL(file);
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
              <input
                type="text"
                value={editedProduct.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="info-input"
              />
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
              <input
                type="text"
                value={editedProduct.supplierID}
                onChange={(e) => handleInputChange('supplierID', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.supplierID}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Xuất sứ</div>
            {isEditing ? (
              <input
                type="text"
                value={editedProduct.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.origin}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Thuộc loại</div>
            {isEditing ? (
              <input
                type="text"
                value={editedProduct.productCategoriesID}
                onChange={(e) => handleInputChange('productCategoriesID', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.productCategoriesID}</div>
            )}
          </div>
          <div className="info-item">
            <div className="info-label">Tồn kho</div>
            {isEditing ? (
              <input
                type="number"
                value={editedProduct.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className="info-input"
              />
            ) : (
              <div className="info-value">{product.quantity}</div>
            )}
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
