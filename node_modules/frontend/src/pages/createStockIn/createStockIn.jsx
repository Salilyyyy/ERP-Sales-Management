import backIcon from "../../assets/img/back-icon.svg";
import "./createStockIn.scss";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import { suppliers, products } from "../../mock/mock"; // Import dữ liệu mock

const CreateStockIn = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        supplier: "",
        representative: "",
        itemCode: "",
        itemName: "",
        description: "",
        quantity: "",
        unitPrice: "",
        totalAmount: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "itemCode") {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                itemCode: value,
                itemName: selectedProduct ? selectedProduct.name : ""
            }));
            return;
        }

        setFormData(prev => {
            const updatedData = { ...prev, [name]: value };

            // Tự động tính số tiền khi thay đổi số lượng hoặc giá nhập
            if (name === "quantity" || name === "unitPrice") {
                const quantity = parseFloat(updatedData.quantity) || 0;
                const unitPrice = parseFloat(updatedData.unitPrice) || 0;
                updatedData.totalAmount = (quantity * unitPrice).toFixed(2);
            }

            return updatedData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        navigate("/stockin");
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            supplier: "",
            representative: "",
            itemCode: "",
            itemName: "",
            description: "",
            quantity: "",
            unitPrice: "",
            totalAmount: ""
        });
    };

    return (
        <div className="create-stockin-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/stock-history")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Tạo mới đơn nhập</h2>
            </div>
            <div className="actions">
                <button className="delete" onClick={resetForm}>
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="create" onClick={handleSubmit}>
                    <img src={createIcon} alt="Tạo mới" /> Tạo mới
                </button>
            </div>

            <form className="create-stockin-content">
                <div className="info-item">
                    <div className="info-label">Ngày nhập</div>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="info-item">
                    <div className="info-label">Nhà cung cấp</div>
                    <select className="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required>
                        <option value="">Chọn nhà cung cấp</option>
                        {suppliers.map((supplier, index) => (
                            <option key={index} value={supplier.name}>{supplier.name}</option>
                        ))}
                    </select>
                </div>
                <div className="info-item">
                    <div className="info-label">Tên người đại diện</div>
                    <input type="text" name="representative" value={formData.representative} onChange={handleChange} required placeholder="Nhập tên người đại diện" />
                </div>
                <div className="info-item">
                    <div className="info-label">Mã hàng</div>
                    <select
                        className="item-code"
                        name="itemCode"
                        value={formData.itemCode}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Chọn mã hàng</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.id}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="info-item">
                    <div className="info-label">Tên mặt hàng</div>
                    <input type="text" name="itemName" value={formData.itemName} readOnly />
                </div>
                <div className="info-item">
                    <div className="info-label">Mô tả</div>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Nhập mô tả" />
                </div>
                <div className="info-item">
                    <div className="info-label">Số lượng</div>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required placeholder="Nhập số lượng" />
                </div>
                <div className="info-item">
                    <div className="info-label">Giá nhập</div>
                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required placeholder="Nhập giá nhập" />
                </div>
                <div className="info-item">
                    <div className="info-label">Số tiền</div>
                    <input type="number" name="totalAmount" value={formData.totalAmount} readOnly placeholder="Tự động tính toán" />
                </div>
            </form>
        </div>
    );
};

export default CreateStockIn;
