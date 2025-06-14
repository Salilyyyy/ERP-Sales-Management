import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiStockIn from "../../api/apiStockIn";
import apiSupplier from "../../api/apiSupplier";
import apiProduct from "../../api/apiProduct";
import apiProductCategory from "../../api/apiProductCategory";
import apiCountry from "../../api/apiCountry";
import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-red.svg";
import createIcon from "../../assets/img/create-icon.svg";
import "./createStockIn.scss";

const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    supplier: "",
    representative: "",
    description: "",
};

const initialNewProduct = {
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
    produceCategoriesID: "",
    isNew: true,
    errors: {}
};

const initialValidationErrors = {
    unitPrice: "",
    sellingPrice: "",
    quantity: ""
};

let language = 'vi';

const CreateStockIn = () => {
    const navigate = useNavigate();
    const { language: currentLang } = useLanguage();
    language = currentLang;
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { number: 1, text: language === 'en' ? "Basic Information" : "Thông tin cơ bản" },
        { number: 2, text: language === 'en' ? "Select Products" : "Chọn sản phẩm" },
        { number: 3, text: language === 'en' ? "Review Details" : "Xem chi tiết" }
    ];


    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [countries, setCountries] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState(initialNewProduct);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [supplierRes, categoriesRes, countriesRes] = await Promise.all([
                    apiSupplier.getAll(),
                    apiProductCategory.getAll(),
                    apiCountry.getAll()
                ]);
                setSuppliers(supplierRes);
                setCategories(categoriesRes);
                setCountries(countriesRes);
            } catch (error) {
                console.error(language === 'en' ? "Error loading data:" : "Lỗi khi tải dữ liệu:", error.message);
            }
        };
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "supplier") {
            handleSupplierChange(value);
            return;
        }

        if (name === "itemName") {
            handleProductSelect(value);
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductSelect = (value) => {
        if (!value) return;

        if (value === "__new__") {
            setShowNewProductModal(true);
            setNewProduct(initialNewProduct);
            setCurrentProduct(null);
        } else {
            const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
            const product = selectedSupplier?.Products.find(p => p.name === value);

            const isProductAlreadySelected = selectedProducts.some(p => p.ID === product.ID);
            if (isProductAlreadySelected) {
                setError(language === 'en' ? "This product has already been selected" : "Sản phẩm này đã được chọn");
                return;
            }

            if (product && selectedSupplier) {
                const productToAdd = {
                    ID: product.ID,
                    productID: product.ID,
                    name: product.name,
                    unitPrice: product.inPrice.toString(),
                    sellingPrice: product.outPrice.toString(),
                    quantity: "",
                    unit: product.unit,
                    weight: product.weight,
                    length: product.length,
                    width: product.width,
                    height: product.height,
                    origin: product.origin,
                    title: product.title,
                    description: product.description,
                    produceCategoriesID: product.produceCategoriesID,
                    supplierID: selectedSupplier.ID,
                    isNew: false,
                    errors: {}
                };
                setCurrentProduct(productToAdd);
                setShowNewProductModal(true);
                setError("");
            }
        }
    };

    const handleSupplierChange = (value) => {
        const selectedSupplier = suppliers.find(sup => sup.name === value);
        setFormData(prev => ({
            ...prev,
            supplier: value,
            representative: selectedSupplier?.representative || ""
        }));
        setSelectedProducts([]);
    };

    const validateNewProduct = () => {
        if (currentProduct) {
            const errors = {};
            const requiredFields = ['unitPrice', 'sellingPrice', 'quantity'];

            requiredFields.forEach(field => {
                if (!currentProduct[field]) {
                    errors[field] = language === 'en' ? 'Please enter information' : 'Vui lòng nhập thông tin';
                }
            });

            setCurrentProduct(prev => ({ ...prev, errors: errors }));
            return Object.keys(errors).length === 0;
        }

        const errors = {};
        const requiredFields = ['name', 'produceCategoriesID', 'unit', 'unitPrice', 'sellingPrice', 'quantity'];

        requiredFields.forEach(field => {
            if (!newProduct[field]) {
                errors[field] = 'Vui lòng nhập thông tin';
            }
        });

        setNewProduct(prev => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    };

    const handleCreateNewProduct = async () => {
        if (!validateNewProduct()) {
            return;
        }
        try {
            if (currentProduct) {
                const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
                const product = selectedSupplier?.Products?.find(p => p.ID === currentProduct.ID);

                if (!product) {
                    throw new Error(language === 'en' ? "Product not found" : "Không tìm thấy sản phẩm");
                }

                const isProductAlreadySelected = selectedProducts.some(p => p.ID === product.ID);
                if (isProductAlreadySelected) {
                    setError(language === 'en' ? "This product has already been selected" : "Sản phẩm này đã được chọn");
                    setShowNewProductModal(false);
                    return;
                }

                const errors = { ...initialValidationErrors };
                let hasErrors = false;

                if (!currentProduct.unitPrice) {
                    errors.unitPrice = 'Vui lòng nhập thông tin';
                    hasErrors = true;
                }
                if (!currentProduct.sellingPrice) {
                    errors.sellingPrice = 'Vui lòng nhập thông tin';
                    hasErrors = true;
                }
                if (!currentProduct.quantity) {
                    errors.quantity = 'Vui lòng nhập thông tin';
                    hasErrors = true;
                }

                if (hasErrors) {
                    setCurrentProduct(prev => ({ ...prev, errors }));
                    return;
                }

                setSelectedProducts(prev => [...prev, currentProduct]);
            } else {
                const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
                const response = await apiProduct.create({
                    name: newProduct.name,
                    inPrice: parseFloat(newProduct.unitPrice),
                    outPrice: parseFloat(newProduct.sellingPrice),
                    supplierID: selectedSupplier.ID,
                    unit: newProduct.unit,
                    weight: parseFloat(newProduct.weight) || 0,
                    length: parseFloat(newProduct.length) || 0,
                    width: parseFloat(newProduct.width) || 0,
                    height: parseFloat(newProduct.height) || 0,
                    origin: newProduct.origin,
                    quantity: parseInt(newProduct.quantity),
                    title: newProduct.title || newProduct.name,
                    description: newProduct.description || "",
                    produceCategoriesID: parseInt(newProduct.produceCategoriesID)
                });

                const productData = response.data;

                const productToAdd = {
                    ID: parseInt(productData.ID),
                    productID: parseInt(productData.ID),
                    name: productData.name,
                    quantity: parseInt(newProduct.quantity),
                    unitPrice: parseFloat(newProduct.unitPrice),
                    sellingPrice: parseFloat(newProduct.sellingPrice),
                    unit: productData.unit,
                    weight: parseFloat(productData.weight) || 0,
                    length: parseFloat(productData.length) || 0,
                    width: parseFloat(productData.width) || 0,
                    height: parseFloat(productData.height) || 0,
                    origin: productData.origin,
                    title: productData.title,
                    description: productData.description,
                    produceCategoriesID: parseInt(productData.produceCategoriesID)
                };
                setSelectedProducts(prev => [...prev, productToAdd]);
            }

            setShowNewProductModal(false);
            setNewProduct(initialNewProduct);
            setCurrentProduct(null);
            setError("");
        } catch (error) {
            console.error(language === 'en' ? "Error creating new product:" : "Lỗi khi tạo sản phẩm mới:", error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const selectedSupplier = suppliers.find(s => s.name === formData.supplier);
            if (!selectedSupplier) {
                console.error(language === 'en' ? "No supplier selected" : "Chưa chọn nhà cung cấp");
                return;
            }

            const stockInData = {
                stockinDate: new Date(formData.date).toISOString(),
                notes: formData.description || "",
                supplierID: parseInt(selectedSupplier.ID),
                updatedBy: "Hương Giang",
                DetailStockins: []
            };

            for (const product of selectedProducts) {
                const productID = parseInt(product.productID || product.ID);
                if (!productID) {
                    setError(language === 'en' ? "Some products are missing IDs. Please check again." : "Một số sản phẩm thiếu ID. Vui lòng kiểm tra lại.");
                    return;
                }
                stockInData.DetailStockins.push({
                    productID: productID,
                    quantity: parseInt(product.quantity),
                    unitPrice: parseFloat(product.unitPrice)
                });
            }

            if (!stockInData.stockinDate || !stockInData.supplierID || !stockInData.DetailStockins.length) {
                setError(language === 'en' ? "Please fill in all required information." : "Vui lòng điền đầy đủ thông tin cần thiết.");
                return;
            }

            try {
                const result = await apiStockIn.create(stockInData);
                setError("");
                navigate("/stock-history");
            } catch (error) {
                setError(language === 'en' ? "Failed to create stock in. Please check the information and try again." : "Tạo đơn nhập thất bại. Vui lòng kiểm tra lại thông tin và thử lại.");
            }
        } catch (error) {
            setError(language === 'en' ? "Please check the product information and try again." : "Vui lòng kiểm tra lại thông tin sản phẩm và thử lại.");
        }
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => {
            return total + (parseFloat(product.unitPrice) || 0) * (parseInt(product.quantity) || 0);
        }, 0);
    };

    const removeProduct = (index) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setNewProduct(initialNewProduct);
        setSelectedProducts([]);
        setCurrentStep(1);
    };

    const handleStepClick = (step) => {
        if (validateStep(currentStep)) {
            setCurrentStep(step);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.date && formData.supplier;
            case 2:
                return selectedProducts.length > 0;
            case 3:
                return selectedProducts.length > 0;
            default:
                return false;
        }
    };

    const isLoading = BaseRepository.getLoadingState('/suppliers');

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="create-stockin-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/stock-history")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>{language === 'en' ? "Create New Stock In" : "Tạo mới đơn nhập"}</h2>
            </div>


            <div className="steps">
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className={`step ${currentStep >= step.number ? 'active' : ''}`}
                        onClick={() => handleStepClick(step.number)}
                    >
                        <div className="step-number">{step.number}</div>
                        <div className="step-text">{step.text}</div>
                    </div>
                ))}
            </div>

            <form className="create-stockin-content">
                {currentStep === 1 && (
                    <div className="step-content">
                        <div className="info-item">
                            <div className="info-label">{language === 'en' ? "Import Date" : "Ngày nhập"}</div>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="info-item">
                            <div className="info-label">{language === 'en' ? "Supplier" : "Nhà cung cấp"}</div>
                            <select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{language === 'en' ? "Select supplier" : "Chọn nhà cung cấp"}</option>
                                {suppliers.map((s, i) => (
                                    <option key={i} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="info-item">
                            <div className="info-label">{language === 'en' ? "Representative Name" : "Tên người đại diện"}</div>
                            <input
                                type="text"
                                name="representative"
                                value={formData.representative}
                                readOnly
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="step-content">
                        <div className="info-item">
                            <div className="info-label">{language === 'en' ? "Product Name" : "Tên mặt hàng"}</div>
                            <select
                                name="itemName"
                                value={currentProduct?.name || ""}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{language === 'en' ? "Select product" : "Chọn mặt hàng"}</option>
                                {suppliers
                                    .find(s => s.name === formData.supplier)
                                    ?.Products?.map(p => (
                                        <option key={p.ID} value={p.name}>{p.name}</option>
                                    ))}
                                <option value="__new__">{language === 'en' ? "+ Add new product" : "+ Thêm sản phẩm mới"}</option>
                            </select>
                        </div>

                        <div className="selected-products">
                            <h3>{language === 'en' ? "Selected Products" : "Sản phẩm đã chọn"}</h3>
                            <table className="selected-products-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>{language === 'en' ? "Product Name" : "Tên sản phẩm"}</th>
                                        <th>{language === 'en' ? "Quantity" : "Số lượng"}</th>
                                        <th>{language === 'en' ? "Unit Price" : "Đơn giá"}</th>
                                        <th>{language === 'en' ? "Total" : "Thành tiền"}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.productID || product.ID}</td>
                                            <td>{product.name}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.unitPrice}</td>
                                            <td>{product.quantity * product.unitPrice}</td>
                                            <td>
                                                <button type="button" className="delete-btn" onClick={() => removeProduct(index)}>
                                                    <img src={deleteIcon} alt="Xóa" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="step-content">
                        <div className="summary">
                            <h3>{language === 'en' ? "Stock In Details" : "Chi tiết đơn nhập"}</h3>
                            <table className="summary-table">
                                <thead>
                                    <tr>
                                        <th>{language === 'en' ? "Product Name" : "Tên sản phẩm"}</th>
                                        <th>{language === 'en' ? "Quantity" : "Số lượng"}</th>
                                        <th>{language === 'en' ? "Unit Price" : "Đơn giá"}</th>
                                        <th>{language === 'en' ? "Total" : "Thành tiền"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.name}</td>
                                            <td>{product.quantity}</td>
                                            <td>{product.unitPrice}</td>
                                            <td>{product.quantity * product.unitPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="info-item">
                                <div className="info-label">{language === 'en' ? "Note" : "Ghi chú"}</div>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={language === 'en' ? "Enter note (if any)" : "Nhập ghi chú (nếu có)"}
                                />
                            </div>

                            <div className="info-item">
                                <div className="info-label">{language === 'en' ? "Total Amount" : "Tổng tiền"}</div>
                                <input
                                    type="number"
                                    value={calculateTotal()}
                                    readOnly
                                    className="input-size"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
                <div className="actions">
                    {currentStep > 1 && (
                        <button type="button" className="previous" onClick={prevStep}>
                            {language === 'en' ? "Back" : "Quay lại"}
                        </button>
                    )}
                    {currentStep < 3 && (
                        <button
                            type="button"
                            className="next"
                            onClick={nextStep}
                            disabled={!validateStep(currentStep)}
                        >
                            {language === 'en' ? "Next" : "Tiếp theo"}
                        </button>
                    )}
                    {currentStep === 3 && (
                        <>
                            <button type="button" className="delete" onClick={resetForm}>
                                <img src={deleteIcon} alt={language === 'en' ? "Delete" : "Xóa"} /> {language === 'en' ? "Delete" : "Xóa"}
                            </button>
                            <button
                                type="button"
                                className="create"
                                onClick={handleSubmit}
                                disabled={!validateStep(currentStep)}
                            >
                                <img src={createIcon} alt={language === 'en' ? "Create" : "Tạo mới"} /> {language === 'en' ? "Create" : "Tạo mới"}
                            </button>
                        </>
                    )}
                </div>
            </form>

            {showNewProductModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{currentProduct ? (language === 'en' ? 'Add Product Quantity' : 'Thêm số lượng sản phẩm') : (language === 'en' ? 'Add New Product' : 'Thêm sản phẩm mới')}</h3>

                        {currentProduct ? (
                            <>
                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Product Name" : "Tên sản phẩm"}</div>
                                    <input
                                        type="text"
                                        value={currentProduct.name}
                                        readOnly
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Import Price" : "Giá nhập"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={currentProduct.unitPrice}
                                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, unitPrice: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {currentProduct.errors?.unitPrice && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{currentProduct.errors.unitPrice}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Selling Price" : "Giá bán"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={currentProduct.sellingPrice}
                                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {currentProduct.errors?.sellingPrice && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{currentProduct.errors.sellingPrice}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Quantity" : "Số lượng"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={currentProduct.quantity}
                                            onChange={(e) => setCurrentProduct(prev => ({ ...prev, quantity: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {currentProduct.errors?.quantity && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{currentProduct.errors.quantity}</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "New Product Name" : "Tên sản phẩm mới"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                        {newProduct.errors.name && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.name}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Category" : "Danh mục"}</div>
                                    <div style={{ width: '100%' }}>
                                        <select
                                            value={newProduct.produceCategoriesID}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, produceCategoriesID: e.target.value }))}
                                            required
                                        >
                                            <option value="">{language === 'en' ? "Select category" : "Chọn danh mục"}</option>
                                            {categories.map((category) => (
                                                <option key={category.ID} value={category.ID}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {newProduct.errors.produceCategoriesID && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.produceCategoriesID}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Unit" : "Đơn vị tính"}</div>
                                    <div style={{ width: '100%' }}>
                                        <select
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                                            required
                                        >
                                            <option value="">{language === 'en' ? "Select unit" : "Chọn đơn vị tính"}</option>
                                            {categories.map((category, index) => (
                                                <option key={index} value={category.name}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {newProduct.errors.unit && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.unit}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Dimensions (cm)" : "Kích thước (cm)"}</div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            placeholder={language === 'en' ? "Length" : "Dài"}
                                            value={newProduct.length}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, length: e.target.value }))}
                                            required
                                            className="input-size"
                                            style={{ width: '100px' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder={language === 'en' ? "Width" : "Rộng"}
                                            value={newProduct.width}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, width: e.target.value }))}
                                            required
                                            className="input-size"
                                            style={{ width: '100px' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder={language === 'en' ? "Height" : "Cao"}
                                            value={newProduct.height}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, height: e.target.value }))}
                                            required
                                            className="input-size"
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Weight (grams)" : "Khối lượng (gram)"}</div>
                                    <input
                                        type="number"
                                        value={newProduct.weight}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, weight: e.target.value }))}
                                        required
                                        className="input-size"
                                    />
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Origin" : "Xuất xứ"}</div>
                                    <select
                                        value={newProduct.origin}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, origin: e.target.value }))}
                                        required
                                        className="country-select"
                                    >
                                        <option value="">{language === 'en' ? "Select country" : "Chọn quốc gia"}</option>
                                        {countries.map((country) => (
                                            <option
                                                key={country.code}
                                                value={country.name}
                                                style={{ '--flag-url': `url(${country.flag})` }}
                                            >
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Import Price" : "Giá nhập"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={newProduct.unitPrice}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, unitPrice: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {newProduct.errors.unitPrice && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.unitPrice}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Selling Price" : "Giá bán"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={newProduct.sellingPrice}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, sellingPrice: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {newProduct.errors.sellingPrice && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.sellingPrice}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Quantity" : "Số lượng"}</div>
                                    <div style={{ width: '100%' }}>
                                        <input
                                            type="number"
                                            value={newProduct.quantity}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                                            required
                                            className="input-size"
                                        />
                                        {newProduct.errors.quantity && (
                                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{newProduct.errors.quantity}</div>
                                        )}
                                    </div>
                                </div>



                                <div className="info-item">
                                    <div className="info-label">{language === 'en' ? "Description" : "Mô tả"}</div>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder={language === 'en' ? "Enter product description" : "Nhập mô tả sản phẩm"}
                                    />
                                </div>
                            </>
                        )}

                        <div className="actions">
                            <button type="button" className="previous" onClick={() => setShowNewProductModal(false)}>
                                {language === 'en' ? "Cancel" : "Hủy"}
                            </button>
                            <button type="button" className="create" onClick={handleCreateNewProduct}>
                                {language === 'en' ? "Confirm" : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateStockIn;
