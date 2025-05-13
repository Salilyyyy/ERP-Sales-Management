import React, { useState, useRef, useEffect } from "react";
import "./categories.scss";
import { useNavigate } from "react-router-dom";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import ProductCategoryRepository from "../../api/apiProductCategory";

const Categories = () => {
    const [selectedIds, setSelectedIds] = useState([]);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: null, text: null });

    const showMessage = (text, type = 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ type: null, text: null }), 3000);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await ProductCategoryRepository.getAll();
                
                if (Array.isArray(response?.data)) {
                    setCategories(response.data);
                } else if (Array.isArray(response)) {
                    setCategories(response);
                } else {
                    showMessage("Invalid data format received");
                }
            } catch (err) {
                showMessage(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Debug log for categories
    useEffect(() => {
        console.log("Current categories:", categories);
    }, [categories]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSingleDelete = async (id) => {
        try {
            await ProductCategoryRepository.delete(id);
            const response = await ProductCategoryRepository.getAll();
            if (Array.isArray(response?.data)) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            } else {
                throw new Error("Invalid response format");
            }
            showMessage("Xóa thành công", "success");
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (err) {
            showMessage(err.message);
        }
    };

    const handleMultipleDelete = async () => {
        if (selectedIds.length === 0) {
            showMessage("Vui lòng chọn mục cần xóa");
            return;
        }
        try {
            await ProductCategoryRepository.deleteMultiple(selectedIds);
            const response = await ProductCategoryRepository.getAll();
            if (Array.isArray(response?.data)) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            } else {
                throw new Error("Invalid response format");
            }
            setSelectedIds([]);
            setIsDropdownOpen(false);
            showMessage("Xóa thành công", "success");
        } catch (err) {
            showMessage(err.message);
        }
    };

    const handleExport = async () => {
        try {
            const data = await ProductCategoryRepository.export();
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'categories.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsDropdownOpen(false);
        } catch (err) {
            showMessage(err.message);
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
            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.text}
                </div>
            )}
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
                                <li className="dropdown-item" onClick={handleMultipleDelete}>
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

            <table className="category-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    const ids = e.target.checked 
                                        ? paginatedCategories.map(category => category.ID) 
                                        : [];
                                    setSelectedIds(ids);
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
                                    checked={selectedIds.includes(category.ID)}
                                    onChange={(e) => {
                                        const newSelectedIds = e.target.checked
                                            ? [...selectedIds, category.ID]
                                            : selectedIds.filter(id => id !== category.ID);
                                        setSelectedIds(newSelectedIds);
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
        </div>
    );
};

export default Categories;
