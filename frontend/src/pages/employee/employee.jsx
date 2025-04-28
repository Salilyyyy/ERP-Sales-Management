import React, { useState, useRef, useEffect } from "react";
import "./employee.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { userApi } from "../../api/apiUser";
import AuthRepository from "../../api/apiAuth";
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
    const [filterType, setFilterType] = useState("all");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [currentUserRole, setCurrentUserRole] = useState(null);

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
        getCurrentUserAndEmployees();
    }, []);

    const getCurrentUserAndEmployees = async () => {
        try {
            setLoading(true);

            const currentUser = AuthRepository.getCurrentUser();
            console.log('Current user from AuthRepository:', currentUser);
            
            const userType = currentUser?.userType;
            console.log('Extracted userType:', userType);
            
            setCurrentUserRole(userType);

            const users = await userApi.getAllUsers();
            console.log('Users received:', users);
            
            // Prepare the data based on user role
            let filteredUsers;
            console.log('Raw users data:', users);
            
            // Default to 'unknown' if userType is null/undefined
            const normalizedUserType = (userType || 'unknown').toLowerCase();
            const allUsers = Array.isArray(users) ? users : [users];

            if (normalizedUserType === 'admin') {
                console.log('Admin role - showing all users');
                filteredUsers = allUsers;
            } else if (normalizedUserType === 'manager') {
                console.log('Manager role - filtering staff only');
                filteredUsers = allUsers.filter(user => {
                    const isStaff = user.userType?.toLowerCase() === 'staff';
                    console.log(`User ${user.email}: userType=${user.userType}, isStaff=${isStaff}`);
                    return isStaff;
                });
            } else if (normalizedUserType === 'staff') {
                console.log('Staff role - showing no data');
                filteredUsers = [];
            } else {
                console.log('Unknown role - showing no data');
                filteredUsers = [];
            }
            
            console.log('Filtered users to display:', filteredUsers);

            console.log('Setting filtered users:', filteredUsers);
            setEmployees(filteredUsers);

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
            toast.warning("Vui lòng chọn nhân viên để xóa");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa những nhân viên đã chọn?")) {
            try {
                await Promise.all(
                    selectedEmployees.map(id =>
                        userApi.deleteUser(id)
                    )
                );
                getCurrentUserAndEmployees();
                setSelectedEmployees([]);
                setIsDropdownOpen(false);
                toast.success("Xóa nhân viên thành công");
            } catch (err) {
                console.error("Error deleting employees:", err);
                toast.error("Có lỗi xảy ra khi xóa nhân viên");
            }
        }
    };

    const handleExport = async () => {
        try {
            const response = await userApi.get(`${userApi.route}/export`, {
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
            toast.error("Có lỗi xảy ra khi xuất danh sách");
        }
    };

    useEffect(() => {
        console.log('Employees data changed:', employees);
    }, [employees]);

    const filteredEmployees = React.useMemo(() => {
        console.log('Filtering employees:', employees);
        return employees
            .filter((employee) => {
                // Search by email, ID, or name
                const searchMatch = !searchQuery || 
                    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.ID?.toString().includes(searchQuery) ||
                    (employee.name && employee.name.toLowerCase().includes(searchQuery.toLowerCase()));

                // Filter by userType
                const typeMatch = filterType === "all" || employee.userType === filterType;

                // Filter by department
                const departmentMatch = !filterDepartment || 
                    employee.department === filterDepartment;

                return searchMatch && typeMatch && departmentMatch;
            })
            .sort((a, b) => a.ID - b.ID); // Sort by ID from lowest to highest
    }, [employees, searchQuery, filterType, filterDepartment]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setSelectedEmployees(newSelectAll ? filteredEmployees.map(e => e.ID) : []);
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

            <div className="filter">
                <div className="select-wrapper">
                    <select
                        className="filter-type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Chức vụ</option>
                        {[...new Set(employees.map(e => e.userType))].map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <div className="select-wrapper">
                    <select
                        className="filter-department"
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                        <option value="">Phòng ban</option>
                        {[...new Set(employees.map(e => e.department))].map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <img src={downIcon} alt="▼" className="icon-down" />
                </div>
                <button className="reset-filter" onClick={() => { setFilterType("all"); setFilterDepartment(""); }}>
                    Xóa lọc
                </button>
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
                            <th>Phòng ban</th>
                            <th>Điện thoại</th>
                            <th>Email</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((user) => (
                            <tr key={user.ID}>
                                <td><input type="checkbox" checked={selectedEmployees.includes(user.ID)} onChange={() => handleSelectEmployee(user.ID)} /></td>
                                <td>{user.ID}</td>
                                <td>{user.name|| "N/A"}</td>
                                <td>{user.userType}</td>
                                <td>{user.department}</td>
                                <td>{user.phoneNumber}</td>
                                <td>{user.email}</td>
                                <td className="action-buttons">
                                    <button className="btn-icon" onClick={() => navigate(`/employee/${user.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
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
