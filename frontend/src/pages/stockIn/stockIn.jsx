import React, { useState, useRef, useEffect } from "react";
import "./stockIn.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import apiStockIn from "../../api/apiStockIn";

const Stockin = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedStockIns, setSelectedStockIns] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType, setFilterType] = useState("all");
    const [filterName, setFilterName] = useState("");
    const [stockInData, setStockInData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockIns = async () => {
            try {
                setLoading(true);
                const data = await apiStockIn.getAll();
                setStockInData(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch stock-ins:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStockIns();
    }, []);

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
        if (selectedStockIns.length === 0) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa các mục đã chọn không?')) {
            try {
                for (const id of selectedStockIns) {
                    await apiStockIn.delete(id);
                }

                const updatedData = await apiStockIn.getAll();
                setStockInData(updatedData);
                setSelectedStockIns([]);
                setSelectAll(false);
                setIsDropdownOpen(false);
            } catch (err) {
                console.error('Failed to delete stock-ins:', err);
                alert('Xóa không thành công: ' + err.message);
            }
        }
    };

    const handleExport = () => {
        alert("Xuất danh sách kho hàng!");
        setIsDropdownOpen(false);
    };

    const filteredStockIns = stockInData
        .filter((stockIn) => {
            const supplierName = stockIn.DetailStockins?.[0]?.Products?.supplier?.name || '';
            const stockInId = stockIn.ID?.toString() || '';
            return searchQuery === '' || 
                   supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   stockInId.includes(searchQuery);
        })
        .filter((stockIn) => {
            const supplierName = stockIn.DetailStockins?.[0]?.Products?.supplier?.name || '';
            return filterType === "all" || supplierName.toLowerCase().includes(filterType.toLowerCase());
        })
        .filter((stockIn) => {
            if (filterName === "") return true;
            return (stockIn.DetailStockins || []).some(detail => 
                (detail.Products?.name || '').toLowerCase().includes(filterName.toLowerCase())
            );
        });

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedStockIns(newSelectAll ? filteredStockIns.map(item => item.ID) : []);
    };

    const handleSelectStockIn = (id) => {
        const updatedSelection = selectedStockIns.includes(id)
            ? selectedStockIns.filter((stockInId) => stockInId !== id)
            : [...selectedStockIns, id];

        setSelectedStockIns(updatedSelection);
        setSelectAll(updatedSelection.length === filteredStockIns.length);
    };

    const allProducts = filteredStockIns.reduce((acc, stockItem) => {
        if (!stockItem.DetailStockins || stockItem.DetailStockins.length === 0) {
            return [...acc, { stockItem, detail: null, isLast: true }];
        }
        return [...acc, ...stockItem.DetailStockins.map((detail, idx) => ({
            stockItem,
            detail,
            isLast: idx === stockItem.DetailStockins.length - 1
        }))];
    }, []);

    const allProductsCount = allProducts.length;
    const totalPages = Math.ceil(allProductsCount / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, allProductsCount);

    const paginatedProducts = allProducts.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="stockin-container">
            {loading && <div className="loading">Đang tải dữ liệu...</div>}
            {error && <div className="error">Lỗi: {error}</div>}
            <h2 className="title">Lịch sử nhập hàng</h2>

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
                    <button
                        className="btn add"
                        onClick={() => navigate("/create-stockin")}
                        disabled={loading}
                    >
                        Thêm mới
                    </button>
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
                        {[...new Set(stockInData.map(item =>
                            item.DetailStockins?.[0]?.Products?.supplier?.name || 'Unknown'
                        ))].map(supplier => (
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
                        {[...new Set(stockInData.flatMap(item => 
                            (item.DetailStockins || []).map(detail => detail.Products?.name || 'Unknown')
                        ))].map(name => (
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
                    {paginatedProducts.map(({ stockItem, detail, isLast }, index) => {
                        const showStockInfo = index === 0 ||
                            (paginatedProducts[index - 1].stockItem.ID !== stockItem.ID);
                        const rowSpan = paginatedProducts.filter(p =>
                            p.stockItem.ID === stockItem.ID).length;

                        if (!detail) {
                            return (
                                <tr key={stockItem.ID}>
                                    <td><input type="checkbox" checked={selectedStockIns.includes(stockItem.ID)} onChange={() => handleSelectStockIn(stockItem.ID)} /></td>
                                    <td>{new Date(stockItem.stockinDate).toLocaleDateString()}</td>
                                    <td>{detail?.Products?.supplier?.name || 'N/A'}</td>
                                    <td colSpan="6">Không có sản phẩm</td>
                                </tr>
                            );
                        }

                        const total = detail.quantity * detail.unitPrice;
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
                                        <td rowSpan={rowSpan}>{new Date(stockItem.stockinDate).toLocaleDateString()}</td>
                                        <td rowSpan={rowSpan}>{detail.Products?.supplier?.name || 'N/A'}</td>
                                    </>
                                )}
                                <td>{detail.Products?.name || "Không có sản phẩm"}</td>
                                <td>{detail.Products?.productCategory?.name || "Không có loại"}</td>
                                <td>{detail.quantity || "Không có số lượng"}</td>
                                <td>{detail.unitPrice || "Không có giá"}</td>
                                <td>{total}</td>
                                {showStockInfo && (
                                    <td className="action-buttons" rowSpan={rowSpan}>
                                        <button className="btn-icon" onClick={() => navigate(`/stockin/${stockItem.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                        <button className="btn-icon" onClick={() => navigate(`/stockin/${stockItem.ID}/edit`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
