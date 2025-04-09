import React, { useState, useRef, useEffect } from "react";
import "./stockIn.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import { stockIn } from "../../mock/mock";  // Đảm bảo đúng đường dẫn và dữ liệu mock

const Stockin = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedStockIns, setSelectedStockIns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("all");  // Lọc theo nhà cung cấp
    const [filterName, setFilterName] = useState("");      // Lọc theo sản phẩm

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

    const handleDelete = () => {
        alert("Xóa kho hàng");
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Xuất danh sách kho hàng!");
        setIsDropdownOpen(false);
    };

    const filteredStockIns = stockIn
        .filter((stockIn) =>
            (stockIn.supplier && stockIn.supplier.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (stockIn.id && stockIn.id.toString().includes(searchQuery))
        )
        .filter((stockIn) =>
            filterType === "all" ? true : stockIn.supplier.toLowerCase().includes(filterType.toLowerCase())  // Lọc theo nhà cung cấp
        )
        .filter((stockIn) =>
            stockIn.products && stockIn.products.some(product =>
                filterName === "" ? true : product.name.toLowerCase().includes(filterName.toLowerCase())  // Lọc theo sản phẩm
            )
        );

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedStockIns(newSelectAll ? filteredStockIns.map(item => item.id) : []);
    };

    const handleSelectStockIn = (id) => {
        const updatedSelection = selectedStockIns.includes(id)
            ? selectedStockIns.filter((stockInId) => stockInId !== id)
            : [...selectedStockIns, id];

        setSelectedStockIns(updatedSelection);
        setSelectAll(updatedSelection.length === filteredStockIns.length);
    };

    // Create a flat array of all products with their parent stock item info
    const allProducts = filteredStockIns.reduce((acc, stockItem) => {
        if (!stockItem.products || stockItem.products.length === 0) {
            // If no products, create a dummy entry
            return [...acc, { stockItem, product: null, isLast: true }];
        }
        // Map each product to include its parent stock item
        return [...acc, ...stockItem.products.map((product, idx) => ({
            stockItem,
            product,
            isLast: idx === stockItem.products.length - 1
        }))];
    }, []);

    const allProductsCount = allProducts.length;
    const totalPages = Math.ceil(allProductsCount / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, allProductsCount);

    // Get only the products for the current page
    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="stockin-container">
            <h2 className="title">Danh sách kho hàng</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-stockin")}>Thêm mới</button>
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
                        <option value="all">Nhà cung cấp</option>
                        {[...new Set(stockIn.map(item => item.supplier))].map(supplier => (
                            <option key={supplier} value={supplier}>{supplier}</option>
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
                        <option value="">Mặt hàng</option>
                        {[...new Set(stockIn.flatMap(item => item.products.map(product => product.name)))]
                            .map(name => (
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
                        <th>Ngày nhập</th>
                        <th>Tên nhà cung cấp</th>
                        <th>Mặt hàng</th>
                        <th>Loại</th>
                        <th>Số lượng</th>
                        <th>Giá nhập</th>
                        <th>Tổng tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedProducts.map(({ stockItem, product, isLast }, index) => {
                        const showStockInfo = index === 0 || 
                            (paginatedProducts[index - 1].stockItem.id !== stockItem.id);
                        const rowSpan = paginatedProducts.filter(p => 
                            p.stockItem.id === stockItem.id).length;
                        
                        if (!product) {
                            return (
                                <tr key={stockItem.id}>
                                    <td><input type="checkbox" checked={selectedStockIns.includes(stockItem.id)} onChange={() => handleSelectStockIn(stockItem.id)} /></td>
                                    <td>{stockItem.date}</td>
                                    <td>{stockItem.supplier}</td>
                                    <td colSpan="6">Không có sản phẩm</td>
                                </tr>
                            );
                        }

                        const total = product.quantity * product.price;
                        return (
                            <tr key={`${stockItem.id}-${index}`}>
                                {showStockInfo && (
                                    <>
                                        <td rowSpan={rowSpan}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStockIns.includes(stockItem.id)}
                                                onChange={() => handleSelectStockIn(stockItem.id)}
                                            />
                                        </td>
                                        <td rowSpan={rowSpan}>{stockItem.date}</td>
                                        <td rowSpan={rowSpan}>{stockItem.supplier}</td>
                                    </>
                                )}
                                <td>{product.name || "Không có sản phẩm"}</td>
                                <td>{product.type || "Không có loại"}</td>
                                <td>{product.quantity || "Không có số lượng"}</td>
                                <td>{product.price || "Không có giá"}</td>
                                <td>{total}</td>
                                {showStockInfo && (
                                    <td className="action-buttons" rowSpan={rowSpan}>
                                        <button className="btn-icon" onClick={() => navigate(`/stockin/${stockItem.id}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                        <button className="btn-icon"><img src={editIcon} alt="Sửa" /> Sửa</button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 hàng</option>
                        <option value={10}>10 hàng</option>
                        <option value={15}>15 hàng</option>
                    </select>
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, allProductsCount)} trong tổng số {allProductsCount} sản phẩm</span>
                </div>
                <div className="pagination">
                    <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn-page ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => handlePageChange(index + 1)}>
                            {index + 1}
                        </button>
                    ))}
                    <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                </div>
            </div>
        </div>
    );
};

export default Stockin;
