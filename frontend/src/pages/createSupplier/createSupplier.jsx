import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "./createSupplier.scss";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import apiCountry from "../../api/apiCountry";
import apiSupplier from "../../api/apiSupplier";
import { postalCodes } from "../../mock/mock";

const validatePhone = (phone) => {
  return /^\d{10}$/.test(phone);
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
  const [nameError, setNameError] = useState("");
  const [taxIdError, setTaxIdError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [repNameError, setRepNameError] = useState("");
  const [provinceError, setProvinceError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [wardError, setWardError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repPhoneError, setRepPhoneError] = useState("");
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [countryError, setCountryError] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
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

  const isValidPostalCode = (code) => {
    const postalCode = Number(code);
    return postalCodes.some(item => {
      if (item.code.includes('-')) {
        const [start, end] = item.code.split('-').map(Number);
        return postalCode >= start && postalCode <= end;
      }
      return item.code === code;
    });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ giữ lại số
    setPhone(value);
    if (value && !validatePhone(value)) {
      setPhoneError("Số điện thoại phải có 10 chữ số");
    } else {
      setPhoneError("");
    }
  };

  const handleRepPhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ giữ lại số
    setRepPhone(value);
    if (value && !validatePhone(value)) {
      setRepPhoneError("Số điện thoại phải có 10 chữ số");
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

    if (!country) {
      setCountryError("Vui lòng chọn quốc gia");
      isValid = false;
    } else {
      setCountryError("");
    }

    if (!name) {
      setNameError("Vui lòng nhập tên nhà cung cấp");
      isValid = false;
    } else {
      setNameError("");
    }
    if (!phone) {
      setPhoneError("Vui lòng nhập số điện thoại");
      isValid = false;
    }
    if (!taxId) {
      setTaxIdError("Vui lòng nhập mã số thuế");
      isValid = false;
    } else {
      setTaxIdError("");
    }
    if (!email) {
      setEmailError("Vui lòng nhập email");
      isValid = false;
    }
    if (!repName) {
      setRepNameError("Vui lòng nhập tên người đại diện");
      isValid = false;
    } else {
      setRepNameError("");
    }
    if (!repPhone) {
      setRepPhoneError("Vui lòng nhập số điện thoại đại diện");
      isValid = false;
    }
    if (!address) {
      setAddressError("Vui lòng nhập địa chỉ");
      isValid = false;
    } else {
      setAddressError("");
    }
    if (!selectedProvince) {
      setProvinceError("Vui lòng chọn tỉnh/thành phố");
      isValid = false;
    } else {
      setProvinceError("");
    }
    if (!selectedDistrict) {
      setDistrictError("Vui lòng chọn quận/huyện");
      isValid = false;
    } else {
      setDistrictError("");
    }
    if (!selectedWard) {
      setWardError("Vui lòng chọn phường/xã");
      isValid = false;
    } else {
      setWardError("");
    }

    if (!postalCode || !isValidPostalCode(postalCode)) {
      setPostalCodeError("Vui lòng nhập mã bưu chính hợp lệ");
      isValid = false;
    } else {
      setPostalCodeError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const isValid = validateForm();

    if (!isValid || phoneError || emailError || repPhoneError || postalCodeError) {
      toast.error("Vui lòng kiểm tra và điền đầy đủ thông tin các trường bắt buộc");
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

      const response = await apiSupplier.create(supplierData);
      if (response) {
        toast.success("Tạo nhà cung cấp thành công");
        navigate("/supplier-list");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tạo nhà cung cấp");
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
    setPostalCode("");
    setPostalCodeError("");
    setCountryError("");
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
            <button
              type="button"
              className="create"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
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
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value) setNameError("");
                    }}
                  />
                  {nameError && <div className="error-message">{nameError}</div>}
                </div>
              </div>
            </div>
            <div className="info-row">
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="input-container">
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
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
                    onChange={(e) => {
                      setTaxId(e.target.value);
                      if (e.target.value) setTaxIdError("");
                    }}
                  />
                  {taxIdError && <div className="error-message">{taxIdError}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Quốc gia</label>
                <div className="input-container">
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
                              setCountryError("");
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
                    {countryError && <div className="error-message">{countryError}</div>}
                  </div>
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
            </div>
            <div className="form-group">
              <label>Mã bưu chính</label>
              <div className="input-container">
                <input
                  type="text"
                  value={postalCode}
                  maxLength={5}
                  inputMode="numeric"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPostalCode(value);
                    if (value && value.length === 5) {
                      if (!isValidPostalCode(value)) {
                        setPostalCodeError("Mã bưu chính không hợp lệ");
                      } else {
                        setPostalCodeError("");
                      }
                    } else if (value) {
                      setPostalCodeError("Mã bưu chính phải có 5 chữ số");
                    } else {
                      setPostalCodeError("");
                    }
                  }}
                />
                {postalCodeError && <div className="error-message">{postalCodeError}</div>}
              </div>
            </div>
            <div className="info-row-1">
              <div className="form-group">
                <label>Đại diện</label>
                <div className="input-container">
                  <input
                    type="text"
                    value={repName}
                    onChange={(e) => {
                      setRepName(e.target.value);
                      if (e.target.value) setRepNameError("");
                    }}
                  />
                  {repNameError && <div className="error-message">{repNameError}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="input-container">
                  <input
                    type="text"
                    value={repPhone}
                    onChange={handleRepPhoneChange}
                    maxLength={10}
                    inputMode="numeric"
                  />
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
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (e.target.value) setAddressError("");
                    }}
                  />
                  {addressError && <div className="error-message">{addressError}</div>}
                </div>
              </div>
              <div className="form-group select-group">
                <label>Tỉnh/ thành phố</label>
                <div className="input-container">
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      if (e.target.value) setProvinceError("");
                    }}
                  >
                    <option value="">Chọn thành phố/tỉnh</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>

                  {provinceError && <div className="error-message">{provinceError}</div>}
                </div>
              </div>
            </div>
            <div className="info-row-1">
              <div className="form-group select-group">
                <label>Quận/ Huyện</label>
                <div className="input-container">
                  <select
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      if (e.target.value) setDistrictError("");
                    }}
                    disabled={!selectedProvince}
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                  {districtError && <div className="error-message">{districtError}</div>}
                </div>
              </div>
              <div className="form-group select-group">
                <label>Xã/ Phường</label>
                <div className="input-container">
                  <select
                    value={selectedWard}
                    onChange={(e) => {
                      setSelectedWard(e.target.value);
                      if (e.target.value) setWardError("");
                    }}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Chọn xã/phường</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>

                  {wardError && <div className="error-message">{wardError}</div>}
                </div>
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
