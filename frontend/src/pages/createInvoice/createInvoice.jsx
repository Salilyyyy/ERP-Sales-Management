import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiProduct from "../../api/apiProduct";
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
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
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
  const [shippingOption, setShippingOption] = useState("noShip");
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

    if (selectedProduct.quantity < quantity) {
      toast.warning(`Số lượng sản phẩm ${selectedProduct.name} không đủ. Chỉ còn ${selectedProduct.quantity} sản phẩm.`);
      return;
    }

    const existingItemIndex = invoiceItems.findIndex(item => item.id === selectedProduct.ID);

    if (existingItemIndex >= 0) {
      const updatedItems = [...invoiceItems];
      const updatedItem = updatedItems[existingItemIndex];
      const newQuantity = updatedItem.quantity + quantity;

      if (newQuantity > selectedProduct.quantity) {
        toast.warning(`Số lượng sản phẩm ${selectedProduct.name} không đủ. Chỉ còn ${selectedProduct.quantity} sản phẩm.`);
        return;
      }

      updatedItem.quantity = newQuantity;
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
        customerID: parseInt(selectedCustomerId),
        promotionID: selectedPromotion?.ID || null,
        paymentMethod,
        tax: vatRate,
        exportTime: new Date(),
        details: invoiceItems.map((item) => ({
          productID: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        recipientName,
        recipientPhone,
        recipientAddress: shippingOption === "ship" ? 
          [
            recipientAddress,
            wards.find((w) => w.code === selectedWard)?.name,
            districts.find((d) => d.code === selectedDistrict)?.name,
            provinces.find((p) => p.code === selectedProvince)?.name
          ].filter(Boolean).map(part => part.trim()).join(", ")
          : recipientAddress,
        note,
        isPaid,
        isDelivery: shippingOption === "ship",
        employeeName: selectedEmployee,
        province: "",
        district: "",
        ward: "",
        discount: discount,
        totalAmount: grandTotal,
        bonusPoints: bonusPoints,
      };

      const createdInvoice = await apiInvoice.create(invoiceData);

      for (const item of invoiceItems) {
        const currentProduct = products.find(p => p.ID === item.id);
        if (currentProduct) {
          const updatedQuantity = currentProduct.quantity - item.quantity;
          if (updatedQuantity < 0) {
            throw new Error(`Số lượng sản phẩm ${currentProduct.name} không đủ để tạo hoá đơn`);
          }
          await apiProduct.update(item.id, {
            ...currentProduct,
            quantity: updatedQuantity
          });
        }
      }

      const selectedCustomer = customers.find(
        (c) => c.ID === selectedCustomerId
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
      setIsLoadingCustomers(true);
      try {
        const response = await apiCustomer.getAll();
        if (Array.isArray(response)) {
          setCustomers(response);
        } else {
          console.error("Invalid response format for customers:", response);
          toast.error("Không thể tải danh sách khách hàng");
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
        setCustomers([]);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch provinces data
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh thành");
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) return;
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        setDistricts(response.data.districts);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      } catch (error) {
        console.error("Error fetching districts:", error);
        toast.error("Không thể tải danh sách quận huyện");
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) return;
      try {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        setWards(response.data.wards);
        setSelectedWard("");
      } catch (error) {
        console.error("Error fetching wards:", error);
        toast.error("Không thể tải danh sách phường xã");
      }
    };
    fetchWards();
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

  const handleCustomerChange = async (e) => {
    const value = e.target.value;

    if (value === "new" || !value) {
      setShowCustomerPopup(value === "new");
      setSelectedCustomerId("");
      setRecipientName("");
      setRecipientPhone("");
      setRecipientAddress("");
      setShippingOption("noShip");
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedWard("");
      return;
    }

    const customerId = parseInt(value);
    setSelectedCustomerId(customerId);

    const selectedCustomer = customers.find((c) => c.ID === customerId);
    if (selectedCustomer) {
      setRecipientName(selectedCustomer.name ?? "");
      setRecipientPhone(selectedCustomer.phoneNumber ?? "");

      // Parse customer address into components
      const address = selectedCustomer.address ?? "";
      const parts = address.split(",").map(part => part.trim());
      if (parts.length >= 4) {
        setShippingOption("ship"); // Enable shipping to show the address fields
        setRecipientAddress(parts[0]); // Street address

        // Find and set province first
        const provinceName = parts[3];
        console.log("Looking for province:", provinceName);
        console.log("Provinces:", provinces);
        console.log("Parts:", parts);
        const foundProvince = provinces.find(p => {
          console.log("Checking province:", p.name);
          const normalizedProvinceName = p.name.toLowerCase()
            .replace(/thành phố /g, '')
            .replace(/tỉnh /g, '')
            .trim();
          const normalizedSearchName = provinceName.toLowerCase()
            .replace(/thành phố /g, '')
            .replace(/tỉnh /g, '')
            .trim();
          return normalizedProvinceName === normalizedSearchName;
        });
        if (foundProvince) {
          setSelectedProvince(foundProvince.code);

          // Fetch districts for this province
          try {
            const response = await axios.get(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`);
            setDistricts(response.data.districts);

            // Find and set district
            const districtName = parts[2];
            console.log("Districts:", response.data.districts);
            const foundDistrict = response.data.districts.find(d => {
              console.log("Checking district:", d.name);
              const normalizedDistrictName = d.name.toLowerCase()
                .replace(/quận /g, '')
                .replace(/huyện /g, '')
                .trim();
              const normalizedSearchName = districtName.toLowerCase()
                .replace(/quận /g, '')
                .replace(/huyện /g, '')
                .trim();
              return normalizedDistrictName === normalizedSearchName;
            });
            if (foundDistrict) {
              setSelectedDistrict(foundDistrict.code);

              // Fetch wards for this district
              try {
                const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`);
                setWards(wardResponse.data.wards);

                // Find and set ward
                const wardName = parts[1];
                console.log("Wards:", wardResponse.data.wards);
                const foundWard = wardResponse.data.wards.find(w => {
                  console.log("Checking ward:", w.name);
                  const normalizedWardName = w.name.toLowerCase()
                    .replace(/phường /g, '')
                    .replace(/xã /g, '')
                    .trim();
                  const normalizedSearchName = wardName.toLowerCase()
                    .replace(/phường /g, '')
                    .replace(/xã /g, '')
                    .trim();
                  return normalizedWardName === normalizedSearchName;
                });
                if (foundWard) {
                  setSelectedWard(foundWard.code);
                }
              } catch (error) {
                console.error("Error fetching wards:", error);
              }
            }
          } catch (error) {
            console.error("Error fetching districts:", error);
          }
        }
      } else {
        setRecipientAddress(address);
      }
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
      setSelectedCustomerId(createdCustomer.ID);
      setShowCustomerPopup(false);

      setRecipientName(createdCustomer.name);
      setRecipientPhone(createdCustomer.phoneNumber);
      
      // Format address properly for new customer
      const address = createdCustomer.address ?? "";
      const parts = address.split(",").map(part => part.trim());
      if (parts.length >= 4) {
        setShippingOption("ship");
        setRecipientAddress(parts[0]);
        // Try to match province/district/ward later when needed
      } else {
        setRecipientAddress(address);
        setShippingOption("noShip");
      }
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
          <div className="form-group customer-select">
            <label>Khách hàng <span style={{ color: 'red' }}>*</span></label>
            <select
              name="customer"
              value={selectedCustomerId || ""}
              onChange={handleCustomerChange}
              disabled={isLoadingCustomers}
              style={{ width: '60%' }}
            >
              <option value="">
                {isLoadingCustomers ? "Đang tải danh sách khách hàng..." : "Chọn khách hàng"}
              </option>
              {!isLoadingCustomers && customers.map((customer) => (
                <option key={customer.ID} value={customer.ID}>
                  {`${customer.name} - ${customer.phoneNumber || 'Không có SĐT'}`}
                </option>
              ))}
              {!isLoadingCustomers && <option value="new">+ Thêm khách hàng mới</option>}
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
                const value = e.target.value;
                if (!value) {
                  setSelectedPromotion(null);
                  return;
                }
                const promoId = parseInt(value);
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
