import React from "react";
import "./createPromotion.scss";
import { useNavigate } from "react-router-dom";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";


const CreatePromotion = () => {
    const navigate = useNavigate();

    const resetForm = () => {
        const form = document.querySelector(".promotion-form");
        if (form) {
            form.reset();
        }
    };

    const handleSubmit = () => {
        console.log("Form submitted");
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
                <form className="promotion-form">
                    <div className="form-group">
                        <label>Tên khuyến mãi</label>
                        <input type="text" />
                    </div>
                    <div className="form-group">
                        <label>Ngày bắt đầu</label>
                        <input type="date" />
                    </div>
                    <div className="form-group">
                        <label>Ngày kết thúc</label>
                        <input type="date" />
                    </div>
                    <div className="form-group">
                        <label>Giá trị</label>
                        <input type="text" />
                    </div>
                    <div className="form-group">
                        <label>Giá trị tối thiểu</label>
                        <input type="text" />
                    </div>
                    <div className="form-group">
                        <label>Số lượng</label>
                        <input type="number" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePromotion;
