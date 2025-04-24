import React, { useState, useRef, useEffect } from "react";
import "./supplier.scss";
import { useNavigate } from "react-router-dom";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierApi.getAll();
            setSuppliers(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch suppliers');
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
            try {
                await supplierApi.delete(id);
                await fetchSuppliers(); // Refresh the list
                setIsDropdownOpen(false);
            } catch (err) {
                console.error('Error deleting supplier:', err);
                alert('Failed to delete supplier');
            }
        }
    };

    const handleExport = async () => {
        try {
            // You can implement export functionality here
            alert("Xuất danh sách nhà cung cấp!");
            setIsDropdownOpen(false);
        } catch (err) {
            console.error('Error exporting suppliers:', err);
            alert('Failed to export suppliers');
        }
    };

    const filteredSuppliers = suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    if (loading) {
        return <div className="suppliers-container">Loading suppliers...</div>;
    }

    if (error) {
        return <div className="suppliers-container">Error: {error}</div>;
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

            <table className="supplier-table">
                <thead>
                    <tr>
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
                            <td>{supplier.ID}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.address}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}`)}>
                                    <img src={viewIcon} alt="Xem" /> Xem
                                </button>
                                <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}/edit`)}>
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
