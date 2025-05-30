import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiProduct from "../../api/apiProduct";
import { postalCodes } from "../../mock/mock";
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
  const [customerType, setCustomerType] = useState("individual");
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
  const [phoneError, setPhoneError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validatePostalCode = (postalCode) => {
    if (!postalCode || !/^\d{5}$/.test(postalCode)) {
      setPostalCodeError("Mã bưu điện phải là 5 số");
      return;
    }

    const foundProvince = postalCodes.find(p => {
      const codes = p.code.split('-');
      if (codes.length === 1) {
        return postalCode === codes[0];
      } else {
        const [start, end] = codes;
        const currentCode = parseInt(postalCode);
        return currentCode >= parseInt(start) && currentCode <= parseInt(end);
      }
    });

    if (foundProvince) {
      setPostalCodeError("");
      const province = provinces.find(p =>
        p.name.toLowerCase().includes(foundProvince.province.toLowerCase()) ||
        foundProvince.province.toLowerCase().includes(p.name.toLowerCase())
      );

      if (province) {
        setCustomerAddress(prev => ({
          ...prev,
          province: province.code
        }));
      }
    } else {
      setPostalCodeError("Mã bưu điện không tồn tại");
    }
  };

  const [customerAddress, setCustomerAddress] = useState({
    streetAddress: "",
    province: "",
    district: "",
    ward: ""
  });
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [districtError, setDistrictError] = useState("");
  const [wardError, setWardError] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientPhoneError, setRecipientPhoneError] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethodError, setPaymentMethodError] = useState(false);
  const [paymentStatusError, setPaymentStatusError] = useState(false);
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
  const [grandTotal, setGrandTotal] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

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
    setPaymentStatus("");
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
    setCustomerAddress({
      streetAddress: "",
      province: "",
      district: "",
      ward: "",
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
    if (isCreating) return;
    setIsCreating(true);
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
        setPaymentMethodError(true);
        toast.warning("Vui lòng chọn hình thức thanh toán");
        return;
      }

      if (!paymentStatus) {
        setPaymentStatusError(true);
        toast.warning("Vui lòng chọn trạng thái thanh toán");
        return;
      }

      if (!shippingOption) {
        toast.warning("Vui lòng chọn hình thức vận chuyển");
        return;
      }

      if (shippingOption === "ship") {
        if (!recipientName || !recipientPhone || !recipientAddress) {
          toast.warning("Vui lòng điền đầy đủ thông tin người nhận hàng");
          return;
        }

        if (!selectedProvince || !selectedDistrict || !selectedWard) {
          toast.warning("Vui lòng chọn đầy đủ thông tin Tỉnh/Thành phố, Quận/Huyện và Phường/Xã");
          return;
        }

        // Refetch districts and wards to ensure we have fresh data
        try {
          const districtResponse = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
          const districts = districtResponse.data.districts;
          const districtData = districts.find(d => String(d.code) === String(selectedDistrict));

          if (!districtData) {
            toast.error("Không tìm thấy thông tin quận/huyện. Vui lòng thử lại.");
            return;
          }

          const wardResponse = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
          const wards = wardResponse.data.wards;
          const wardData = wards.find(w => String(w.code) === String(selectedWard));

          if (!wardData) {
            toast.error("Không tìm thấy thông tin phường/xã. Vui lòng thử lại.");
            return;
          }

          // Verify ward belongs to district
          if (String(wardData.district_code) !== String(selectedDistrict)) {
            toast.error("Phường/xã không thuộc quận/huyện đã chọn. Vui lòng kiểm tra lại.");
            return;
          }
        } catch (error) {
          console.error("Error validating location data:", error);
          toast.error("Có lỗi xảy ra khi xác thực thông tin địa chỉ. Vui lòng thử lại.");
          return;
        }
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
          (() => {
            const wardData = wards.find(w => w.code === selectedWard);
            const districtData = districts.find(d => d.code === selectedDistrict);
            const provinceData = provinces.find(p => p.code === selectedProvince);

            if (!wardData || !districtData || !provinceData) {
              return recipientAddress;
            }

            const wardPrefix = wardData.name.match(/^(Phường|Xã|Thị trấn)\s+/)?.[0] ||
              (wardData.division_type === 'xã' ? 'Xã ' :
                wardData.division_type === 'thị trấn' ? 'Thị trấn ' : 'Phường ');

            const districtPrefix = districtData.name.match(/^(Quận|Huyện|Thị xã)\s+/)?.[0] ||
              (districtData.division_type === 'huyện' ? 'Huyện ' :
                districtData.division_type === 'thị xã' ? 'Thị xã ' : 'Quận ');

            const provincePrefix = provinceData.name.match(/^(Thành phố|Tỉnh)\s+/)?.[0] ||
              (provinceData.division_type === 'tỉnh' ? 'Tỉnh ' : 'Thành phố ');

            const wardName = wardData.name.replace(/^(Phường|Xã|Thị trấn)\s+/, '');
            const districtName = districtData.name.replace(/^(Quận|Huyện|Thị xã)\s+/, '');
            const provinceName = provinceData.name.replace(/^(Thành phố|Tỉnh)\s+/, '');

            return `${recipientAddress}, ${wardPrefix}${wardName}, ${districtPrefix}${districtName}, ${provincePrefix}${provinceName}`;
          })()
          : recipientAddress,
        note,
        isPaid: paymentStatus === "daThanhToan",
        isDelivery: shippingOption === "ship",
        employeeName: selectedEmployee,
        province: provinces.find(p => p.code === selectedProvince)?.name || "",
        district: districts.find(d => d.code === selectedDistrict)?.name || "",
        ward: wards.find(w => w.code === selectedWard)?.name || "",
        discount: discount,
        total: grandTotal,
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
    } finally {
      setIsCreating(false);
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
          toast.error("Không thể tải danh sách khách hàng");
          setCustomers([]);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách khách hàng");
        setCustomers([]);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {
        toast.error("Không thể tải danh sách tỉnh thành");
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) {
        setDistricts([]);
        setSelectedDistrict("");
        setSelectedWard("");
        return;
      }

      setIsLoadingDistricts(true);
      try {
        console.log("Fetching districts for province:", selectedProvince);
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        console.log("Districts API response:", response.data);

        if (response.data && Array.isArray(response.data.districts)) {
          setDistricts(response.data.districts);
        } else {
          console.error("Invalid districts data:", response.data);
          toast.error("Dữ liệu quận huyện không hợp lệ. Vui lòng thử lại");
          setDistricts([]);
        }
        // Reset selections when province changes
        setSelectedDistrict("");
        setSelectedWard("");
        setWards([]);
      } catch (error) {
        console.error("Error loading districts:", error);
        toast.error("Không thể tải danh sách quận huyện. Vui lòng thử lại");
        setDistricts([]);
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchCustomerDistricts = async () => {
      if (!customerAddress.province) {
        setDistricts([]);
        setCustomerAddress(prev => ({ ...prev, district: "", ward: "" }));
        setDistrictError("");
        return;
      }

      setIsLoadingDistricts(true);
      setDistrictError("");

      try {
        console.log("Fetching districts for customer address, province:", customerAddress.province);
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${customerAddress.province}?depth=2`);
        console.log("Customer districts API response:", response.data);

        if (response.data && Array.isArray(response.data.districts)) {
          setDistricts(response.data.districts);
          if (response.data.districts.length === 0) {
            setDistrictError("Không tìm thấy quận huyện nào thuộc tỉnh/thành phố này");
          }
        } else {
          console.error("Invalid districts data for customer:", response.data);
          setDistrictError("Dữ liệu quận huyện không hợp lệ. Vui lòng thử lại");
          setCustomerAddress(prev => ({ ...prev, district: "", ward: "" }));
        }
      } catch (error) {
        console.error("Error loading districts:", error);
        setDistrictError("Không thể tải danh sách quận huyện. Vui lòng thử lại");
        setDistricts([]);
        setCustomerAddress(prev => ({ ...prev, district: "", ward: "" }));
      } finally {
        setIsLoadingDistricts(false);
      }
    };

    fetchCustomerDistricts();
  }, [customerAddress.province]);

  useEffect(() => {
    const fetchCustomerWards = async () => {
      if (!customerAddress.district) {
        setWards([]);
        setCustomerAddress(prev => ({ ...prev, ward: "" }));
        setWardError("");
        return;
      }

      setIsLoadingWards(true);
      setWardError("");

      try {
        console.log("Fetching wards for district:", customerAddress.district);
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${customerAddress.district}?depth=2`);
        console.log("Customer wards API response:", response.data);

        // Check if response.data exists and contains wards array, whether directly or nested
        const wardsData = response.data?.wards || (Array.isArray(response.data) ? response.data : []);

        if (wardsData && Array.isArray(wardsData)) {
          setWards(wardsData);
          if (wardsData.length === 0) {
            setWardError("Không tìm thấy phường/xã nào thuộc quận/huyện này");
          }
        } else {
          console.error("Invalid wards data:", response.data);
          setWardError("Dữ liệu phường/xã không hợp lệ. Vui lòng thử lại");
          setWards([]);
          setCustomerAddress(prev => ({ ...prev, ward: "" }));
        }
      } catch (error) {
        console.error("Error loading wards:", error);
        setWardError("Không thể tải danh sách phường xã. Vui lòng thử lại");
        setWards([]);
        setCustomerAddress(prev => ({ ...prev, ward: "" }));
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchCustomerWards();
  }, [customerAddress.district]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) {
        setWards([]);
        setSelectedWard("");
        setWardError("");
        return;
      }

      setIsLoadingWards(true);
      setWardError("");

      try {
        console.log("Fetching wards for district:", selectedDistrict);
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        console.log("Wards API response:", response.data);

        const wardsData = response.data?.wards || (Array.isArray(response.data) ? response.data : []);

        if (wardsData && Array.isArray(wardsData)) {
          setWards(wardsData);
          if (wardsData.length === 0) {
            setWardError("Không tìm thấy phường/xã nào thuộc quận/huyện này");
          }
          setSelectedWard("");
        } else {
          console.error("Invalid wards data:", response.data);
          setWardError("Dữ liệu phường/xã không hợp lệ. Vui lòng thử lại");
          setWards([]);
          setSelectedWard("");
        }
      } catch (error) {
        console.error("Error fetching wards:", error);
        setWardError("Không thể tải danh sách phường xã. Vui lòng thử lại");
        setWards([]);
        setSelectedWard("");
      } finally {
        setIsLoadingWards(false);
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

    try {
      const customerId = parseInt(value);
      setSelectedCustomerId(customerId);

      const selectedCustomer = customers.find((c) => c.ID === customerId);
      if (!selectedCustomer) return;

      setRecipientName(selectedCustomer.name ?? "");
      setRecipientPhone(selectedCustomer.phoneNumber ?? "");

      if (selectedCustomer.address) {
        const address = selectedCustomer.address;
        setShippingOption("ship");
        setRecipientAddress(address);

        const addressParts = address.split(",").map(part => part.trim());
        if (addressParts.length >= 4) {
          const lastParts = addressParts.slice(-3);

          const foundProvince = provinces.find(p =>
            lastParts[2].toLowerCase().includes(p.name.toLowerCase())
          );

          if (foundProvince) {
            setSelectedProvince(foundProvince.code);

            try {
              const districtRes = await axios.get(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`);
              const districts = districtRes.data.districts;

              const foundDistrict = districts.find(d =>
                lastParts[1].toLowerCase().includes(d.name.toLowerCase())
              );

              if (foundDistrict) {
                setSelectedDistrict(foundDistrict.code);

                const wardRes = await axios.get(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`);
                const wards = wardRes.data.wards;

                const foundWard = wards.find(w =>
                  lastParts[0].toLowerCase().includes(w.name.toLowerCase())
                );

                if (foundWard) {
                  setSelectedWard(foundWard.code);
                }
              }
            } catch (error) {
              console.error("Error loading address details:", error);
            }
          }
        }
      }

    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin khách hàng");
    }
  };

  const handleCreateNewCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.phoneNumber) {
        toast.warning("Vui lòng nhập đầy đủ thông tin khách hàng mới");
        return;
      }

      if (!customerAddress.streetAddress) {
        toast.warning("Vui lòng nhập địa chỉ");
        return;
      }

      if (!customerAddress.ward || !customerAddress.district || !customerAddress.province) {
        toast.warning("Vui lòng chọn đầy đủ Phường/Xã, Quận/Huyện và Tỉnh/Thành phố");
        return;
      }

      if (newCustomer.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(newCustomer.email)) {
          toast.warning("Email không hợp lệ");
          return;
        }
      }

      const provinceData = provinces.find(p => p.code === customerAddress.province);
      if (!provinceData) {
        toast.error("Không tìm thấy thông tin tỉnh/thành phố. Vui lòng chọn lại");
        return;
      }

      const districtResponse = await axios.get(
        `https://provinces.open-api.vn/api/p/${customerAddress.province}?depth=2`
      );
      const districtData = districtResponse.data.districts.find(
        d => d.code === customerAddress.district
      );
      if (!districtData) {
        toast.error("Không tìm thấy thông tin quận/huyện. Vui lòng chọn lại");
        return;
      }

      const wardResponse = await axios.get(
        `https://provinces.open-api.vn/api/d/${customerAddress.district}?depth=2`
      );
      const wardData = wardResponse.data.wards.find(
        w => String(w.code) === String(customerAddress.ward)
      );
      if (!wardData) {
        toast.error("Không tìm thấy thông tin phường/xã. Vui lòng chọn lại");
        return;
      }

      const wardPrefix = wardData.division_type === 'xã' ? 'Xã ' :
        wardData.division_type === 'thị trấn' ? 'Thị trấn ' : 'Phường ';
      const districtPrefix = districtData.division_type === 'huyện' ? 'Huyện ' :
        districtData.division_type === 'thị xã' ? 'Thị xã ' : 'Quận ';
      const provincePrefix = provinceData.division_type === 'tỉnh' ? 'Tỉnh ' : 'Thành phố ';

      const wardName = wardData.name.replace(/^(Phường|Xã|Thị trấn)\s+/, '');
      const districtName = districtData.name.replace(/^(Quận|Huyện|Thị xã)\s+/, '');
      const provinceName = provinceData.name.replace(/^(Thành phố|Tỉnh)\s+/, '');

      const fullAddress = `${customerAddress.streetAddress}, ${wardPrefix}${wardName}, ${districtPrefix}${districtName}, ${provincePrefix}${provinceName}`;

      const customerData = {
        name: newCustomer.name.trim(),
        phoneNumber: newCustomer.phoneNumber.trim(),
        organization: newCustomer.organizationName.trim(),
        tax: newCustomer.taxCode.trim(),
        email: newCustomer.email.trim(),
        address: fullAddress.trim(),
        postalCode: newCustomer.postalCode.trim(),
        notes: newCustomer.note.trim(),
        bonusPoints: 0,
      };

      const createdCustomer = await apiCustomer.create(customerData);

      setCustomers(prevCustomers => [...prevCustomers, createdCustomer]);
      setSelectedCustomerId(createdCustomer.ID);
      setShowCustomerPopup(false);

      setRecipientName(createdCustomer.name);
      setRecipientPhone(createdCustomer.phoneNumber);
      setRecipientAddress(fullAddress);
      setShippingOption("ship");
      setSelectedProvince(customerAddress.province);
      setSelectedDistrict(customerAddress.district);
      setSelectedWard(customerAddress.ward);

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

      setCustomerAddress({
        streetAddress: "",
        province: "",
        district: "",
        ward: "",
      });

      toast.success("Tạo khách hàng mới thành công");
    } catch (error) {
      console.error("Error creating customer:", error);
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
              <span onClick={() => setShowCustomerPopup(false)}>×</span>
            </div>
            <div className="popup-body">
              <div className="form-group">
                <label className="customer-type-label">Loại khách hàng</label>
                <div className="customer-type-options">
                  <label>
                    <input
                      type="radio"
                      name="customerType"
                      value="individual"
                      checked={customerType === "individual"}
                      onChange={(e) => {
                        setCustomerType(e.target.value);
                        if (e.target.value === "individual") {
                          setNewCustomer({ ...newCustomer, organizationName: "", taxCode: "" });
                        }
                      }}
                    /> Cá nhân
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="customerType"
                      value="organization"
                      checked={customerType === "organization"}
                      onChange={(e) => setCustomerType(e.target.value)}
                    /> Tổ chức
                  </label>
                </div>
              </div>
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
                <div className="input-phone">
                  <input
                    type="text"
                    value={newCustomer.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length > 10) return;
                      setNewCustomer({ ...newCustomer, phoneNumber: value });
                      if (value.length > 0 && value.length !== 10) {
                        setPhoneError("Số điện thoại phải có 10 số");
                      } else {
                        setPhoneError("");
                      }
                    }}
                    placeholder="Nhập số điện thoại"
                  />
                  {phoneError && <span className="error-message">{phoneError}</span>}
                </div>
              </div>
              {customerType === "organization" && (
                <>
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
                </>
              )}
              <div className="form-group">
                <label>Mã bưu điện</label>
                <div className="input-postcode">
                  <input
                    type="text"
                    value={newCustomer.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length > 5) return;
                      setNewCustomer({ ...newCustomer, postalCode: value });
                      if (value.length === 5) {
                        validatePostalCode(value);
                      } else if (value.length > 0) {
                        setPostalCodeError("Mã bưu điện phải là 5 số");
                      } else {
                        setPostalCodeError("");
                      }
                    }}
                    placeholder="Nhập mã bưu điện"
                  />
                  {postalCodeError && <span className="error-message">{postalCodeError}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={customerAddress.streetAddress}
                  onChange={(e) => setCustomerAddress({
                    ...customerAddress,
                    streetAddress: e.target.value
                  })}
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <select
                  value={customerAddress.province}
                  onChange={(e) => {
                    setCustomerAddress({
                      ...customerAddress,
                      province: e.target.value,
                      district: "",
                      ward: ""
                    });
                  }}
                  disabled={newCustomer.postalCode && newCustomer.postalCode.length === 5 && !postalCodeError}
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
                  value={customerAddress.district}
                  onChange={(e) => {
                    setCustomerAddress({
                      ...customerAddress,
                      district: e.target.value,
                      ward: ""
                    });
                    setDistrictError("");
                  }}
                  disabled={!customerAddress.province || isLoadingDistricts}
                >
                  <option value="">
                    {isLoadingDistricts
                      ? "Đang tải danh sách quận/huyện..."
                      : "Chọn Quận/Huyện"}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {districtError && <div className="error-message">{districtError}</div>}
              </div>
              <div className="form-group">
                <label>Phường/Xã</label>
                <select
                  value={customerAddress.ward || ""}
                  onChange={(e) => {
                    const selectedWardCode = e.target.value;
                    console.log("Selected ward code:", selectedWardCode);
                    const selectedWard = wards.find(w => String(w.code) === String(selectedWardCode));
                    console.log("Found ward:", selectedWard);
                    if (selectedWard) {
                      setCustomerAddress(prev => ({
                        ...prev,
                        ward: selectedWardCode
                      }));
                      setWardError("");
                    } else {
                      setCustomerAddress(prev => ({
                        ...prev,
                        ward: ""
                      }));
                      setWardError("Vui lòng chọn phường/xã hợp lệ");
                    }
                  }}
                  disabled={!customerAddress.district || isLoadingWards}
                >
                  <option value="">
                    {isLoadingWards
                      ? "Đang tải danh sách phường/xã..."
                      : "Chọn Phường/Xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {wardError && <div className="error-message">{wardError}</div>}
              </div>

              <div className="form-group">
                <label style={{ width: '120px' }}>Email</label>
                <div className="input-email">
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewCustomer({ ...newCustomer, email: value });
                      if (value && !value.includes('@')) {
                        setEmailError("Email phải chứa kí tự @");
                      } else {
                        setEmailError("");
                      }
                    }}
                    placeholder="Nhập email"
                  />
                  {emailError && <span className="error-message">{emailError}</span>}
                </div>
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
        <button className="create" onClick={handleCreateInvoice} disabled={isCreating}>
          <img src={createIcon} alt="Tạo" /> {isCreating ? "Đang tạo..." : "Tạo hoá đơn"}
        </button>
      </div>
      <div className="section">
        <div className="section-1">
          <div className="form-group">
            <label>Nhân viên bán</label>
            <input
              type="text"
              value={selectedEmployee}
              disabled
            />
          </div>
          <div className="form-group"></div>
          <div className="form-group customer-select">
            <label>Khách hàng <span className="required">*</span></label>
            <select
              name="customer"
              value={selectedCustomerId || ""}
              onChange={handleCustomerChange}
              disabled={isLoadingCustomers}
              className="customer-select"
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
            <label className="shipping-label">Vận chuyển</label>

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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length > 10) return;
                    setRecipientPhone(value);
                    if (value.length > 0 && value.length !== 10) {
                      setRecipientPhoneError("Số điện thoại phải có 10 số");
                    } else {
                      setRecipientPhoneError("");
                    }
                  }}
                  placeholder="Nhập số điện thoại người nhận"
                />
                {recipientPhoneError && <span className="error-message">{recipientPhoneError}</span>}
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
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setDistrictError("");
                  }}
                  disabled={!selectedProvince || isLoadingDistricts}
                >
                  <option value="">
                    {isLoadingDistricts
                      ? "Đang tải danh sách quận/huyện..."
                      : "Chọn Quận/Huyện"}
                  </option>
                  {districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {districtError && <div className="error-message">{districtError}</div>}
              </div>
              <div className="form-group">
                <label>Phường/Xã</label>
                <select
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    setWardError("");
                  }}
                  disabled={!selectedDistrict || isLoadingWards}
                >
                  <option value="">
                    {isLoadingWards
                      ? "Đang tải danh sách phường/xã..."
                      : "Chọn Phường/Xã"}
                  </option>
                  {wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {wardError && <div className="error-message">{wardError}</div>}
              </div>
            </>
          )}
        </div>
        <div className="form-group-col">
          <div className="checkbox-group">
            <label className="payment-label">Hình thức thanh toán</label>

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
          <div className="checkbox-group">
            <label className="status-label">Trạng thái thanh toán</label>
            <div className={`radio-group ${paymentStatusError ? 'error' : ''}`}>
              <label>
                <input
                  type="radio"
                  name="paymentStatus"
                  value="chuaThanhToan"
                  checked={paymentStatus === "chuaThanhToan"}
                  onChange={(e) => {
                    setPaymentStatus(e.target.value);
                    setPaymentStatusError(false);
                  }}
                /> Chưa thanh toán
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentStatus"
                  value="daThanhToan"
                  checked={paymentStatus === "daThanhToan"}
                  onChange={(e) => {
                    setPaymentStatus(e.target.value);
                    setPaymentStatusError(false);
                  }}
                /> Đã thanh toán
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="note-label">Ghi chú</label>
            <input
              type="text"
              className="note-input"
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
                    className="delete-icon"
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
              <option value="0">0%</option>
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
