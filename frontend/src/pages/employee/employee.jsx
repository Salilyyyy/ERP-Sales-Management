import React, { useState, useRef, useEffect, createRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./employee.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import { userApi } from "../../api/apiUser";
import EmployeeTemplate from "../../components/employeeTemplate/employeeTemplate";
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            const userType = currentUser?.userType;
            setCurrentUserRole(userType);

            const users = await userApi.getAllUsers();
            
            let filteredUsers;
            const allUsers = Array.isArray(users) ? users : [users];
            const normalizedUserType = (userType || 'unknown').toLowerCase();

            if (normalizedUserType === 'admin') {
                filteredUsers = allUsers.filter(user => {
                    const userTypeLC = user.userType?.toLowerCase();
                    return userTypeLC === 'staff' || userTypeLC === 'manager';
                });
            } else if (normalizedUserType === 'manager') {
                filteredUsers = allUsers.filter(user => 
                    user.userType?.toLowerCase() === 'staff'
                );
            } else {
                filteredUsers = [];
            }
            
            setEmployees(filteredUsers);
            setError(null);
        } catch (err) {
            setError("Không thể tải danh sách nhân viên");
            console.error("Error fetching employees:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (selectedEmployees.length === 0) {
            toast.warning("Vui lòng chọn nhân viên để xóa");
            return;
        }
        setShowDeleteConfirm(true);
    };

    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
    const employeeTemplateRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);

const handleExport = async () => {
        if (selectedEmployees.length === 0) {
            toast.warning("Vui lòng chọn nhân viên để xuất PDF");
            return;
        }

        try {
            setIsPrinting(true);
            const selectedUsers = employees.filter(emp => selectedEmployees.includes(emp.ID));
            
            if (!selectedUsers.length) {
                toast.error("Không tìm thấy thông tin nhân viên");
                return;
            }

            const doc = new jsPDF('p', 'pt', 'a4');

            for (let i = 0; i < selectedUsers.length; i++) {
                setSelectedEmployeeData(selectedUsers[i]);
                
                // Wait for template to render with new data
                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        setTimeout(resolve, 500);
                    });
                });
                
                if (i > 0) {
                    doc.addPage();
                }

                const canvas = await html2canvas(employeeTemplateRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (document) => {
                        const element = document.querySelector('.employee-template');
                        if (element) {
                            element.style.display = 'block';
                            element.style.width = '100%';
                            element.style.height = 'auto';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pageWidth = doc.internal.pageSize.getWidth();
                // Use standard A4 width in points (595) and add margins
                const imgWidth = 515; // 595 - 80pt margins
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                const xOffset = (pageWidth - imgWidth) / 2;
                
                doc.addImage(imgData, 'JPEG', xOffset, 20, imgWidth, imgHeight, '', 'FAST');
            }

            doc.save('employees.pdf');
            setIsPrinting(false);
            setIsDropdownOpen(false);
            setSelectedEmployeeData(null);
            toast.success("Xuất PDF thành công");
        } catch (err) {
            console.error("Error exporting employees to PDF:", err);
            toast.error("Có lỗi xảy ra khi xuất PDF");
            setIsPrinting(false);
        }
    };

    const filteredEmployees = React.useMemo(() => {
        return employees
            .filter((employee) => {
                const searchMatch = !searchQuery || 
                    employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    employee.ID?.toString().includes(searchQuery) ||
                    (employee.name && employee.name.toLowerCase().includes(searchQuery.toLowerCase()));

                const typeMatch = filterType === "all" || employee.userType === filterType;
                const departmentMatch = !filterDepartment || employee.department === filterDepartment;

                return searchMatch && typeMatch && departmentMatch;
            })
            .sort((a, b) => a.ID - b.ID); 
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
            
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={employeeTemplateRef} style={{ width: '595px', background: '#fff', margin: '0 auto' }}>
                    {isPrinting && selectedEmployeeData && (
                        <EmployeeTemplate user={selectedEmployeeData} />
                    )}
                </div>
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
                                    <img src={exportIcon} alt="Xuất PDF" /> Xuất
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
                            <th>Họ và tên</th>
                            <th>Chức vụ</th>
                            <th>Phòng ban</th>
                            <th>Email</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmployees.map((user) => (
                            <tr key={user.ID}>
                                <td><input type="checkbox" checked={selectedEmployees.includes(user.ID)} onChange={() => handleSelectEmployee(user.ID)} /></td>
                                <td>{user.name || "N/A"}</td>
                                <td>{user.userType}</td>
                                <td>{user.department}</td>
                                <td>{user.email}</td>
                                <td className="action-buttons">
                                    <button className="btn-icon" onClick={() => navigate(`/employee/${user.ID}`)}><img src={viewIcon} alt="Xem" /> Xem</button>
                                    <button className="btn-icon" onClick={() => navigate(`/employee/${user.ID}?edit=true`)}><img src={editIcon} alt="Sửa" /> Sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <ConfirmPopup 
                isOpen={showDeleteConfirm}
                message="Bạn có chắc chắn muốn xóa những nhân viên đã chọn?"
                onConfirm={async () => {
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
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
            />

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
