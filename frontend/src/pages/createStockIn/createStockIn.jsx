import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiStockIn from "../../api/apiStockIn";
import apiSupplier from "../../api/apiSupplier";
import apiProduct from "../../api/apiProduct";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import "./createStockIn.scss";

const CreateStockIn = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
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

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const supplierRes = await apiSupplier.getAll();
                const productRes = await apiProduct.getAll();
                setSuppliers(supplierRes);
                setProducts(productRes);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error.message);
            }
        };
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "supplier") {
            const selectedSupplier = suppliers.find(sup => sup.name === value);
            setFormData(prev => ({
                ...prev,
                supplier: value,
                representative: selectedSupplier?.representative || ""
            }));
            return;
        }

        if (name === "itemCode") {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            setFormData(prev => ({
                ...prev,
                itemCode: value,
                itemName: selectedProduct?.name || ""
            }));
            return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "quantity" || name === "unitPrice") {
                const quantity = parseFloat(updated.quantity) || 0;
                const unitPrice = parseFloat(updated.unitPrice) || 0;
                updated.totalAmount = (quantity * unitPrice).toFixed(2);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiStockIn.create({
                stockinDate: formData.date,
                notes: formData.description,
                DetailStockins: [{
                    productID: parseInt(formData.itemCode),
                    quantity: parseFloat(formData.quantity),
                    unitPrice: parseFloat(formData.unitPrice)
                }]
            });
            navigate("/stockin");
        } catch (error) {
            console.error("Tạo đơn nhập thất bại:", error.message);
        }
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

    // Get loading state for initial data fetch
    const suppliersLoading = BaseRepository.getLoadingState('/suppliers');
    const productsLoading = BaseRepository.getLoadingState('/products');
    const isLoading = suppliersLoading || productsLoading;

    return (
        <div className="create-stockin-container">
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <>
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
                            <select name="supplier" value={formData.supplier} onChange={handleChange} required>
                                <option value="">Chọn nhà cung cấp</option>
                                {suppliers.map((s, i) => (
                                    <option key={i} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="info-item">
                            <div className="info-label">Tên người đại diện</div>
                            <input type="text" name="representative" value={formData.representative} readOnly />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Mã hàng</div>
                            <select name="itemCode" value={formData.itemCode} onChange={handleChange} required>
                                <option value="">Chọn mã hàng</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.id}</option>
                                ))}
                            </select>
                        </div>

                        <div className="info-item">
                            <div className="info-label">Tên mặt hàng</div>
                            <input type="text" name="itemName" value={formData.itemName} readOnly />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Mô tả</div>
                            <input type="text" name="description" value={formData.description} onChange={handleChange} />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Số lượng</div>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Giá nhập</div>
                            <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Số tiền</div>
                            <input type="number" name="totalAmount" value={formData.totalAmount} readOnly />
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default CreateStockIn;
