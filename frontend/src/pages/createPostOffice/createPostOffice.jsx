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
  };

  const handleCreate = async () => {
    try {
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
            <label>Tên bưu cục</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="info-row-1">
          <div className="form-group">
            <label>Điện thoại</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="info-row-1">
          <div className="form-group">
            <label>Địa chỉ</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group select-group">
            <label>Tỉnh/ thành phố</label>
            <select onChange={(e) => setSelectedProvince(e.target.value)} value={selectedProvince} style={{ width: "215px" }}>
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
            <select onChange={(e) => setSelectedDistrict(e.target.value)} value={selectedDistrict} disabled={!selectedProvince} style={{ width: "215px" }}>
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
            <select disabled={!selectedDistrict} style={{ width: "215px" }}>
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
          <textarea className="notes" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
        </div>
      </form>
    </div>
  );
};

export default CreatePostOffice;
