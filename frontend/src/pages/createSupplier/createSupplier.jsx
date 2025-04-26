import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./createSupplier.scss";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import apiCountry from "../../api/apiCountry";
import apiSupplier from "../../api/apiSupplier";

const validatePhone = (phone) => {
  return /^\d*$/.test(phone);
};

const validateEmail = (email) => {
  return email.includes('@') && email.includes('.');
};

const CreateSupplier = () => {
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [repName, setRepName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repPhoneError, setRepPhoneError] = useState("");
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await apiCountry.getAll();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Get loading states from BaseRepository
  const countriesLoading = BaseRepository.getLoadingState('/countries');
  const provincesLoading = BaseRepository.getLoadingState('/provinces');
  const isLoading = countriesLoading || provincesLoading;

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (!validatePhone(value)) {
      setPhoneError("Vui lòng chỉ nhập số");
    } else {
      setPhoneError("");
    }
  };

  const handleRepPhoneChange = (e) => {
    const value = e.target.value;
    setRepPhone(value);
    if (!validatePhone(value)) {
      setRepPhoneError("Vui lòng chỉ nhập số");
    } else {
      setRepPhoneError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!validateEmail(value)) {
      setEmailError("Email phải chứa @ và .");
    } else {
      setEmailError("");
    }
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

  const validateForm = () => {
    let isValid = true;

    if (!name) {
      setName("");
      isValid = false;
    }
    if (!phone) {
      setPhone("");
      isValid = false;
    }
    if (!email) {
      setEmail("");
      isValid = false;
    }
    if (!country) {
      setCountry("");
      isValid = false;
    }
    if (!postalCode) {
      setPostalCode("");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc: Tên nhà cung cấp, Số điện thoại, Email, Quốc gia và Mã bưu chính");
      return;
    }

    if (phoneError || emailError || repPhoneError) {
      alert("Vui lòng kiểm tra lại các trường thông tin còn lỗi");
      return;
    }

    try {
      setIsSubmitting(true);

      const wardName = wards.find(w => w.code === selectedWard)?.name || '';
      const districtName = districts.find(d => d.code === selectedDistrict)?.name || '';
      const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';

      const fullAddress = [
        address,
        wardName && `${wardName}`,
        districtName && `${districtName}`,
        provinceName && `${provinceName}`
      ].filter(Boolean).join(', ');

      const supplierData = {
        name,
        phoneNumber: phone,
        email,
        address: fullAddress,
        representative: repName,
        phoneNumberRep: repPhone,
        taxId,
        country,
        postalCode,
        notes
      };

      await apiSupplier.create(supplierData);
      navigate("/supplier-list");
    } catch (error) {
      console.error("Error creating supplier:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setTaxId("");
    setCountry("");
    setAddress("");
    setRepName("");
    setRepPhone("");
    setNotes("");
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setPhoneError("");
    setEmailError("");
    setRepPhoneError("");
    setDistricts([]);
    setWards([]);
  };

  return (
    <div className="supplier-form-container">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="header">
        <div className="back" onClick={() => navigate("/supplier-list")}>
          <img src={backIcon} alt="Quay lại" />
        </div>
        <h2>Thêm nhà cung cấp</h2>
      </div>
      <div className="actions">
          <button type="button" className="delete" onClick={resetForm}>
            <img src={deleteIcon} alt="Xóa" /> Xóa
          </button>
          <button type="submit" className="create" disabled={isSubmitting}>
            <img src={createIcon} alt="Tạo" /> {isSubmitting ? 'Đang tạo...' : 'Tạo'}
          </button>
        </div>
      <form className="customer-form" onSubmit={handleSubmit}>
        
        <div className="info-row">
          <div className="form-group">
            <label>Tên nhà cung cấp</label>
            <div className="input-container">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="info-row">
          <div className="form-group">
            <label>Số điện thoại</label>
            <div className="input-container">
              <input type="text" value={phone} onChange={handlePhoneChange} />
              {phoneError && <div className="error-message">{phoneError}</div>}
            </div>
          </div>
        </div>
        <div className="info-row-1">
          <div className="form-group">
            <label>Mã số thuế</label>
            <div className="input-container">
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Quốc gia</label>
            <div className="custom-select" ref={selectRef}>
              <div className="selected-option" onClick={() => setIsOpen(!isOpen)}>
                <div className="selected-content">
                  {country ? (
                    <>
                      <img
                        src={countries.find(c => c.name === country)?.flag}
                        alt={country}
                        className="country-flag"
                      />
                      <span>{country}</span>
                    </>
                  ) : (
                    <span className="placeholder">Chọn quốc gia</span>
                  )}
                </div>
                <img
                  src={downIcon}
                  alt="down"
                  className={`down-icon ${isOpen ? 'rotate' : ''}`}
                />
              </div>
              {isOpen && (
                <div className="options-list">
                  {countries.map((country) => (
                    <div
                      key={country.code}
                      className="option"
                      onClick={() => {
                        setCountry(country.name);
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
          </div>
        </div>
        <div className="info-row-1">
          <div className="form-group">
            <label>Email</label>
            <div className="input-container">
              <input type="text" value={email} onChange={handleEmailChange} />
              {emailError && <div className="error-message">{emailError}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>Mã bưu chính</label>
            <div className="input-container">
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="info-row-1">
          <div className="form-group">
            <label>Đại diện</label>
            <div className="input-container">
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <div className="input-container">
              <input type="text" value={repPhone} onChange={handleRepPhoneChange} />
              {repPhoneError && <div className="error-message">{repPhoneError}</div>}
            </div>
          </div>
        </div>
        
        <div className="info-row-1">
          <div className="form-group">
            <label>Địa chỉ</label>
            <div className="input-container">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group select-group">
            <label>Tỉnh/ thành phố</label>
            <select onChange={(e) => setSelectedProvince(e.target.value)}>
              <option value="">Chọn thành phố/tỉnh</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="info-row-1">
          <div className="form-group select-group">
            <label>Quận/ Huyện</label>
            <select onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince}>
              <option value="">Chọn quận/huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group select-group">
            <label>Xã/ Phường</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}

            >
              <option value="">Chọn xã/phường</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            className="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateSupplier;
