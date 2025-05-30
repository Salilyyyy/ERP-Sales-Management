import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import ConfirmPopup from "../../components/confirmPopup/confirmPopup";
import saveIcon from "../../assets/img/save-icon.svg";
import "./detailCategory.scss";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProductCategoryRepository from "../../api/apiProductCategory";

const units = [
    "Cái",
    "Chiếc",
    "Bộ",
];

const DetailCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [editedCategory, setEditedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            toast.success("Sửa loại sản phẩm thành công");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("edit");
            setSearchParams(newSearchParams);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            await ProductCategoryRepository.delete(id);
            toast.success("Xóa loại sản phẩm thành công");
            navigate("/categories");
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
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
                {isEditing ? null : (
                    <>
                        <button className="delete" onClick={handleDelete}>
                            <img src={deleteIcon} alt="Xóa" /> Xóa
                        </button>
                    </>
                )}
                {isEditing ? (
                    <>
                        <button className="save" onClick={handleSave}>
                            <img src={saveIcon} alt="Lưu" /> Lưu
                        </button>
                    </>
                ) : (
                    <button className="edit" onClick={handleEditClick}>
                        <img src={editIcon} alt="Sửa" /> Sửa
                    </button>
                )}
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
                        <select
                            value={editedCategory.unit}
                            onChange={(e) => handleInputChange('unit', e.target.value)}
                            className="info-input"
                        >
                            <option value="">Chọn đơn vị tính</option>
                            {units.map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="info-value">{category.unit}</div>
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
            <ConfirmPopup 
                isOpen={showDeleteConfirm}
                message="Bạn có chắc chắn muốn xóa loại sản phẩm này?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
        </div>
    );
}

export default DetailCategory;
