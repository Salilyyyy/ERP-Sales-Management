import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import saveIcon from "../../assets/img/save-icon.svg";
import "./detailCategory.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ProductCategoryRepository from "../../api/apiProductCategory";

const DetailCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [editedCategory, setEditedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const isEditMode = searchParams.get("edit") === "true";
    const [isEditing, setIsEditing] = useState(isEditMode);

    const handleEditClick = () => {
        setEditedCategory({ ...category });
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("edit", "true");
        setSearchParams(newSearchParams);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await ProductCategoryRepository.update(id, editedCategory);
            setCategory(editedCategory);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedCategory(null);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("edit");
        setSearchParams(newSearchParams);
    };

    const handleInputChange = (field, value) => {
        setEditedCategory(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await ProductCategoryRepository.getById(id);
                setCategory(response);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    useEffect(() => {
        if (isEditMode && category) {
            setIsEditing(true);
            setEditedCategory({ ...category });
        } else {
            setIsEditing(false);
        }
    }, [isEditMode, searchParams, category]);

    if (loading) return <h2>Đang tải...</h2>;
    if (error) return <h2>Lỗi: {error}</h2>;
    if (!category) return <h2>Không tìm thấy loại sản phẩm</h2>;

    return (
        <div className="detail-category-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/categories")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết loại sản phẩm</h2>
            </div>
            <div className="actions">
                <button className="delete"><img src={deleteIcon} alt="Xóa" /> Xóa</button>
                {isEditing ? (
                    <>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                        <button className="cancel" onClick={handleCancel}>
                            Hủy
                        </button>
                    </>
                ) : (
                    <button className="edit" onClick={handleEditClick}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
                )}
                <button className="print"><img src={printIcon} alt="In" /> In </button>
            </div>

            <div className="detail-category-content">
                <div className="info-item">
                    <div className="info-label">Loại sản phẩm</div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCategory.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="info-input"
                        />
                    ) : (
                        <div className="info-value">{category.name}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Đơn vị tính</div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCategory.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                            className="info-input"
                        />
                    ) : (
                        <div className="info-value">{category.unit}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Trạng thái</div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCategory.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="info-input"
                        />
                    ) : (
                        <div className="info-value">{category.status}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Khuyến mãi</div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCategory.promotion || ''}
                            onChange={(e) => handleInputChange('promotion', e.target.value)}
                            className="info-input"
                        />
                    ) : (
                        <div className="info-value">{category.promotion || '5%'}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Thuế</div>
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCategory.tax || ''}
                            onChange={(e) => handleInputChange('tax', e.target.value)}
                            className="info-input"
                        />
                    ) : (
                        <div className="info-value">{category.tax || '10%'}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Mô tả</div>
                    {isEditing ? (
                        <textarea
                            value={editedCategory.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="info-input description"
                        />
                    ) : (
                        <div className="info-value">{category.description}</div>
                    )}
                </div>
                <div className="info-item">
                    <div className="info-label">Ghi chú</div>
                    {isEditing ? (
                        <textarea
                            value={editedCategory.notes || ''}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="info-input description"
                        />
                    ) : (
                        <div className="info-value">{category.notes}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetailCategory;
