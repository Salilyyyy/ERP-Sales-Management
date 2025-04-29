import React, { useState } from "react";
import "./createPromotion.scss";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import apiPromotion from "../../api/apiPromotion";

const CreatePromotion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        dateCreate: "",
        dateEnd: "",
        value: "",
        minValue: "",
        quantity: "",
        type: "" 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            dateCreate: "",
            dateEnd: "",
            value: "",
            minValue: "",
            quantity: "",
            type: "percentage"
        });
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                name: formData.name,
                dateCreate: new Date(formData.dateCreate).toISOString(),
                dateEnd: new Date(formData.dateEnd).toISOString(),
                value: parseFloat(formData.value),
                minValue: parseFloat(formData.minValue),
                quantity: parseInt(formData.quantity, 10),
                type: formData.type 
            };
            console.log("Sending data:", payload);

            await apiPromotion.create(payload);
            navigate("/promotion");
        } catch (error) {
            console.error("Error creating promotion:", error);
            alert(error.message || "Tạo khuyến mãi thất bại!");
        }
    };

    return (
        <div className="create-promotion">
            <div className="header">
                <div className="back" onClick={() => navigate("/promotion")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Thêm khuyến mãi</h2>
            </div>

            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa 
                </button>
                <button className="create" onClick={handleSubmit}>
                    <img src={createIcon} alt="Tạo" /> Tạo
                </button>
            </div>

            <div className="form-container">
                <form className="promotion-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label>Tên khuyến mãi</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu</label>
                        <input type="date" name="dateCreate" value={formData.dateCreate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Ngày kết thúc</label>
                        <input type="date" name="dateEnd" value={formData.dateEnd} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Loại giảm giá</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="percentage">Giảm theo %</option>
                            <option value="fixed">Giảm cố định</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Giá trị</label>
                        <input type="number" name="value" value={formData.value} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Giá trị tối thiểu</label>
                        <input type="number" name="minValue" value={formData.minValue} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Số lượng</label>
                        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePromotion;
