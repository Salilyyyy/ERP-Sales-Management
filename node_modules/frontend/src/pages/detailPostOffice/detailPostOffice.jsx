import backIcon from "../../assets/img/back-icon.svg";
import deleteIcon from "../../assets/img/delete-icon.svg";
import editIcon from "../../assets/img/white-edit.svg";
import printIcon from "../../assets/img/print-icon.svg";
import "./detailPostOffice.scss";
import { useParams, useNavigate } from "react-router-dom";
import { postOffice } from "../../mock/mock";

const DetailPostOffice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const office = postOffice.find((office) => office.id.toString() === id);

    if (!office) {
        return <h2>Không tìm thấy bưu cục</h2>;
    }

    return (
        <div className="detail-postOffice-container">
            <div className="header">
                <div className="back" onClick={() => navigate("/post-office")}>
                    <img src={backIcon} alt="Quay lại" />
                </div>
                <h2>Chi tiết bưu cục</h2>
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

            <div className="detail-postOffice-content">
                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Mã bưu cục</div>
                        <div className="info-value-id">#BC-{office.id}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Tên bưu cục</div>
                        <div className="info-value">{office.name}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{office.phone}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{office.mail}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Địa chỉ</div>
                        <div className="info-value">{office.address}</div>
                    </div>
                </div>

                <div className="info-row">
                    <div className="info-item">
                        <div className="info-label">Ghi chú</div>
                        <div className="info-value">{office.note}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailPostOffice;
