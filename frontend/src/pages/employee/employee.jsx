import React, { useState, useRef, useEffect } from "react";
import "./employee.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import viewIcon from "../../assets/img/view-icon.svg";
import editIcon from "../../assets/img/edit-icon.svg";
import searchIcon from "../../assets/img/search-icon.svg";
import downIcon from "../../assets/img/down-icon.svg";
import deleteIcon from "../../assets/img/green-delete-icon.svg";
import exportIcon from "../../assets/img/export-icon.svg";

const Employee = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterType] = useState("all");
    const [filterName] = useState("");

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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/users');
            setEmployees(response.data);
            setError(null);
        } catch (err) {
            setError("Không thể tải danh sách nhân viên");
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (selectedEmployees.length === 0) {
            alert("Vui lòng chọn nhân viên để xóa");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa những nhân viên đã chọn?")) {
            try {
                await Promise.all(
                    selectedEmployees.map(id => 
                        axios.delete(`/api/users/${id}`)
                    )
                );
                fetchEmployees();
                setSelectedEmployees([]);
                setIsDropdownOpen(false);
                alert("Xóa nhân viên thành công");
            } catch (err) {
                console.error("Error deleting employees:", err);
                alert("Có lỗi xảy ra khi xóa nhân viên");
            }
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/users/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'employees.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setIsDropdownOpen(false);
        } catch (err) {
            console.error("Error exporting employees:", err);
            alert("Có lỗi xảy ra khi xuất danh sách");
        }
    };

    const filteredEmployees = employees
    .filter((employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.id.toString().includes(searchQuery)
    )
    .filter((employee) => 
        filterType === "all" ? true : employee.id === parseInt(filterType)
    )
    .filter((employee) => employee.name.toLowerCase().includes(filterName.toLowerCase()));

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedEmployees(newSelectAll ? filteredEmployees.map(e => e.id) : []);
    };

    const handleSelectEmployee = (id) => {
        let updatedSelection = selectedEmployees.includes(id)
            ? selectedEmployees.filter((employeeId) => employeeId !== id)
            : [...selectedEmployees, id];

        setSelectedEmployees(updatedSelection);
        setSelectAll(updatedSelection.length === filteredEmployees.length);
    };

    const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="employee-container">
            <h2 className="title">Danh sách nhân viên</h2>

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
                    <button className="btn add" onClick={() => navigate("/create-employee")}>Thêm mới</button>
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
            
            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <table className="order-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                        <th>Mã nhân viên</th>
                        <th>Tên nhân viên</th>
                        <th>Chức vụ</th>
                        <th>Điện thoại</th>
                        <th>Email</th>
                        <th>Địa chỉ</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedEmployees.map((employee) => (
                        <tr key={employee.id}>
                            <td><input type="checkbox" checked={selectedEmployees.includes(employee.id)} onChange={() => handleSelectEmployee(employee.id)} /></td>
                            <td>{employee.id}</td>
                            <td>{employee.name}</td>
                            <td>{employee.role}</td>
                            <td>{employee.phone}</td>
                            <td>{employee.mail}</td>
                            <td>{employee.address}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/employee/${employee.id}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                <button className="btn-icon"><img src={editIcon} alt="Sửa" /> Sửa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            )}

            <div className="pagination-container">
                <div className="pagination-left">
                    <select value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                        <option value={5}>5 hàng</option>
                        <option value={10}>10 hàng</option>
                        <option value={15}>15 hàng</option>
                    </select>
                    <span>Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredEmployees.length)} trong tổng số {filteredEmployees.length} nhân viên</span>
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

export default Employee;
