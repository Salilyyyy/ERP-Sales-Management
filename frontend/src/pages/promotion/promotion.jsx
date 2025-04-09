import React, { useState, useRef, useEffect } from "react";
import "./promotion.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import { promotions } from "../../mock/mock";

const Promotion = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedPromotions, setSelectedPromotions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

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
        alert("Xóa khuyến mãi");
        setIsDropdownOpen(false);
    };

    const handleExport = () => {
        alert("Xuất danh sách khuyến mãi!");
        setIsDropdownOpen(false);
    };

    const filteredPromotions = promotions
        .filter(promotion =>
            promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promotion.id.toString().includes(searchQuery)
        )
        .filter(promotion => {
            const promoStart = new Date(promotion.startDate);
            const promoEnd = new Date(promotion.endDate);
            const from = startDateFilter ? new Date(startDateFilter) : null;
            const to = endDateFilter ? new Date(endDateFilter) : null;

            if (from && promoEnd < from) return false;
            if (to && promoStart > to) return false;
            return true;
        });

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedPromotions(newSelectAll ? filteredPromotions.map(p => p.id) : []);
    };

    const handleSelectPromotion = (id) => {
        const updatedSelection = selectedPromotions.includes(id)
            ? selectedPromotions.filter(promotionId => promotionId !== id)
            : [...selectedPromotions, id];

        setSelectedPromotions(updatedSelection);
        setSelectAll(updatedSelection.length === filteredPromotions.length);
    };

    const totalPages = Math.ceil(filteredPromotions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="promotion-container">
            <h2 className="title">Danh sách khuyến mãi</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-promotion")}>Thêm mới</button>
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
                <div className="date-picker">
                    <label className="label">Từ ngày</label>
                    <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        placeholder="Start date"
                    />
                    <label className="label">Đến ngày</label>
                    <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        placeholder="End date"
                    />
                </div>
                <div
                    className="reset-filter"
                    onClick={() => {
                        setStartDateFilter("");
                        setEndDateFilter("");
                    }}
                >
                    Xoá lọc
                </div>
            </div>

            <table className="promotion-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã khuyến mãi</th>
                        <th>Tên khuyến mãi</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Giá trị khuyến mãi</th>
                        <th>Giá trị tối thiểu</th>
                        <th>Số lượng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedPromotions.map((promotion) => (
                        <tr key={promotion.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedPromotions.includes(promotion.id)}
                                    onChange={() => handleSelectPromotion(promotion.id)}
                                />
                            </td>
                            <td>{promotion.id}</td>
                            <td>{promotion.name}</td>
                            <td>{promotion.startDate}</td>
                            <td>{promotion.endDate}</td>
                            <td>{promotion.discount}</td>
                            <td>{promotion.minPurchase}</td>
                            <td>{promotion.stock}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/promotion/${promotion.id}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon"><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                    <span>
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPromotions.length)} trong tổng số {filteredPromotions.length} khuyến mãi
                    </span>
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

export default Promotion;
