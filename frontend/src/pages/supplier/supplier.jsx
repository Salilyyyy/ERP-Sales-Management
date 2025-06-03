import React, { useState, useRef, useEffect, useMemo } from "react";
import apiAuth from "../../api/apiAuth";
import "./supplier.scss";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import SupplierTemplate from "../../components/supplierTemplate/supplierTemplate";
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
    const currentUser = useMemo(() => {
        const user = apiAuth.getCurrentUser();
        console.log('Current user:', user);
        return user;
    }, []);
    const isStaff = currentUser?.userType === 'staff';
    console.log('Is staff:', isStaff);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [suppliers, setSuppliers] = useState([]);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSupplierData, setSelectedSupplierData] = useState(null);
    const supplierTemplateRef = useRef(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
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

    const handleDelete = () => {
        if (selectedSuppliers.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một nhà cung cấp");
            return;
        }
        setShowDeleteConfirm(true);
    };

    const handleExport = async () => {
        if (selectedSuppliers.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một nhà cung cấp");
            return;
        }

        try {
            setIsPrinting(true);
            const selectedItems = suppliers.filter(sup => selectedSuppliers.includes(sup.ID));

            if (!selectedItems.length) {
                toast.error("Không tìm thấy thông tin nhà cung cấp");
                return;
            }

            const doc = new jsPDF('p', 'pt', 'a4');

            for (let i = 0; i < selectedItems.length; i++) {
                setSelectedSupplierData(selectedItems[i]);

                await new Promise(resolve => {
                    requestAnimationFrame(() => {
                        setTimeout(resolve, 500);
                    });
                });

                if (i > 0) {
                    doc.addPage();
                }

                const canvas = await html2canvas(supplierTemplateRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    onclone: (document) => {
                        const element = document.querySelector('.supplier-template');
                        if (element) {
                            element.style.display = 'block';
                            element.style.width = '100%';
                            element.style.height = 'auto';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const pageWidth = doc.internal.pageSize.getWidth();
                const imgWidth = 400;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                const xOffset = (pageWidth - imgWidth) / 2;

                doc.addImage(imgData, 'JPEG', xOffset, 20, imgWidth, imgHeight, '', 'FAST');
            }

            doc.save('suppliers.pdf');
            setIsPrinting(false);
            setIsDropdownOpen(false);
            setSelectedSupplierData(null);
            toast.success("Xuất PDF thành công");
        } catch (err) {
            toast.error("Có lỗi xảy ra khi xuất PDF");
            setIsPrinting(false);
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
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="suppliers-container">Lỗi: {error}</div>;
    }

    return (
        <div className="suppliers-container">
            <ConfirmPopup
                isOpen={showDeleteConfirm}
                message="Bạn có chắc chắn muốn xóa các nhà cung cấp đã chọn?"
                onConfirm={async () => {
                    try {
                        await Promise.all(
                            selectedSuppliers.map(id =>
                                supplierApi.deleteSupplier(id)
                            )
                        );
                        fetchSuppliers();
                        setSelectedSuppliers([]);
                        setSelectAll(false);
                        setIsDropdownOpen(false);
                        setShowDeleteConfirm(false);
                        toast.success("Xóa nhà cung cấp thành công");
                    } catch (err) {
                        console.error("Error deleting suppliers:", err);
                        const errorMessage = err.response?.data?.error || "Có lỗi xảy ra khi xóa nhà cung cấp";
                        toast.error(errorMessage);
                    }
                    setShowDeleteConfirm(false);
                }}
                onCancel={() => setShowDeleteConfirm(false)}
            />
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
                {!isStaff && (
                    <div className="button">
                        <button className="btn add" onClick={() => navigate("/create-supplier")}>Thêm mới</button>
                        <div className="dropdown" ref={dropdownRef}>
                            <button className="btn action" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                Hành động
                                <img src={downIcon} alt="▼" className="icon-down" />
                            </button>
                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li className="dropdown-item" onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleDelete();
                                    }}>
                                        <img src={deleteIcon} alt="Xóa" /> Xóa
                                    </li>
                                    <li className="dropdown-item" onClick={handleExport}>
                                        <img src={exportIcon} alt="Xuất" /> Xuất
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={supplierTemplateRef} style={{ width: '595px', background: '#fff', margin: '0 auto' }}>
                    {isPrinting && selectedSupplierData && (
                        <SupplierTemplate supplier={selectedSupplierData} />
                    )}
                </div>
            </div>

            <table className="supplier-table">
                <thead>
                    <tr>
                        {!isStaff && <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>}
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
                            {!isStaff && (
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedSuppliers.includes(supplier.ID)}
                                        onChange={() => handleSelectSupplier(supplier.ID)}
                                    />
                                </td>
                            )}
                            <td>{supplier.ID}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.address}</td>
                            <td className="action-buttons">
                                <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}`)}>
                                    <img src={viewIcon} alt="Xem" /> Xem
                                </button>
                                {!isStaff && (
                                    <button className="btn-icon" onClick={() => navigate(`/supplier/${supplier.ID}?edit=true`)}>
                                        <img src={editIcon} alt="Sửa" /> Sửa
                                    </button>
                                )}
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
