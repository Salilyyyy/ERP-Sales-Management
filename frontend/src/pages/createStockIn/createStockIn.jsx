import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiStockIn from "../../api/apiStockIn";
import apiSupplier from "../../api/apiSupplier";
import apiProduct from "../../api/apiProduct";
import apiProductCategory from "../../api/apiProductCategory";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import createIcon from "../../assets/img/create-icon.svg";
import "./createStockIn.scss";

const CreateStockIn = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        supplier: "",
        representative: "",
        itemName: "",
        description: "",
        quantity: "",
        unitPrice: "",
        sellingPrice: "",
        totalAmount: ""
    });

    const [showNewProduct, setShowNewProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        sellingPrice: "",
        unitPrice: "",
        quantity: "",
        unit: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        origin: "",
        title: "",
        description: "",
        produceCategoriesID: ""
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [supplierRes, categoriesRes] = await Promise.all([
                    apiSupplier.getAll(),
                    apiProductCategory.getAll()
                ]);
                setSuppliers(supplierRes);
                setCategories(categoriesRes);
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
                representative: selectedSupplier?.representative || "",
                itemName: "" 
            }));
            setShowNewProduct(false);
            setNewProduct({
                name: "",
                sellingPrice: "",
                unitPrice: "",
                quantity: "",
                unit: "",
                weight: "",
                length: "",
                width: "",
                height: "",
                origin: "",
                title: "",
                description: "",
                produceCategoriesID: ""
            });
            return;
        }

        if (name === "itemName") {
            if (value === "__new__") {
                setShowNewProduct(true);
                setFormData(prev => ({
                    ...prev,
                    itemName: value
                }));
            } else {
                setShowNewProduct(false);
                setFormData(prev => ({
                    ...prev,
                    itemName: value
                }));
            }
            return;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "quantity" || name === "unitPrice") {
                const quantity = parseFloat(updated.quantity) || 0;
                const unitPrice = parseFloat(updated.unitPrice) || 0;
                updated.totalAmount = (quantity * unitPrice);
                if (name === "unitPrice" && showNewProduct) {
                    setNewProduct(prev => ({...prev, unitPrice: value}));
                }
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.itemName === "__new__") {
                const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
                const newProductRes = await apiProduct.create({
                    name: newProduct.name,
                    inPrice: parseFloat(formData.unitPrice),
                    outPrice: parseFloat(newProduct.sellingPrice),
                    supplierID: selectedSupplier.ID,
                    unit: newProduct.unit,
                    weight: parseFloat(newProduct.weight),
                    length: parseFloat(newProduct.length),
                    width: parseFloat(newProduct.width),
                    height: parseFloat(newProduct.height),
                    origin: newProduct.origin,
                    quantity: parseInt(formData.quantity),
                    title: newProduct.title || newProduct.name,
                    description: newProduct.description,
                    produceCategoriesID: parseInt(newProduct.produceCategoriesID)
                });

                await apiStockIn.create({
                    stockinDate: new Date(formData.date).toISOString(),
                    notes: formData.description || "",
                    supplierID: parseInt(selectedSupplier.ID),
                    DetailStockins: [{
                        productID: newProductRes.ID,
                        quantity: parseInt(formData.quantity),
                        unitPrice: parseFloat(formData.unitPrice)
                    }]
                });
            } else {
                const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
                const selectedProduct = selectedSupplier?.Products.find(p => p.name === formData.itemName);
                await apiStockIn.create({
                    stockinDate: new Date(formData.date).toISOString(),
                    notes: formData.description || "",
                    supplierID: parseInt(selectedSupplier.ID),
                    DetailStockins: [{
                        productID: selectedProduct.ID,
                        quantity: parseInt(formData.quantity),
                        unitPrice: parseFloat(formData.unitPrice)
                    }]
                });
            }
            navigate("/stock-history");
        } catch (error) {
            console.error("Tạo đơn nhập thất bại:", error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            supplier: "",
            representative: "",
            itemName: "",
            description: "",
            quantity: "",
            unitPrice: "",
            sellingPrice: "",
            totalAmount: ""
        });
        setShowNewProduct(false);
            setNewProduct({
                name: "",
                sellingPrice: "",
                unitPrice: "",
                quantity: "",
                unit: "",
                weight: "",
                length: "",
                width: "",
                height: "",
                origin: "",
                title: "",
                description: "",
                produceCategoriesID: ""
            });
    };

    const isLoading = BaseRepository.getLoadingState('/suppliers');

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
                            <div className="info-label">Tên mặt hàng</div>
                            <select
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn mặt hàng</option>
                                {formData.supplier ? (
                                    <>
                                        {suppliers
                                            .find(s => s.name === formData.supplier)
                                            ?.Products?.map(p => (
                                                <option key={p.ID} value={p.name}>{p.name}</option>
                                            ))}
                                        <option value="__new__">+ Thêm sản phẩm mới</option>
                                    </>
                                ) : (
                                    <option value="" disabled>Chọn nhà cung cấp trước</option>
                                )}
                            </select>
                        </div>

                        {showNewProduct ? (
                            <>
                                <div className="info-item">
                                    <div className="info-label">Tên sản phẩm mới</div>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Danh mục</div>
                                    <select
                                        value={newProduct.produceCategoriesID}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, produceCategoriesID: e.target.value }))}
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map((category) => (
                                            <option key={category.ID} value={category.ID}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Đơn vị tính</div>
                                    <select
                                        value={newProduct.unit}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                                        required
                                    >
                                        <option value="">Chọn đơn vị tính</option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Kích thước (cm)</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder="Dài"
                                            value={newProduct.length}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, length: e.target.value }))}
                                            required
                                            style={{ width: '32%' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Rộng"
                                            value={newProduct.width}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, width: e.target.value }))}
                                            required
                                            style={{ width: '32%' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Cao"
                                            value={newProduct.height}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, height: e.target.value }))}
                                            required
                                            style={{ width: '32%' }}
                                        />
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Khối lượng (gram)</div>
                                    <input
                                        type="number"
                                        value={newProduct.weight}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, weight: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Xuất xứ</div>
                                    <input
                                        type="text"
                                        value={newProduct.origin}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, origin: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Tiêu đề</div>
                                    <input
                                        type="text"
                                        value={newProduct.title}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Mô tả</div>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả sản phẩm"
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">Giá nhập</div>
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        value={formData.unitPrice}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Giá bán</div>
                                    <input
                                        type="number"
                                        value={newProduct.sellingPrice}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="info-item">
                                    <div className="info-label">Giá nhập</div>
                                    <input
                                        type="number"
                                        name="unitPrice"
                                        value={formData.unitPrice}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="info-item">
                                    <div className="info-label">Giá bán</div>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        value={formData.sellingPrice}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="info-item">
                            <div className="info-label">Số lượng</div>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Ghi chú</div>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Nhập ghi chú (nếu có)"
                            />
                        </div>

                        <div className="info-item">
                            <div className="info-label">Tổng tiền</div>
                            <input
                                type="number"
                                name="totalAmount"
                                value={formData.totalAmount}
                                readOnly
                            />
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default CreateStockIn;
