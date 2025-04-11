import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailSupplier.scss";
import { useParams, useNavigate } from "react-router-dom";
import { suppliers } from "../../mock/mock";

const DetailSupplier = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const supplier = suppliers.find((sup) => sup.id.toString() === id);

    if (!supplier) {
        return <h2>Không tìm thấy nhà cung cấp</h2>;
    }

    return (
        <div className="detail-supplier-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/supplier-list")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết nhà cung cấp</h2>
            </div>

            <div className="actions">
                <button className="delete">
                    <img src={deleteIcon} alt="Xóa" /> Xóa
                </button>
                <button className="edit">
                    <img src={editIcon} alt="Sửa" /> Sửa
                </button>
                <button className="print">
                    <img src={printIcon} alt="In" /> In
                </button>
            </div>

            <div className="detail-supplier-content">
                <div className="supplier-info">
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Tên nhà cung cấp</div>
                            <div className="info-value">{supplier.name}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Mã nhà cung cấp</div>
                            <div className="info-value-id">#NCC-{supplier.id}</div>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Số điện thoại</div>
                            <div className="info-value">{supplier.phone}</div>
                        </div>
                    </div>
                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Email</div>
                            <div className="info-value">{supplier.mail}</div>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Mã số thuế</div>
                            <div className="info-value">{supplier.numbertax}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Quốc gia</div>
                            <div className="info-value">{supplier.country}</div>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="info-item">
                            <div className="info-label">Đại diện</div>
                            <div className="info-value">{supplier.representative}</div>
                        </div>
                        <div className="info-item">
                            <div className="info-label">Điện thoại</div>
                            <div className="info-value">{supplier.phoneofrepresentative}</div>
                        </div>
                    </div>

                    <div className="info-row full-width">
                        <div className="info-item">
                            <div className="info-label">Địa chỉ</div>
                            <div className="info-value">{supplier.address}</div>
                        </div>
                    </div>

                    <div className="info-row full-width">
                        <div className="info-item">
                            <div className="info-label">Ghi chú</div>
                            <div className="info-value">{supplier.notes}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailSupplier;
