import React, { useState, useRef, useEffect } from "react";
import "./promotion.scss";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import apiPromotion from "../../api/apiPromotion";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

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
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const loadPromotions = async () => {
            try {
                const response = await apiPromotion.getAll();
                if (isMounted) {
                    setPromotions(response);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(error.message || "Không thể tải danh sách khuyến mãi");
                    setPromotions([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPromotions();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await apiPromotion.getAll();
            setPromotions(response);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh sách khuyến mãi");
            setPromotions([]);
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

    const handleDeleteClick = () => {
        if (selectedPromotions.length === 0) {
            toast.warn("Vui lòng chọn ít nhất một khuyến mãi để xóa");
            return;
        }
        setShowDeleteConfirm(true);
        setIsDropdownOpen(false);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteConfirm(false);
        try {
            for (const id of selectedPromotions) {
                await apiPromotion.delete(id);
            }
            toast.success(`Đã xóa ${selectedPromotions.length} khuyến mãi thành công`);
            await fetchPromotions();
            setSelectedPromotions([]);
        } catch (error) {
            toast.error(error.message || "Không thể xóa khuyến mãi");
        }
    };

    const handleExport = () => {
        toast.info("Tính năng xuất dữ liệu sẽ được cập nhật trong thời gian tới");
        setIsDropdownOpen(false);
    };

    const filteredPromotions = promotions
        .filter(promotion =>
            promotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            promotion.ID.toString().includes(searchQuery)
        )
        .filter(promotion => {
            const promoStart = new Date(promotion.dateCreate);
            const promoEnd = new Date(promotion.dateEnd);
            const from = startDateFilter ? new Date(startDateFilter) : null;
            const to = endDateFilter ? new Date(endDateFilter) : null;

            if (from && promoEnd < from) return false;
            if (to && promoStart > to) return false;
            return true;
        });

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedPromotions(newSelectAll ? filteredPromotions.map(p => p.ID) : []);
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
                                <li className="dropdown-item" onClick={handleDeleteClick}>
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

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <table className="promotion-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                                <th>ID</th>
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
                                <tr key={promotion.ID}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedPromotions.includes(promotion.ID)}
                                            onChange={() => handleSelectPromotion(promotion.ID)}
                                        />
                                    </td>
                                    <td>{promotion.ID}</td>
                                    <td>{promotion.name}</td>
                                    <td>{formatDateTime(promotion.dateCreate)}</td>
                                    <td>{formatDateTime(promotion.dateEnd)}</td>
                                    <td>{promotion.value}</td>
                                    <td>{promotion.minValue}</td>
                                    <td>{promotion.quantity}</td>
                                    <td className="action-buttons">
                                        <button className="btn-icon" onClick={() => navigate(`/promotion/${promotion.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                        <button className="btn-icon" onClick={() => navigate(`/promotion/${promotion.ID}?edit=true`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
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
                </>
            )}
            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message={`Bạn có chắc chắn muốn xóa ${selectedPromotions.length} khuyến mãi đã chọn?`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default Promotion;
