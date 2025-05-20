import React, { useState, useRef, useEffect } from "react";
import "./categories.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import ProductCategoryRepository from "../../api/apiProductCategory";

const Categories = () => {
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            console.log("Fetching categories...");
            const data = await ProductCategoryRepository.getAll();
            console.log("Processed categories data:", data);
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

  

    const handleMultipleDelete = async () => {
        try {
            if (!selectedIds || selectedIds.length === 0) {
                toast.warning("Vui lòng chọn mục cần xóa");
                return;
            }

            setIsLoading(true);

            await ProductCategoryRepository.deleteMultiple(selectedIds);
            await fetchCategories();
            setSelectedIds([]);
            setIsDropdownOpen(false);
            toast.success("Xóa thành công");
        } catch (err) {
            console.error('Delete error:', err);
            toast.error("Lỗi khi xóa: " + err.message);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };


    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.ID.toString().includes(searchQuery) ||
        (category.unit && category.unit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (category.promotion && category.promotion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (category.tax && category.tax.toString().includes(searchQuery)) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (isLoading) {
        return <div className="categories-container">Loading...</div>;
    }

    return (
        <div className="categories-container">
            <h2 className="title">Danh sách loại sản phẩm</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-category")}>Thêm mới</button>

                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            Hành động
                            <img src={downIcon} alt="▼" className="icon-down" />
                        </button>

                        {isDropdownOpen && (
                            <ul className="dropdown-menu">
                                <li className="dropdown-item" onClick={() => {
                                    if (selectedIds.length === 0) {
                                        toast.warning("Vui lòng chọn mục cần xóa");
                                        return;
                                    }
                                    setShowDeleteConfirm(true);
                                }}>
                                    <img src={deleteIcon} alt="Xóa" /> Xóa
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <table className="category-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    const ids = e.target.checked
                                        ? paginatedCategories.map(category => Number(category.ID))
                                        : [];
                                    setSelectedIds(ids);
                                    console.log('Selected IDs after select all:', ids);
                                }}
                                checked={selectedIds.length === paginatedCategories.length && paginatedCategories.length > 0}
                            />
                        </th>
                        <th>Mã</th>
                        <th>Loại sản phẩm</th>
                        <th>Đơn vị</th>
                        <th>Khuyến mãi</th>
                        <th>Thuế</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedCategories.map((category) => (
                        <tr key={category.ID}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(Number(category.ID))}
                                    onChange={(e) => {
                                        const newSelectedIds = e.target.checked
                                            ? [...selectedIds, Number(category.ID)]
                                            : selectedIds.filter(id => id !== Number(category.ID));
                                        setSelectedIds(newSelectedIds);
                                        console.log('Selected IDs after toggle:', newSelectedIds);
                                    }}
                                />
                            </td>
                            <td>{category.ID}</td>
                            <td>{category.name}</td>
                            <td>{category.unit || ''}</td>
                            <td>{category.promotion || ''}</td>
                            <td>{category.tax || ''}</td>
                            <td>{category.description || ''}</td>
                            <td className="action-buttons">
                                <button
                                    className="btn-icon"
                                    onClick={() => navigate(`/category/${category.ID}`)}
                                >
                                    <img src={viewIcon} alt="Xem" /> Xem
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={() => navigate(`/category/${category.ID}?edit=true`)}
                                >
                                    <img src={editIcon} alt="Sửa" /> Sửa
                                </button>
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
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCategories.length)} trong tổng số {filteredCategories.length} loại sản phẩm</span>
                </div>
                <div className="pagination">
                    <button className="btn-page" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>{"<"}</button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} className={`btn-page ${currentPage === index + 1 ? "active" : ""}`} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                    ))}
                    <button className="btn-page" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{">"}</button>
                </div>
            </div>

            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message="Bạn có chắc chắn muốn xóa những loại sản phẩm đã chọn?"
                onConfirm={handleMultipleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default Categories;
