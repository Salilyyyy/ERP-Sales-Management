import React from "react";
import { useNavigate } from "react-router-dom";
import "./detailEmployee.scss";

import avatarIcon from "../../assets/img/avatar.png";
import editIcon from "../../assets/img/white-edit.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import backIcon from "../../assets/img/back-icon.svg";
import printIcon from "../../assets/img/print-icon.svg";

import { employees } from "../../mock/mock";

const DetailEmployee = () => {
    const navigate = useNavigate();

    const employee = employees[0];

    return (
        <div className="detail-employee">
            <div className="header">
                <div className="back" onClick={() => navigate("/employee")}>
                    <img src={backIcon} alt="Quay lại" />
                    <h2>Chi tiết nhân viên</h2>
                </div>
            </div>

            <div className="actions">
                <button className="delete">
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="edit">
                    <img src={editIcon} alt="Sửa" /> Sửa
                </button>
                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
            </div>

            <div className="avatar-section">
                <img src={avatarIcon} alt="avatar" className="avatar" />
                <p className="add-photo">Thêm ảnh đại diện</p>
            </div>

            <div className="info-card">
                <div className="info-row">
                    <strong>Họ tên</strong>
                    <span>{employee.name}</span>
                </div>
                <div className="info-row">
                    <strong>Chức vụ</strong>
                    <span>{employee.role}</span>
                </div>
                <div className="info-row">
                    <strong>ID Nhân viên</strong>
                    <span>{employee.id}</span>
                </div>
                <div className="info-row">
                    <strong>Số điện thoại</strong>
                    <span>{employee.phone}</span>
                </div>
                <div className="info-row">
                    <strong>Email</strong>
                    <span>{employee.mail}</span>
                </div>
                <div className="info-row">
                    <strong>Địa chỉ</strong>
                    <span>{employee.address}</span>
                </div>
            </div>
        </div>
    );
};

export default DetailEmployee;
