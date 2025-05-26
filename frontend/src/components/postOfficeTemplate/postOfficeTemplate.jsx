import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-toastify';

export const exportPostOfficesToPDF = (postOffices) => {
    try {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const removeVietnameseTones = (str) => {
            if (!str) return "";
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");
            return str;
        };

        doc.setFontSize(18);
        doc.text("DANH SACH BUU CUC", 14, 20);

        doc.setFontSize(11);
        doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 14, 30);

        const headers = [["Ma buu cuc", "Ten buu cuc", "So dien thoai", "Email", "Dia chi"]];
        
        const data = postOffices.map(office => [
            `#BC-${office.ID}`,
            removeVietnameseTones(office.name),
            office.phoneNumber || "",
            office.email || "",
            removeVietnameseTones(office.address)
        ]);

        autoTable(doc, {
            head: headers,
            body: data,
            startY: 35,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 4,
                font: 'helvetica',
                halign: 'left',
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 25 }, 
                1: { cellWidth: 40 }, 
                2: { cellWidth: 30 }, 
                3: { cellWidth: 40 }, 
                4: { cellWidth: 55 }  
            },
            margin: { top: 35, left: 10 }
        });

        doc.save(`danh-sach-buu-cuc-${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (error) {
        console.error("Error exporting PDF:", error);
        toast.error("Xuất PDF thất bại!");
        return false;
    }
};

export default function PostOfficeTemplate() {
    return null;
}
