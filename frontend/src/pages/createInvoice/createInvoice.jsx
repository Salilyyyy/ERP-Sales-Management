import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./createInvoice.scss";
import { productData, listEmployee } from "../../mock/mock";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import cancelIcon from "../../assets/img/cancel-icon.svg";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [shippingOption, setShippingOption] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [invoiceList, setInvoiceList] = useState([]);

  const addProductToInvoice = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm.");
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      alert("Vui lòng nhập số lượng hợp lệ.");
      return;
    }
    const newItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      unit: selectedProduct.unit || "N/A",
      quantity: quantity,
      price: selectedProduct.price,
      total: selectedProduct.price * quantity,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleProductChange = (e) => {
    const selectedProductId = Number(e.target.value);
    const product = productData[selectedCategory]?.find(
      (product) => product.id === selectedProductId
    );
    setSelectedProduct(product || null);
  };
  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setInvoiceItems([]);
    setSelectedCategory("");
    setSelectedProduct(null);
    setQuantity(1);
    setShippingOption("");
    setPaymentMethod("");
    setDiscountRate(0);
    setVatRate(5);
    document.querySelectorAll('input[type="text"], input[type="number"], select').forEach(input => {
      input.value = "";
    });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setSelectedCategory(selectedCategory);
    setSelectedProduct(null);
  };

  const removeItem = (indexToRemove) => {
    setInvoiceItems(invoiceItems.filter((_, index) => index !== indexToRemove));
  };


  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/p/")
      .then(response => {
        setProvinces(response.data);
      })
      .catch(error => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(response => {
          setDistricts(response.data.districts);
          setWards([]);
          setSelectedDistrict("");
          setSelectedWard("");
        })
        .catch(error => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(response => {
          setWards(response.data.wards);
          setSelectedWard("");
        })
        .catch(error => console.error("Error fetching wards:", error));
    }
  }, [selectedDistrict]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [vatRate, setVatRate] = useState(10);
  const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const discount = (totalAmount * discountRate) / 100;
  const vat = (totalAmount * vatRate) / 100;
  const grandTotal = totalAmount + vat - discount;
  return (
    <div className="invoice-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/categories")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Tạo đơn hàng</h2>
      </div>
      <div className="actions">
        <button className="delete" onClick={resetForm}>
          <img src={deleteIcon} alt="Xóa" /> Xóa nội dung
        </button>
        <button className="create"><img src={createIcon} alt="Tạo" /> Tạo hoá đơn</button>
      </div>
      <div className="section">
        <div className="section-1">
          <div className="form-group">
            <label>Nhân viên bán</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Chọn nhân viên</option>
              {listEmployee.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group"></div>
          <div className="form-group">
            <label>Tên khách hàng</label>
            <input type="text" />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="text" />
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
                onChange={() => setShippingOption("noShip")}
              /> Không ship hàng
            </label>
          </div>
          <div className="form-group"></div>
          <div className="form-group">
            <label>Tên người nhận</label>
            <input type="text" />
          </div>
          <div className="form-group">
            <label>SĐT người nhận</label>
            <input type="text" />
          </div>
          <div className="form-group">
            <label>Địa chỉ người nhận</label>
            <input type="text" />
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
                onChange={() => setPaymentMethod("cod")}
              /> COD
            </label>
          </div>
          <div className="form-group"></div>
          <div className="form-group">
            <label style={{ margin: "20px 0", width: "20%" }}>Trạng thái</label>
            <label style={{ fontWeight: "normal", }}>
              <input type="checkbox" style={{ width: "10%" }} /> Đã thanh toán
            </label>
          </div>
          <div className="form-group">
            <label style={{ width: "20%" }}>Ghi chú</label>
            <input type="text" style={{ width: "80%" }} />
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
              {Object.keys(productData).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tên sản phẩm</label>
            <select
              onChange={handleProductChange}
              value={selectedProduct?.id || ""}
              disabled={!selectedCategory}
            >
              <option value="">Chọn sản phẩm</option>
              {selectedCategory &&
                productData[selectedCategory].map((product) => (
                  <option key={product.id} value={product.id}>
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
            <label>Khuyến mãi (%)</label>
            <select value={discountRate} onChange={(e) => setDiscountRate(Number(e.target.value))}>
              <option value="0">0%</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
            </select>
          </div>

          <div className="form-group">
            <label>Thuế VAT (%)</label>
            <select value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))}>
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
}

export default CreateInvoice;
