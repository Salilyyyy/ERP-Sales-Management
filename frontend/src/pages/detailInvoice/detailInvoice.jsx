import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import InvoiceTemplate from "../../components/invoiceTemplate/invoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import "./detailInvoice.scss";
import InvoiceRepository from "../../api/apiInvoice";
import PromotionRepository from "../../api/apiPromotion";
import CategoryRepository from "../../api/apiProductCategory";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import exportIcon from "../../assets/img/white-export.svg";

const OrderDetails = () => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editedInvoice, setEditedInvoice] = useState(null);

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await InvoiceRepository.delete(id);
      if (response.success) {
        toast.success("Xóa hóa đơn thành công!");
        navigate("/invoices");
      } else {
        toast.error(response.message || "Không thể xóa hóa đơn!");
      }
    } catch (error) {
      if (error.message?.includes('Foreign key constraint')) {
        toast.error("Không thể xóa hóa đơn vì có dữ liệu liên quan! Vui lòng xóa vận đơn trước khi xóa hóa đơn.");
      } else {
        toast.error("Không thể xóa hóa đơn! Vui lòng thử lại sau.");
      }
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setEditedInvoice({
      customerId: invoice.Customers.ID,
      isPaid: invoice.isPaid,
      isDelivery: invoice.isDelivery,
      paymentMethod: invoice.paymentMethod || "tienMat",
      notes: invoice.notes || "",
      promotionId: invoice.Promotions?.ID || "",
      tax: invoice.tax || 0
    });
    setEditedDetails(invoice.InvoiceDetails?.map(detail => ({
      ...detail,
      Products: detail.Products
    })) || []);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("edit", "true");
    setSearchParams(newSearchParams);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!invoice.Customers?.ID) {
        toast.error("Không tìm thấy thông tin khách hàng!");
        return;
      }

      const updateData = {};
      
      updateData.customerID = parseInt(invoice.Customers.ID);

      if (invoice.isPaid !== editedInvoice.isPaid) {
        updateData.isPaid = editedInvoice.isPaid;
      }
      
      if (invoice.isDelivery !== editedInvoice.isDelivery) {
        updateData.isDelivery = editedInvoice.isDelivery;
      }
      
      if (invoice.paymentMethod !== editedInvoice.paymentMethod) {
        updateData.paymentMethod = editedInvoice.paymentMethod;
      }
      
      if (invoice.notes !== editedInvoice.notes) {
        updateData.notes = editedInvoice.notes;
      }
      
      const originalPromotionId = invoice.Promotions?.ID || null;
      const newPromotionId = editedInvoice.promotionId || null;
      if (originalPromotionId !== newPromotionId) {
        updateData.promotionID = newPromotionId;
      }
      
      if (invoice.tax !== editedInvoice.tax) {
        updateData.tax = editedInvoice.tax || 0;
      }

      const detailsChanged = JSON.stringify(invoice.InvoiceDetails) !== JSON.stringify(editedDetails);
      if (detailsChanged) {
        updateData.details = editedDetails.map(detail => ({
          productID: parseInt(detail.Products.ID),
          quantity: parseInt(detail.quantity),
          price: parseFloat(detail.unitPrice)
        }));
      }

      const response = await InvoiceRepository.update(id, updateData);
      if (response.success) {
        if (response.data) {
          setInvoice(response.data);
        }
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
        toast.success("Cập nhật hóa đơn thành công!");
      } else {
        toast.error(response.message || "Không thể cập nhật hóa đơn!");
      }
    } catch (error) {
      toast.error("Không thể cập nhật hóa đơn! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handlePrint = async () => {
    try {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = ReactDOM.createRoot(container);
      
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.padding = '20px';
      container.style.width = '210mm';
      container.style.backgroundColor = 'white';

      root.render(
        <InvoiceTemplate
          invoice={invoice}
          totalItems={totalItems}
          taxAmount={taxAmount}
          promotionDiscount={promotionDiscount}
          totalPayment={totalPayment}
        />
      );

      await new Promise(resolve => setTimeout(resolve, 500));

      const doc = new jsPDF('p', 'mm', 'a4');
      
      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);

        doc.save(`hoa-don-${invoice.ID}.pdf`);
      } catch (error) {
        toast.error('Không thể tạo PDF. Vui lòng thử lại sau.');
      }

      document.body.removeChild(container);
    } catch (error) {
      toast.error('Không thể tạo PDF. Vui lòng thử lại sau.');
    }
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [editedDetails, setEditedDetails] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryRepository.getAll();
        if (response && Array.isArray(response)) {
          const sortedCategories = [...response].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setCategories(sortedCategories);

          const allProducts = sortedCategories.reduce((acc, category) => {
            return [...acc, ...(category.Products || [])];
          }, []);

          const sortedProducts = [...allProducts].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setProducts(sortedProducts);

          if (selectedCategory) {
            const currentCategory = sortedCategories.find(c => c.ID.toString() === selectedCategory);
            if (currentCategory?.Products) {
              const filteredAndSorted = [...currentCategory.Products].sort((a, b) =>
                a.name.localeCompare(b.name)
              );
              setFilteredProducts(filteredAndSorted);
            }
          }
        } else {
          toast.error("Không thể tải danh sách loại sản phẩm");
        }
      } catch (error) {
        toast.error("Không thể tải dữ liệu! Vui lòng thử lại sau.");
      }
    };

    if (isEditing) {
      fetchCategories();
    }
  }, [isEditing]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const currentCategory = categories.find(c => c.ID.toString() === selectedCategory);
      if (currentCategory?.Products) {
        const sortedProducts = [...currentCategory.Products].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setFilteredProducts(sortedProducts);
      } else {
        setFilteredProducts([]);
      }
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct("");
  }, [selectedCategory, categories]);

  useEffect(() => {
    const fetchPromotions = async () => {
        const response = await PromotionRepository.getAll();
        const sortedPromotions = response.success && response.data ?
          [...response.data].sort((a, b) => a.name.localeCompare(b.name)) :
          [];
        setPromotions(sortedPromotions);
    };

    if (isEditing) {
      fetchPromotions();
    }
  }, [isEditing]);

  const handleAddProduct = () => {
    if (!selectedCategory) {
      toast.warning("Vui lòng chọn loại sản phẩm");
      return;
    }

    if (!selectedProduct || selectedQuantity <= 0) {
      toast.warning("Vui lòng chọn sản phẩm và nhập số lượng");
      return;
    }

    const currentCategory = categories.find(c => c.ID.toString() === selectedCategory);
    if (!currentCategory?.Products) {
      toast.error("Không tìm thấy sản phẩm trong loại này");
      return;
    }

    const product = currentCategory.Products.find(p => p.ID === parseInt(selectedProduct));
    if (!product) {
      toast.error("Không thể tìm thấy sản phẩm trong loại đã chọn");
      return;
    }

    if (product.quantity < selectedQuantity) {
      toast.warning(`Số lượng sản phẩm ${product.name} không đủ. Chỉ còn ${product.quantity} sản phẩm.`);
      return;
    }

    const existingItemIndex = editedDetails.findIndex(item => item.Products.ID === product.ID);

    if (existingItemIndex >= 0) {
      const updatedDetails = [...editedDetails];
      const updatedItem = updatedDetails[existingItemIndex];
      const newQuantity = updatedItem.quantity + selectedQuantity;

      if (newQuantity > product.quantity) {
        toast.warning(`Số lượng sản phẩm ${product.name} không đủ. Chỉ còn ${product.quantity} sản phẩm.`);
        return;
      }

      updatedItem.quantity = newQuantity;
      updatedItem.total = updatedItem.unitPrice * updatedItem.quantity;
      setEditedDetails(updatedDetails);
    } else {
      const newDetail = {
        Products: {
          ...product,
          name: product.name,
          unit: product.unit,
          produceCategoriesID: product.produceCategoriesID
        },
        quantity: selectedQuantity,
        unitPrice: product.outPrice,
        total: product.outPrice * selectedQuantity
      };
      setEditedDetails(prev => [...prev, newDetail]);
    }

    setSelectedProduct("");
    setSelectedQuantity(1);
  };

  const handleRemoveProduct = (index) => {
    const updatedDetails = editedDetails.filter((_, i) => i !== index);
    setEditedDetails(updatedDetails);

    if (updatedDetails.length > 0) {
      setSelectedCategory(updatedDetails[0].Products.produceCategoriesID.toString());
    } else {
      setSelectedCategory("");
    }
  };

  const calculateTotal = () => {
    const subtotal = editedDetails.reduce((sum, item) =>
      sum + (item.unitPrice * item.quantity), 0);
    const taxPercent = editedInvoice?.tax || 0;
    const taxAmount = (subtotal * taxPercent) / 100;
    const promotion = editedInvoice?.Promotions;
    const promotionDiscount = promotion ?
      (promotion.type === 'percentage' ?
        (subtotal * promotion.value / 100) :
        promotion.value) : 0;
    return {
      subtotal,
      tax: taxAmount,
      taxPercent,
      promotionDiscount,
      total: subtotal + taxAmount - promotionDiscount
    };
  };

  useEffect(() => {
    const initializeEditMode = async () => {
      if (isEditMode && invoice) {
        setIsEditing(true);
        setEditedInvoice({
          customerId: invoice.Customers?.ID,
          isPaid: invoice.isPaid,
          isDelivery: invoice.isDelivery,
          paymentMethod: invoice.paymentMethod || "tienMat",
          notes: invoice.notes || "",
          promotionId: invoice.Promotions?.ID || "",
          tax: invoice.tax || 0,
          Promotions: invoice.Promotions
        });
        const details = invoice.InvoiceDetails?.map(detail => ({
          ...detail,
          Products: detail.Products || {}
        })) || [];
        setEditedDetails(details);

        try {
          const categoryResponse = await CategoryRepository.getAll();
          if (categoryResponse && Array.isArray(categoryResponse)) {
            const sortedCategories = [...categoryResponse].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
            setCategories(sortedCategories);

            const allProducts = sortedCategories.reduce((acc, category) => {
              return [...acc, ...(category.Products || [])];
            }, []);

            setProducts(allProducts);

            if (details.length > 0 && details[0].Products?.produceCategoriesID) {
              const categoryId = details[0].Products.produceCategoriesID.toString();
              setSelectedCategory(categoryId);

              const currentCategory = sortedCategories.find(c => c.ID.toString() === categoryId);
              if (currentCategory?.Products) {
                const sortedProducts = [...currentCategory.Products].sort((a, b) =>
                  a.name.localeCompare(b.name)
                );
                setFilteredProducts(sortedProducts);
              }
            }
          } else {
          }
        } catch (error) {
        }
      } else {
        setIsEditing(false);
      }
    };

    initializeEditMode();
  }, [isEditMode, searchParams, invoice, categories.length]);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await InvoiceRepository.getById(id);
        if (response.success && response.data) {
          setInvoice(response.data);
        } else {
          setError("Không tìm thấy thông tin hóa đơn");
        }
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error || !invoice) {
    return <h2>{error || "Không tìm thấy hóa đơn!"}</h2>;
  }

  const totalItems = invoice.InvoiceDetails?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
  const taxAmount = (totalItems * (invoice.tax || 0)) / 100;
  const promotionDiscount = invoice.Promotions ?
    (invoice.Promotions.type === 'percentage' ?
      (totalItems * invoice.Promotions.value / 100) :
      invoice.Promotions.value) : 0;
  const totalPayment = totalItems + taxAmount - promotionDiscount;

  return (
    <>
      <ConfirmPopup
        isOpen={showDeleteConfirm}
        message="Bạn có chắc chắn muốn xóa hóa đơn này?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <div className="order-details">
        <div className="header">
          <div className="back" onClick={() => navigate("/invoices")}>
            <img src={backIcon} alt="Quay lại" />
          </div>
          <h2>Chi tiết đơn hàng</h2>
        </div>
        <div className="actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="save" onClick={handleSave}>
                <img src={saveIcon} alt="Lưu" /> {loading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          ) : (
            <>
              <button className="delete" onClick={handleDelete}>
                <img src={deleteIcon} alt="Xóa" /> Xóa
              </button>
              <button className="edit" onClick={handleEdit}>
                <img src={editIcon} alt="Sửa" /> Sửa
              </button>
              <button className="print" onClick={handlePrint}>
                <img src={exportIcon} alt="Xuất" /> Xuất
              </button>
            </>
          )}
        </div>
        <div className="order-info">
          <h3 className="order-id">#ĐH-{invoice.ID}</h3>
          <div className="info-grid">
            <div><strong>Nhân viên bán:</strong> {invoice.Users?.name || "N/A"}</div>
            <div><strong>Thời gian tạo:</strong> {new Date(invoice.exportTime).toLocaleString("vi-VN")}</div>
            <div><strong>Khách hàng:</strong> {invoice.Customers?.name || "N/A"}</div>
            <div><strong>Số điện thoại:</strong> {invoice.Customers?.phoneNumber || "N/A"}</div>
            <div><strong>Tên người nhận:</strong> {invoice.Customers?.name || "N/A"}</div>
            <div><strong>SĐT người nhận:</strong> {invoice.Customers?.phoneNumber || "N/A"}</div>
            <div><strong>Địa chỉ người nhận:</strong> {invoice.Customers?.address || "N/A"}</div>
            <div><strong> </strong> </div>
            <div>
              <strong>Trạng thái thanh toán:</strong>
              {isEditing ? (
                <select
                  value={editedInvoice.isPaid}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, isPaid: e.target.value === 'true' })}
                >
                  <option value="true">Đã thanh toán</option>
                  <option value="false">Chưa thanh toán</option>
                </select>
              ) : (
                invoice.isPaid ? "Đã thanh toán" : "Chưa thanh toán"
              )}
            </div>
            {isEditing ? (
              editedInvoice?.isDelivery && (
                <div>
                  <strong>Trạng thái giao hàng:</strong>
                  <select
                    value={editedInvoice.isDelivery}
                    onChange={(e) => setEditedInvoice({ ...editedInvoice, isDelivery: e.target.value === 'true' })}
                  >
                    <option value="true">Đã giao hàng</option>
                    <option value="false">Chưa giao hàng</option>
                  </select>
                </div>
              )
            ) : invoice.isDelivery && (
              <div>
                <strong>Trạng thái giao hàng:</strong>
                {invoice.isDelivery ? "Đã giao hàng" : "Chưa giao hàng"}
              </div>
            )}
            <div>
              <strong>Hình thức thanh toán:</strong>
              {isEditing ? (
                <select
                  value={editedInvoice.paymentMethod}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, paymentMethod: e.target.value })}
                >
                  <option value="tienMat">Tiền mặt</option>
                  <option value="chuyenKhoan">Chuyển khoản</option>
                  <option value="the">Thẻ</option>
                </select>
              ) : (
                invoice.paymentMethod === "tienMat" ? "Tiền mặt" :
                  invoice.paymentMethod === "chuyenKhoan" ? "Chuyển khoản" :
                    invoice.paymentMethod === "the" ? "Thẻ" : "N/A"
              )}
            </div>
            <div className="notes">
              <strong>Ghi chú:</strong>
              {isEditing ? (
                <textarea
                  value={editedInvoice.notes}
                  onChange={(e) => setEditedInvoice({ ...editedInvoice, notes: e.target.value })}
                  rows="3"
                />
              ) : (
                invoice.notes || "N/A"
              )}
            </div>
          </div>
        </div>

        <div className="invoice-details">
          <h3>Chi tiết hóa đơn</h3>
          {isEditing && (
            <div className="section-3">
              <div className="form-group">
                <label>Loại sản phẩm</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">Chọn loại</option>
                  {categories.map(category => (
                    <option key={category.ID} value={category.ID}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={!selectedCategory}
                >
                  <option value="">Chọn sản phẩm</option>
                  {filteredProducts.map(product => (
                    <option key={product.ID} value={product.ID}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input
                  type="number"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <button className="btn btn-success" onClick={handleAddProduct}>
                ➕ Thêm sản phẩm
              </button>
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Đơn vị</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
                {isEditing && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? editedDetails : invoice.InvoiceDetails)?.map((item, index) => (
                <tr key={isEditing ? index : item.ID}>
                  <td>{index + 1}</td>
                  <td>{item.Products?.name || "N/A"}</td>
                  <td>{item.Products?.unit || "N/A"}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.unitPrice || 0).toLocaleString("vi-VN")} VND</td>
                  <td>{((item.unitPrice || 0) * (item.quantity || 0)).toLocaleString("vi-VN")} VND</td>
                  {isEditing && (
                    <td>
                      <img
                        src={cancelIcon}
                        alt="Xóa"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleRemoveProduct(index)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="summary">
            <div className="promotion-section">
              {isEditing && (
                <>
                <div className="promotion">
                <p>Khuyến mãi</p>
                  <select
                    value={editedInvoice.promotionId || ""}
                    onChange={(e) => setEditedInvoice({
                      ...editedInvoice,
                      promotionId: e.target.value,
                      Promotions: promotions.find(p => p.ID === e.target.value)
                    })}
                  >
                    <option value="">Không áp dụng khuyến mãi</option>
                    {promotions.map(promotion => (
                      <option key={promotion.ID} value={promotion.ID}>
                        {promotion.name} - {promotion.value}{promotion.type === 'percentage' ? '%' : ' VND'}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div className="tax-section">
                    <p>Thuế</p>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editedInvoice.tax || 0}
                      onChange={(e) => setEditedInvoice({
                        ...editedInvoice,
                        tax: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Thuế GTGT (%)"
                    />
                  </div>
                </>
              )}
            </div>
            <p><strong>Tổng tiền hàng:</strong> {(isEditing ? calculateTotal().subtotal : totalItems).toLocaleString("vi-VN")} VND</p>
            <p><strong>Thuế GTGT:</strong> {(isEditing ? calculateTotal().tax : taxAmount).toLocaleString("vi-VN")} VND</p>
            <p><strong>Khuyến mãi:</strong> {(isEditing ? calculateTotal().promotionDiscount : promotionDiscount).toLocaleString("vi-VN")} VND</p>
            <p className="total"><strong>Tổng thanh toán:</strong> {(isEditing ? calculateTotal().total : totalPayment).toLocaleString("vi-VN")} VND</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
