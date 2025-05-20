import React, { useState, useRef, useEffect } from "react";
import "./supplier.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import BaseRepository from "../../api/baseRepository";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";
import supplierApi from "../../api/apiSupplier";

const Suppliers = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [suppliers, setSuppliers] = useState([]);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await supplierApi.getAll();
            setSuppliers(data);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách nhà cung cấp');
            console.error('Lỗi khi fetch:', err);
        }
    };

    const requestKey = supplierApi.endpoint;
    const isLoading = BaseRepository.getLoadingState(requestKey);

    const handleSelectAll = () => {
        const checked = !selectAll;
        setSelectAll(checked);
        setSelectedSuppliers(checked ? suppliers.map((s) => s.ID) : []);
    };

    const handleSelectSupplier = (id) => {
        const updated = selectedSuppliers.includes(id)
            ? selectedSuppliers.filter((sid) => sid !== id)
            : [...selectedSuppliers, id];
        setSelectedSuppliers(updated);
        setSelectAll(updated.length === suppliers.length);
    };

    const handleDeleteSelected = () => {
        if (selectedSuppliers.length === 0) {
            toast.info("Vui lòng chọn ít nhất một nhà cung cấp để xóa.");
            return;
        }
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            for (const id of selectedSuppliers) {
                await supplierApi.deleteSupplier(id);
            }
            toast.success("Xóa thành công!");
            setSelectedSuppliers([]);
            setSelectAll(false);
            fetchSuppliers();
            setIsDropdownOpen(false);
            setShowConfirmDialog(false);
        } catch (err) {
            console.error("Lỗi khi xóa:", err);
            toast.error("Không thể xóa một hoặc nhiều nhà cung cấp");
        }
    };

    const handleExport = async () => {
        try {
            toast.success("Đã xuất danh sách nhà cung cấp!");
            setIsDropdownOpen(false);
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Không thể xuất danh sách');
        }
    };

    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.ID.toString().includes(searchQuery)
    );

    filteredSuppliers.sort((a, b) => a.ID - b.ID);

    const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (isLoading) {
        return (
            <div className="suppliers-container">
                {showConfirmDialog && (
                    <ConfirmPopup
                        message="Bạn có chắc chắn muốn xóa các nhà cung cấp đã chọn?"
                        onConfirm={confirmDelete}
                        onCancel={() => setShowConfirmDialog(false)}
                    />
                )}
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="suppliers-container">Lỗi: {error}</div>;
    }

    return (
        <div className="suppliers-container">
            <h2 className="title">Danh sách nhà cung cấp</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-supplier")}>Thêm mới</button>
                    <div className="dropdown" ref={dropdownRef}>
                        <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            Hành động
                            <img src={downIcon} alt="▼" className="icon-down" />
                        </button>
                        {isDropdownOpen && (
                            <ul className="dropdown-menu">
                                <li className="dropdown-item" onClick={handleDeleteSelected}>
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

            <table className="supplier-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã</th>
                        <th>Nhà cung cấp</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedSuppliers.map((supplier) => (
                        <tr key={supplier.ID}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedSuppliers.includes(supplier.ID)}
                                    onChange={() => handleSelectSupplier(supplier.ID)}
                                />
                            </td>
                            <td>{supplier.ID}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.address}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}`)}>
                                    <img src={viewIcon} alt="Xem" /> Xem
                                </button>
                                <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}?edit=true`)}>
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
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredSuppliers.length)} trong tổng số {filteredSuppliers.length} nhà cung cấp</span>
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

export default Suppliers;
