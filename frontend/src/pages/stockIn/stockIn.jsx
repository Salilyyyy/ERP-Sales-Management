import React, { useState, useRef, useEffect } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./stockIn.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import StockInTemplate from "../../components/stockinTemplate/stockinTemplate";
import BaseRepository from "../../api/baseRepository";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
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
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });

    const sortDataByConfig = (data) => {
        return [...data].sort((a, b) => {
            return sortConfig.key === 'updatedAt'
                ? (sortConfig.direction === 'desc'
                    ? new Date(b.updatedAt) - new Date(a.updatedAt)
                    : new Date(a.updatedAt) - new Date(b.updatedAt))
                : new Date(b.stockinDate) - new Date(a.stockinDate);
        });
    };

    useEffect(() => {
        const fetchStockIns = async () => {
            try {
                const data = await apiStockIn.getAll();
                setStockInData(sortDataByConfig(data));
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch stock-ins:', err);
            }
        };

        fetchStockIns();
    }, [sortConfig]);

    const requestKey = apiStockIn.endpoint;
    const isLoading = BaseRepository.getLoadingState(requestKey);

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

    const [selectedStockInData, setSelectedStockInData] = useState(null);
    const stockInTemplateRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const handleExport = async () => {
        if (selectedStockIns.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một mục để xuất");
            return;
        }

        try {
            setIsPrinting(true);
            const selectedStockInItems = stockInData.filter(item => selectedStockIns.includes(item.ID));

            const doc = new jsPDF('p', 'pt', 'a4');

            for (let i = 0; i < selectedStockInItems.length; i++) {
                setSelectedStockInData(selectedStockInItems[i]);

                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        setTimeout(resolve, 500);
                    });
                });

                if (i > 0) {
                    doc.addPage();
                }

                const canvas = await html2canvas(stockInTemplateRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (document) => {
                        const element = document.querySelector('.stockin-template');
                        if (element) {
                            element.style.display = 'block';
                            element.style.width = '100%';
                            element.style.height = 'auto';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pageWidth = doc.internal.pageSize.getWidth();
                const imgWidth = 515;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const xOffset = (pageWidth - imgWidth) / 2;

                doc.addImage(imgData, 'JPEG', xOffset, 20, imgWidth, imgHeight, '', 'FAST');
            }

            doc.save('stockins.pdf');
            setIsPrinting(false);
            setIsDropdownOpen(false);
            setSelectedStockInData(null);
            toast.success("Xuất PDF thành công");
        } catch (err) {
            console.error("Error exporting PDF:", err);
            toast.error("Có lỗi xảy ra khi xuất PDF");
            setIsPrinting(false);
        }
    };

    const filteredStockIns = stockInData
        .filter((stockIn) => {
            const supplierName = stockIn.supplier?.name || '';
            const stockInId = stockIn.ID?.toString() || '';
            return searchQuery === '' ||
                supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                stockInId.includes(searchQuery);
        })
        .filter((stockIn) => {
            const supplierName = stockIn.supplier?.name || '';
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
        <>
            <div className="stockin-container">
            <h2 className="title">Lịch sử nhập hàng</h2>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={stockInTemplateRef} style={{ width: '595px', background: '#fff', margin: '0 auto' }}>
                    {isPrinting && selectedStockInData && (
                        <StockInTemplate stockIn={selectedStockInData} />
                    )}
                </div>
            </div>

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
                        disabled={isLoading}
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
                                <li className="dropdown-item" onClick={handleExport}>
                                    <img src={exportIcon} alt="Xuất" /> Xuất
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}

            {!isLoading && (
                <>
                    {error ? (
                        <div className="error">Lỗi: {error}</div>
                    ) : (
                        <>
                            <div className="filter">
                                <div className="select-wrapper">
                                    <select
                                        className="filter-type"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">Nhà cung cấp</option>
                                        {[...new Set(stockInData.map(item =>
                                            item.supplier?.name || 'Unknown'
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
                                        <th className="sortable" onClick={() => {
                                            setSortConfig({
                                                key: 'updatedAt',
                                                direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
                                            });
                                        }}>
                                            Ngày sửa {sortConfig.key === 'updatedAt' && (
                                                <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                                            )}
                                        </th>
                                        <th>Người sửa</th>
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
                                                    <td>{new Date(stockItem.updatedAt).toLocaleString()}</td>
                                                    <td>{stockItem.updatedBy || 'N/A'}</td>
                                                    <td>{stockItem.supplier?.name || 'N/A'}</td>
                                                    <td colSpan="6">Không có sản phẩm</td>
                                                </tr>
                                            );
                                        }

                                        const total = detail.quantity * detail.unitPrice;
                                        return (
                                            <tr key={`${stockItem.ID}-${index}`}>
                                                {showStockInfo && (
                                                    <>
                                                        <td rowSpan={rowSpan}>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedStockIns.includes(stockItem.ID)}
                                                                onChange={() => handleSelectStockIn(stockItem.ID)}
                                                            />
                                                        </td>
                                                        <td rowSpan={rowSpan}>{new Date(stockItem.stockinDate).toLocaleDateString()}</td>
                                                        <td rowSpan={rowSpan}>{new Date(stockItem.updatedAt).toLocaleString()}</td>
                                                        <td rowSpan={rowSpan}>{stockItem.updatedBy || 'N/A'}</td>
                                                        <td rowSpan={rowSpan}>{stockItem.supplier?.name || 'N/A'}</td>
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
                                                        <button className="btn-icon" onClick={() => navigate(`/stockin/${stockItem.ID}?edit=true`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                        </>
                    )}
                </>
            )}
            </div>
            
        </>
    );
};

export default Stockin;
