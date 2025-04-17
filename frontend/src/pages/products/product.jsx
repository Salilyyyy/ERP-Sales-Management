import React, { useState, useRef, useEffect } from "react";
import "./product.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import productApi from "../../api/apiProduct";
import productCategoryApi from "../../api/apiProductCategory";

const Product = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("all");
    const [filterName, setFilterName] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]); // Initialize with empty array

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await productCategoryApi.getAll();
            setCategories(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]); // Ensure categories is always an array
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productApi.getAll();
            const productsList = Array.isArray(response) ? response : [];
            setProducts(productsList);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async () => {
        if (selectedProducts.length === 0) {
            alert("Vui lòng chọn sản phẩm cần xóa!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa các sản phẩm đã chọn?")) {
            try {
                for (const id of selectedProducts) {
                    await productApi.delete(id);
                }
                await fetchProducts();
                setSelectedProducts([]);
                setSelectAll(false);
                alert("Xóa sản phẩm thành công!");
            } catch (error) {
                console.error('Error deleting products:', error);
                alert("Có lỗi xảy ra khi xóa sản phẩm!");
            }
        }
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Xuất danh sách sản phẩm!");
        setIsDropdownOpen(false);
    };

    const filteredProducts = products
        .filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.ID.toString().includes(searchQuery)
        )
        .filter((product) => (filterType === "all" ? true : String(product.produceCategoriesID) === String(filterType)))
        .filter((product) => product.name.toLowerCase().includes(filterName.toLowerCase()));

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedProducts(newSelectAll ? filteredProducts.map(p => p.ID) : []);
    };

    const handleSelectProduct = (id) => {
        let updatedSelection = selectedProducts.includes(id)
            ? selectedProducts.filter((productId) => productId !== id)
            : [...selectedProducts, id];

        setSelectedProducts(updatedSelection);
        setSelectAll(updatedSelection.length === filteredProducts.length);
    };

    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="product-container">
            <h2 className="title">Danh sách sản phẩm</h2>

            <div className="top-actions">
                <div className="search-container">
                    <img src={searchIcon} alt="Tìm kiếm" className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm ..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="button">
                    <button className="btn add" onClick={() => navigate("/create-product")}>Thêm mới</button>
                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            Hành động
                            <img src={downIcon} alt="▼" className="icon-down" />
                        </button>
                        {isDropdownOpen && (
                            <ul className="dropdown-menu">
                                <li className="dropdown-item" onClick={handleDelete}>
                                    <img src={deleteIcon} alt="Xóa" /> Xóa
                                </li>
                                <li className="dropdown-item" onClick={handleExport}>
                                    <img src={exportIcon} alt="Xuất" /> Xuất
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            <div className="filter">
                <div className="select-wrapper">
                    <select
                        className="filter-type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tất cả loại</option>
                        {categories.map(category => (
                            <option key={category.ID} value={String(category.ID)}>{category.name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <div className="select-wrapper">
                    <select
                        className="filter-name"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    >
                        <option value="">Tất cả sản phẩm</option>
                        {[...new Set(products.map(p => p.name))].map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => { setFilterType("all"); setFilterName(""); }}>Xóa lọc</button>
            </div>

            <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã</th>
                        <th>Tên sản phẩm</th>
                        <th>Loại</th>
                        <th>Kích cỡ</th>
                        <th>Đơn giá</th>
                        <th>Tồn kho</th>
                        <th>Hình ảnh</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedProducts.map((product) => (
                        <tr key={product.ID}>
                            <td><input type="checkbox" checked={selectedProducts.includes(product.ID)} onChange={() => handleSelectProduct(product.ID)} /></td>
                            <td>{product.ID}</td>
                            <td>{product.name}</td>
                            <td>
                                {categories.find(c => String(c.ID) === String(product.produceCategoriesID))?.name || 'Không xác định'}
                            </td>
                            <td>{`${product.width} cm × ${product.height} cm × ${product.length} cm`}</td>
                            <td>{product.outPrice}</td>
                            <td>{product.quantity}</td>
                            <td><img src={product.image} alt={product.name} className="product-img" /></td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/product/${product.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon" onClick={() => navigate(`/edit-product/${product.ID}`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 hàng</option>
                        <option value={10}>10 hàng</option>
                        <option value={15}>15 hàng</option>
                    </select>
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} trong tổng số {filteredProducts.length} đơn hàng</span>
                </div>
                <div className="pagination">
                    <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn-page ${currentPage === index + 1 ? "active" : ""}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                    ))}
                    <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                </div>
            </div>
        </div>
    );
};

export default Product;
