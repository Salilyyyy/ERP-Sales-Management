import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./createPostOffice.scss";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import PostOfficeRepository from "../../api/apiPostOffice";

const CreatePostOffice = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: ""
  });

  const validateForm = () => {
    const newErrors = {
      name: !name.trim() ? "Vui lòng nhập tên bưu cục" : "",
      phoneNumber: !phoneNumber ? "Vui lòng nhập số điện thoại" :
        !validatePhoneNumber(phoneNumber) ? "Số điện thoại phải có đúng 10 chữ số" : "",
      email: !email ? "Vui lòng nhập email" :
        !validateEmail(email) ? "Email không hợp lệ! Email phải chứa @ và ." : "",
      address: !address.trim() ? "Vui lòng nhập địa chỉ" : "",
      province: !selectedProvince ? "Vui lòng chọn tỉnh/thành phố" : "",
      district: !selectedDistrict ? "Vui lòng chọn quận/huyện" : "",
      ward: !selectedDistrict ? "Vui lòng chọn phường/xã" : ""
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error("Lỗi khi tải tỉnh/thành:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((response) => setDistricts(response.data.districts))
        .catch((error) => console.error("Lỗi khi tải quận/huyện:", error));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((response) => setWards(response.data.wards))
        .catch((error) => console.error("Lỗi khi tải xã/phường:", error));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setEmail("");
    setAddress("");
    setNote("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setDistricts([]);
    setWards([]);
    setErrors({
      name: "",
      phoneNumber: "",
      email: "",
      address: "",
      province: "",
      district: "",
      ward: ""
    });
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCreate = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      const data = {
        name,
        phoneNumber,
        email,
        address,
        note,
      };
      await PostOfficeRepository.create(data);
      navigate("/post-office");
    } catch (error) {
    }
  };

  return (
    <div className="supplier-form-container">
      <div className="header">
        <div className="back" onClick={() => navigate("/post-office")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Thêm mới bưu cục</h2>
      </div>

      <div className="actions">
        <button className="delete" onClick={resetForm}>
          <img src={deleteIcon} alt="Xóa" /> Xóa
        </button>
        <button className="create" onClick={handleCreate}>
          <img src={createIcon} alt="Tạo" /> Tạo
        </button>
      </div>

      <form className="customer-form">
        <div className="info-row">
          <div className="form-group">
            <label>Tên bưu cục <span className="required">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors(prev => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
        </div>

        <div className="info-row-1">
          <div className="form-group">
            <label>Điện thoại <span className="required">*</span></label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setPhoneNumber(value);
                  if (value.length > 0 && value.length !== 10) {
                    setErrors(prev => ({...prev, phoneNumber: "Số điện thoại phải có đúng 10 số"}));
                  } else {
                    setErrors(prev => ({...prev, phoneNumber: ""}));
                  }
                }
              }} 
              maxLength={10}
              placeholder="Nhập 10 số"
            />
            {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
          </div>
          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);
                if (value.length > 0 && !validateEmail(value)) {
                  setErrors(prev => ({...prev, email: "Email phải chứa @ và ."}));
                } else {
                  setErrors(prev => ({...prev, email: ""}));
                }
              }} 
              placeholder="example@domain.com"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
        </div>

        <div className="info-row-1">
          <div className="form-group">
            <label>Địa chỉ <span className="required">*</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrors(prev => ({ ...prev, address: "" }));
              }}
            />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </div>
          <div className="form-group select-group">
            <label>Tỉnh/ thành phố <span className="required">*</span></label>
            <select
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setErrors(prev => ({ ...prev, province: "", district: "", ward: "" }));
              }}
              value={selectedProvince}
              style={{ width: "215px" }}
            >
              <option value="">Chọn thành phố/tỉnh</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.province && <div className="error-message">{errors.province}</div>}
          </div>
        </div>

        <div className="info-row-1">
          <div className="form-group select-group">
            <label>Quận/ Huyện <span className="required">*</span></label>
            <select
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setErrors(prev => ({ ...prev, district: "", ward: "" }));
              }}
              value={selectedDistrict}
              disabled={!selectedProvince}
              style={{ width: "215px" }}
            >
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.district && <div className="error-message">{errors.district}</div>}
          </div>
          <div className="form-group select-group">
            <label>Xã/ Phường <span className="required">*</span></label>
            <select
              disabled={!selectedDistrict}
              style={{ width: "215px" }}
              value=""
              onChange={() => setErrors(prev => ({ ...prev, ward: "" }))}
            >
              <option value="">Chọn xã/phường</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.ward && <div className="error-message">{errors.ward}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>Ghi chú</label>
          <textarea className="notes" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
        </div>
      </form>
    </div>
  );
};

export default CreatePostOffice;
