import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import apiInvoice from "../../api/apiInvoice";
import apiCustomer from "../../api/apiCustomer";
import apiProductCategory from "../../api/apiProductCategory";
import apiPromotion from "../../api/apiPromotion";
import "./createInvoice.scss";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phoneNumber: "",
    organizationName: "",
    taxCode: "",
    address: "",
    postalCode: "",
    note: "",
    email: "",
    bonusPoints: 0,
  });
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [note, setNote] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingOption, setShippingOption] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [vatRate, setVatRate] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [vat, setVat] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await apiPromotion.getAll();
        console.log("Promotions response:", response);
        if (Array.isArray(response)) {
          const today = new Date();
          const activePromotions = response.filter(promo => new Date(promo.dateEnd) > today);
          console.log("Active promotions:", activePromotions);
          setPromotions(activePromotions);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotions([]);
      }
    };
    fetchPromotions();
  }, []);



  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

  const addProductToInvoice = () => {
    if (!selectedProduct) {
      toast.warning("Vui lòng chọn sản phẩm");
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      toast.warning("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    const existingItemIndex = invoiceItems.findIndex(item => item.id === selectedProduct.ID);

    if (existingItemIndex >= 0) {
      const updatedItems = [...invoiceItems];
      const updatedItem = updatedItems[existingItemIndex];
      updatedItem.quantity += quantity;
      updatedItem.total = updatedItem.price * updatedItem.quantity;
      setInvoiceItems(updatedItems);
      setQuantity(1); 
    } else {
      const newItem = {
        id: selectedProduct.ID,
        name: selectedProduct.name,
        unit: selectedProduct.unit || "N/A",
        quantity: quantity,
        price: selectedProduct.outPrice,
        total: selectedProduct.outPrice * quantity,
      };
      setInvoiceItems([...invoiceItems, newItem]);
      setQuantity(1);
    }
  };

  const handleProductChange = (e) => {
    const selectedProductId = parseInt(e.target.value);
    if (!selectedProductId || isNaN(selectedProductId)) {
      setSelectedProduct(null);
      return;
    }

    const product = products.find(p => p.ID === selectedProductId);
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
      toast.error("Không thể tìm thấy sản phẩm");
    }
  };

  const resetForm = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setInvoiceItems([]);
    setSelectedCategory("");
    setSelectedProduct(null);
    setQuantity(1);
    setShippingOption("");
    setPaymentMethod("");
    setSelectedPromotion(null);
    setVatRate(10);
    setRecipientName("");
    setRecipientPhone("");
    setRecipientAddress("");
    setNote("");
    setIsPaid(false);
    setSelectedCustomerId("");
    setNewCustomer({
      name: "",
      phoneNumber: "",
      organizationName: "",
      taxCode: "",
      address: "",
      postalCode: "",
      note: "",
      email: "",
      bonusPoints: 0,
    });
  };
  useEffect(() => {
    const vatValue = (totalAmount * vatRate) / 100;
    const discountValue = selectedPromotion
      ? selectedPromotion.type === "percentage"
        ? (totalAmount * selectedPromotion.value) / 100
        : selectedPromotion.value * 1000
      : 0;
    const finalTotal = Math.max(0, totalAmount + vatValue - discountValue);

    setVat(vatValue);
    setDiscount(Math.min(discountValue, totalAmount + vatValue));
    setGrandTotal(finalTotal);
  }, [totalAmount, vatRate, selectedPromotion]);

  const handleCreateInvoice = async () => {
    try {
      if (!selectedCustomerId) {
        toast.warning("Vui lòng chọn khách hàng");
        return;
      }

      if (invoiceItems.length === 0) {
        toast.warning("Vui lòng thêm ít nhất một sản phẩm");
        return;
      }

      if (!paymentMethod) {
        toast.warning("Vui lòng chọn hình thức thanh toán");
        return;
      }

      if (!shippingOption) {
        toast.warning("Vui lòng chọn hình thức vận chuyển");
        return;
      }

      if (
        shippingOption === "ship" &&
        (!recipientName ||
          !recipientPhone ||
          !recipientAddress ||
          !selectedProvince ||
          !selectedDistrict ||
          !selectedWard)
      ) {
        toast.warning("Vui lòng điền đầy đủ thông tin giao hàng");
        return;
      }

      const bonusPoints = Math.floor(grandTotal / 100);

      const invoiceData = {
        customerId: selectedCustomerId,
        recipientName,
        recipientPhone,
        recipientAddress,
        note,
        isPaid,
        isDelivery: shippingOption === "ship",
        paymentMethod,
        employeeName: selectedEmployee,
        items: invoiceItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        province:
          provinces.find((p) => p.code === selectedProvince)?.name || "",
        district:
          districts.find((d) => d.code === selectedDistrict)?.name || "",
        ward: wards.find((w) => w.code === selectedWard)?.name || "",
        vat: vatRate,
        discount: discount,
        promotionId: selectedPromotion?.ID,
        totalAmount: grandTotal,
        bonusPoints: bonusPoints,
      };

      const createdInvoice = await apiInvoice.create(invoiceData);

      const selectedCustomer = customers.find(
        (c) => c.id === selectedCustomerId
      );
      if (selectedCustomer) {
        const updatedBonusPoints = selectedCustomer.bonusPoints + bonusPoints;
        await apiCustomer.update(selectedCustomerId, {
          ...selectedCustomer,
          bonusPoints: updatedBonusPoints,
        });
        toast.success(`Khách hàng được cộng ${bonusPoints} điểm thưởng`);
      }

      toast.success("Tạo hóa đơn thành công");
      navigate("/invoices");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo hóa đơn");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiProductCategory.getAll();
        if (Array.isArray(response)) {
          setCategories(response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await apiCustomer.getAll();
        if (Array.isArray(response)) {
          setCustomers(response);
        } else {
          console.error("Invalid response format for customers:", response);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((response) => {
        setProvinces(response.data);
      })
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => {
          setDistricts(response.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        })
        .catch((error) => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => {
          setWards(response.data.wards);
          setSelectedWard("");
        })
        .catch((error) => console.error("Error fetching wards:", error));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.name) {
      setSelectedEmployee(user.name);
    }
  }, []);

  useEffect(() => {
    if (shippingOption === "noShip" && paymentMethod === "cod") {
      setPaymentMethod("");
      toast.info(
        "Hình thức thanh toán COD đã bị hủy do không chọn ship hàng"
      );
    }
  }, [shippingOption]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setSelectedProduct(null);
    setProducts([]);

    if (value) {
      const categoryId = parseInt(value);
      if (!isNaN(categoryId)) {
        const selectedCat = categories.find(cat => cat.ID === categoryId);
        if (selectedCat && Array.isArray(selectedCat.Products)) {
          setProducts(selectedCat.Products);
        } else {
          setProducts([]);
          toast.error("Không tìm thấy sản phẩm trong loại này");
        }
      }
    } else {
      setProducts([]);
    }
  };

  const removeItem = (indexToRemove) => {
    setInvoiceItems(
      invoiceItems.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleCustomerChange = (e) => {
    const value = e.target.value;

    if (value === "new") {
      setShowCustomerPopup(true);
      setSelectedCustomerId("");
      setRecipientName("");
      setRecipientPhone("");
      setRecipientAddress("");
      return;
    }

    if (!value) {
      setSelectedCustomerId("");
      setRecipientName("");
      setRecipientPhone("");
      setRecipientAddress("");
      return;
    }

    setSelectedCustomerId(value);

    const selectedCustomer = customers.find((c) => c.id === value);
    if (selectedCustomer) {
      setRecipientName(selectedCustomer.name ?? "");
      setRecipientPhone(selectedCustomer.phoneNumber ?? "");
      setRecipientAddress(selectedCustomer.address ?? "");
    }
  };

  const handleCreateNewCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.phoneNumber) {
        toast.warning("Vui lòng nhập đầy đủ thông tin khách hàng mới");
        return;
      }
      const customerData = {
        name: newCustomer.name,
        phoneNumber: newCustomer.phoneNumber,
        organization: newCustomer.organizationName,
        tax: newCustomer.taxCode,
        email: newCustomer.email,
        address: newCustomer.address,
        postalCode: newCustomer.postalCode,
        notes: newCustomer.note,
        bonusPoints: 0,
      };
      const createdCustomer = await apiCustomer.create(customerData);
      setCustomers([...customers, createdCustomer]);
      setSelectedCustomerId(createdCustomer.id);
      setShowCustomerPopup(false);

      setRecipientName(createdCustomer.name);
      setRecipientPhone(createdCustomer.phoneNumber);
      setRecipientAddress(createdCustomer.address || "");
      setNewCustomer({
        name: "",
        phoneNumber: "",
        organizationName: "",
        taxCode: "",
        address: "",
        postalCode: "",
        note: "",
        email: "",
        bonusPoints: 0,
      });
      toast.success("Tạo khách hàng mới thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo khách hàng mới");
    }
  };

  return (
    <div className="invoice-container">
      {showCustomerPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Thêm khách hàng mới</h3>
              <span onClick={() => setShowCustomerPopup(false)} style={{ cursor: "pointer", fontSize: "20px", fontWeight: "bold" }}>×</span>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label>Tên khách hàng</label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={newCustomer.phoneNumber}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="form-group">
                <label>Tên tổ chức</label>
                <input
                  type="text"
                  value={newCustomer.organizationName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, organizationName: e.target.value })}
                  placeholder="Nhập tên tổ chức"
                />
              </div>
              <div className="form-group">
                <label>Mã số thuế</label>
                <input
                  type="text"
                  value={newCustomer.taxCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, taxCode: e.target.value })}
                  placeholder="Nhập mã số thuế"
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="form-group">
                <label>Mã bưu điện</label>
                <input
                  type="text"
                  value={newCustomer.postalCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, postalCode: e.target.value })}
                  placeholder="Nhập mã bưu điện"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Nhập email"
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <input
                  type="text"
                  value={newCustomer.note}
                  onChange={(e) => setNewCustomer({ ...newCustomer, note: e.target.value })}
                  placeholder="Nhập ghi chú"
                />
              </div>
              <div className="popup-actions">
                <button className="btn-cancel" onClick={() => setShowCustomerPopup(false)}>Hủy</button>
                <button className="btn-create" onClick={handleCreateNewCustomer}>Tạo</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="header">
        <div className="back" onClick={() => navigate("/invoices")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Tạo đơn hàng</h2>
      </div>
      <div className="actions">
        <button className="delete" onClick={resetForm}>
          <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
        </button>
        <button className="create" onClick={handleCreateInvoice}><img src={createIcon} alt="Tạo" /> Tạo hoá đơn</button>
      </div>
      <div className="section">
        <div className="section-1">
          <div className="form-group">
            <label>Nhân viên bán</label>
            <input
              type="text"
              value={selectedEmployee}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </div>
          <div className="form-group"></div>
          <div className="form-group">
            <label>Khách hàng</label>
            <select
              value={selectedCustomerId || ""}
              onChange={handleCustomerChange}
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phoneNumber || 'No phone'}
                </option>
              ))}
              <option value="new">+ Thêm khách hàng mới</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label style={{ fontWeight: 700, color: "#163020", marginRight: "100px" }}>Vận chuyển</label>

            <label>
              <input
                type="radio"
                name="shippingOption"
                value="ship"
                checked={shippingOption === "ship"}
                onChange={() => setShippingOption("ship")}
              /> Ship hàng
            </label>

            <label>
              <input
                type="radio"
                name="shippingOption"
                value="noShip"
                checked={shippingOption === "noShip"}
                onChange={() => {
                  setShippingOption("noShip");
                  setRecipientName("");
                  setRecipientPhone("");
                  setRecipientAddress("");
                  setSelectedProvince("");
                  setSelectedDistrict("");
                  setSelectedWard("");
                }}
              /> Không ship hàng
            </label>
          </div>
          {shippingOption === "ship" && (
            <>
              <div className="form-group">
                <label>Tên người nhận</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>SĐT người nhận</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ người nhận</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quận/Huyện</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedProvince}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Phường/Xã</label>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  disabled={!selectedDistrict}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        <div className="form-group-col">
          <div className="checkbox-group">
            <label style={{ fontWeight: 700, color: "#163020", margin: "10px 30px 0 0" }}>Hình thức thanh toán</label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="chuyenKhoan"
                checked={paymentMethod === "chuyenKhoan"}
                onChange={() => setPaymentMethod("chuyenKhoan")}
              /> Chuyển khoản
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="tienMat"
                checked={paymentMethod === "tienMat"}
                onChange={() => setPaymentMethod("tienMat")}
              /> Tiền mặt
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                disabled={shippingOption !== "ship"}
                onChange={() => {
                  if (shippingOption === "ship") {
                    setPaymentMethod("cod");
                  } else {
                    toast.warning("COD chỉ khả dụng khi chọn ship hàng");
                  }
                }}
              /> COD
            </label>
          </div>
          <div className="form-group"></div>
          <div className="form-group">
            <label style={{ margin: "20px 0", width: "20%" }}>Trạng thái</label>
            <label style={{ fontWeight: "normal", }}>
              <input
                type="checkbox"
                style={{ width: "10%" }}
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
              /> Đã thanh toán
            </label>
          </div>
          <div className="form-group">
            <label style={{ width: "20%" }}>Ghi chú</label>
            <input
              type="text"
              style={{ width: "80%" }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section-2">
        <h3 className="subtitle">Chi tiết hóa đơn</h3>
        <div className="section-3">
          <div className="form-group">
            <label>Loại sản phẩm</label>
            <select onChange={handleCategoryChange} value={selectedCategory}>
              <option value="">Chọn loại</option>
              {categories.map((category) => (
                <option key={category.ID} value={category.ID}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <select
              onChange={handleProductChange}
              value={selectedProduct?.ID || ""}
              disabled={!selectedCategory}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
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
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>
          <button className="btn btn-success" onClick={addProductToInvoice}>
            ➕ Thêm sản phẩm
          </button>
        </div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Đơn vị</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.unit}</td>
                <td>{item.quantity}</td>
                <td>{item.price.toLocaleString()} VND</td>
                <td>{item.total.toLocaleString()} VND</td>
                <td>
                  <img
                    src={cancelIcon}
                    alt="Xóa"
                    style={{ cursor: "pointer" }}
                    onClick={() => removeItem(index)}
                  />
                </td>

              </tr>
            ))}
          </tbody>
        </table>
        <div className="section-4">
          <div className="form-group">
            <label>Khuyến mãi</label>
            <select
              value={selectedPromotion?.ID || ""}
              onChange={(e) => {
                const promoId = parseInt(e.target.value);
                const promo = promotions.find(p => p.ID === promoId);
                setSelectedPromotion(promo || null);
              }}
            >
              <option value="">Không áp dụng</option>
              {promotions.map((promotion) => (
                <option key={promotion.ID} value={promotion.ID}>
                  {promotion.name} ({promotion.value}{promotion.type === "percentage" ? "%" : "k"})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Thuế VAT (%)</label>
            <select
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
            >
              <option value="5">5%</option>
              <option value="8">8%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
            </select>
          </div>
        </div>

        <div className="summary">
          <p>Tổng tiền hàng: {totalAmount.toLocaleString()} VND</p>
          <p>Thuế giá trị gia tăng: {vat.toLocaleString()} VND</p>
          <p>Khuyến mãi: {discount.toLocaleString()} VND</p>
          <h3 className="total">Tổng thanh toán: {grandTotal.toLocaleString()} VND</h3>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
