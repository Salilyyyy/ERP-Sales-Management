import backIcon from "../../assets/img/back-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import exportIcon from "../../assets/img/print-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import "./detailStockIn.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiStockIn from "../../api/apiStockIn";
import apiSupplier from "../../api/apiSupplier";
import { toast } from 'react-toastify';
import StockInTemplate from '../../components/stockinTemplate/stockinTemplate';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DetailStockIn = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stockinData, setStockinData] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [isEditing, setIsEditing] = useState(isEditMode);
    const [editedData, setEditedData] = useState(null);
    const [isLoadingRequest, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    const handleEditClick = async () => {
        if (!stockinData || !stockinData.stockinDate) {
            toast.error("Không thể sửa: Dữ liệu không hợp lệ");
            return;
        }
        try {
            const date = new Date(stockinData.stockinDate);
            setEditedData({
                stockinDate: date.toISOString().split('T')[0],
                notes: stockinData.notes || '',
                supplierID: stockinData.supplierID
            });

            // Fetch suppliers list
            const fetchedSuppliers = await apiSupplier.getAll();
            setSuppliers(fetchedSuppliers);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("edit", "true");
            setSearchParams(newSearchParams);
            setIsEditing(true);
        } catch (err) {
            console.error('Error in edit mode:', err);
            toast.error("Lỗi khi chuyển sang chế độ sửa");
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(null);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updatedData = {
                ...stockinData,
                stockinDate: editedData.stockinDate,
                notes: editedData.notes,
                supplierID: editedData.supplierID,
                DetailStockins: stockinData.DetailStockins
            };
            await apiStockIn.update(id, updatedData);
            setStockinData(updatedData);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
            setIsEditing(false);
            toast.success("Cập nhật thành công");
        } catch (error) {
            console.error("Error updating stock-in: ", error);
            setError(error.message);
            toast.error("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchStockIn = async () => {
            try {
                const data = await apiStockIn.getById(id);
                if (!data || !data.ID) {
                    throw new Error('No data found');
                }
                setStockinData(data);
                if (isEditMode && data.stockinDate) {
                    setEditedData({
                        stockinDate: new Date(data.stockinDate).toISOString().split('T')[0],
                        notes: data.notes || '',
                        supplierID: data.supplierID
                    });
                    // Fetch suppliers list when in edit mode
                    const fetchedSuppliers = await apiSupplier.getAll();
                    setSuppliers(fetchedSuppliers);
                }
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Failed to fetch stock-in:', err);
            }
        };

        fetchStockIn();
    }, [id, isEditMode]);

    const requestKey = `/stockins/${id}`;
    const isLoading = BaseRepository.getLoadingState(requestKey) || isLoadingRequest;

    if (isLoading) {
        return (
            <div className="detail-stockin-container">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return <div className="error">Lỗi: {error}</div>;
    }

    if (!stockinData) {
        return <h2>Không tìm thấy đơn nhập kho</h2>;
    }
    return (
        <div className="detail-stockin-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/stock-history")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết đơn nhập kho</h2>
            </div>

            <div className="actions">
                {!isEditing ? (
                    <>
                        <button className="edit" onClick={handleEditClick}>
                            <img src={editIcon} alt="Sửa" /> Sửa
                        </button>
                        <button className="print" onClick={async () => {
                            const template = document.querySelector('#pdf-template .stockin-template');
                            if (!template) {
                                toast.error("Không thể tìm thấy mẫu xuất");
                                return;
                            }

                            try {
                                // Wait for template to be fully rendered
                                await new Promise(resolve => setTimeout(resolve, 500));

                                // Create canvas from template
                                const canvas = await html2canvas(template, {
                                    scale: 2,
                                    backgroundColor: '#ffffff',
                                    logging: false,
                                    useCORS: true,
                                    allowTaint: true
                                });

                                // Create PDF with A4 dimensions
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const pageWidth = pdf.internal.pageSize.getWidth();
                                const pageHeight = pdf.internal.pageSize.getHeight();

                                // Calculate dimensions while maintaining aspect ratio
                                const imgWidth = pageWidth - 20; // 10mm margin on each side
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                                // Add image to PDF centered
                                const x = 10; // left margin
                                const y = 10; // top margin
                                pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', x, y, imgWidth, imgHeight);

                                // Save PDF
                                pdf.save(`phieu-nhap-kho-${stockinData.ID}.pdf`);
                                toast.success("Xuất PDF thành công");
                            } catch (error) {
                                console.error("Error generating PDF:", error);
                                toast.error("Lỗi khi xuất PDF");
                            }
                        }}>
                            <img src={exportIcon} alt="Xuất" /> Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                        <button className="cancel" onClick={handleCancel}>Hủy</button>
                    </>
                )}
            </div>

            <div className="detail-stockin-content">
                <div className="info-item">
                    <div className="info-label">Mã đơn nhập kho</div>
                    <div className="info-value">{stockinData.ID}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ngày nhập kho</div>
                    {isEditing ? (
                        <input
                            type="date"
                            className="info-value"
                            value={editedData?.stockinDate || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, stockinDate: e.target.value }))}
                        />
                    ) : (
                        <div className="info-value">{new Date(stockinData.stockinDate).toLocaleDateString()}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Nhà cung cấp</div>
                    {isEditing ? (
                        <select
                            className="info-value supplier-select"
                            value={editedData?.supplierID || stockinData.supplierID}
                            onChange={(e) => {
                                const selectedSupplier = suppliers.find(s => s.ID === parseInt(e.target.value));
                                setEditedData(prev => ({
                                    ...prev,
                                    supplierID: parseInt(e.target.value)
                                }));
                                setStockinData(prev => ({
                                    ...prev,
                                    supplier: selectedSupplier
                                }));
                            }}
                        >
                            {suppliers.map(supplier => (
                                <option key={supplier.ID} value={supplier.ID}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="info-value">{stockinData.supplier?.name || 'N/A'}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Email nhà cung cấp</div>
                    <div className="info-value">{stockinData.supplier?.email || 'N/A'}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Địa chỉ nhà cung cấp</div>
                    <div className="info-value">{stockinData.supplier?.address || 'N/A'}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Quốc gia</div>
                    <div className="info-value">{stockinData.supplier?.country || 'N/A'}</div>
                </div>
                <div className="info-item">
                    <div className="info-label">Ghi chú</div>
                    {isEditing ? (
                        <input
                            type="text"
                            className="info-value"
                            value={editedData?.notes || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    ) : (
                        <div className="info-value">{stockinData.notes || 'N/A'}</div>
                    )}
                </div>


            </div>
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }} id="pdf-template">
                <StockInTemplate stockIn={stockinData} />
            </div>

            <div className="info-table">
                <div className="list-product">Danh sách sản phẩm</div>
                <div className="info-value">
                    <table>
                        <thead>
                            <tr>
                                <th className="text-left">Tên sản phẩm</th>
                                <th className="text-left">Loại</th>
                                <th className="text-right">Số lượng</th>
                                <th className="text-right">Đơn giá</th>
                                <th className="text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockinData.DetailStockins?.map((detail) => (
                                <tr key={detail.ID}>
                                    <td className="text-left">{detail.Products?.name || "Không có sản phẩm"}</td>
                                    <td className="text-left">{detail.Products?.productCategory?.name || "Không có loại"}</td>
                                    <td className="text-right">{detail.quantity || 0}</td>
                                    <td className="text-right">{detail.unitPrice?.toLocaleString() || 0} VNĐ</td>
                                    <td className="text-right">
                                        {((detail.quantity || 0) * (detail.unitPrice || 0)).toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="total-row">
                                <td colSpan="5">
                                    <span>Tổng cộng:</span>
                                    <span className="total-amount">
                                        {(stockinData.DetailStockins || []).reduce(
                                            (total, detail) => total + ((detail.quantity || 0) * (detail.unitPrice || 0)),
                                            0
                                        ).toLocaleString()} VNĐ
                                    </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DetailStockIn;
