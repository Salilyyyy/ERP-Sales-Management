import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailStockIn.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import BaseRepository from "../../api/baseRepository";
import apiStockIn from "../../api/apiStockIn";
import saveIcon from "../../assets/img/save-icon.svg";
import { toast } from 'react-toastify';

const DetailStockIn = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stockinData, setStockinData] = useState(null);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [isEditing, setIsEditing] = useState(isEditMode);
    const [editedData, setEditedData] = useState(null);

    const handleEditClick = () => {
        if (!stockinData || !stockinData.stockinDate) {
            toast.error("Không thể sửa: Dữ liệu không hợp lệ");
            return;
        }
        try {
            const date = new Date(stockinData.stockinDate);
            setEditedData({
                stockinDate: date.toISOString().split('T')[0],
                notes: stockinData.notes || ''
            });
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
                        notes: data.notes || ''
                    });
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
    const isLoading = BaseRepository.getLoadingState(requestKey);

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
                {isEditing && <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>}
                {isEditing ? (
                    <>
                        <button className="save" onClick={async () => {
                            try {
                                const updateData = {
                                    stockinDate: editedData.stockinDate,
                                    notes: editedData.notes || '',
                                    supplierID: stockinData.supplier?.ID
                                };

                                await apiStockIn.update(id, updateData);
                                const refreshedData = await apiStockIn.getById(id);
                                if (!refreshedData || !refreshedData.ID) {
                                    throw new Error('Failed to refresh data');
                                }
                                setStockinData(refreshedData);
                                setIsEditing(false);
                                setEditedData(null);
                                const newSearchParams = new URLSearchParams(searchParams);
                                newSearchParams.delete("edit");
                                setSearchParams(newSearchParams);
                                toast.success("Cập nhật thành công");
                            } catch (err) {
                                console.error('Update error:', err);
                                toast.error("Lỗi khi cập nhật: " + err.message);
                            }
                        }}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                        <button className="cancel" onClick={handleCancel}>Hủy</button>
                    </>
                ) : (
                    <button className="edit" onClick={handleEditClick}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
                )}
                <button className="print"><img src={printIcon} alt="In" /> In </button>
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
                                value={editedData?.stockinDate ? new Date(editedData.stockinDate).toISOString().split('T')[0] : ''}
                                onChange={(e) => setEditedData(prev => ({ ...prev, stockinDate: e.target.value }))}
                            />
                    ) : (
                        <div className="info-value">{new Date(stockinData.stockinDate).toLocaleDateString()}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Nhà cung cấp</div>
                    <div className="info-value">
                        {stockinData.supplier?.name || 'N/A'}
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-label">Email nhà cung cấp</div>
                    <div className="info-value">
                        {stockinData.supplier?.email || 'N/A'}
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-label">Địa chỉ nhà cung cấp</div>
                    <div className="info-value">
                        {stockinData.supplier?.address || 'N/A'}
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-label">Quốc gia</div>
                    <div className="info-value">
                        {stockinData.supplier?.country || 'N/A'}
                    </div>
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
                                        <td className="text-right">{((detail.quantity || 0) * (detail.unitPrice || 0)).toLocaleString()} VNĐ</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="4">Tổng cộng:</td>
                                    <td>
                                        {(stockinData.DetailStockins || []).reduce((total, detail) => total + ((detail.quantity || 0) * (detail.unitPrice || 0)), 0).toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailStockIn;
