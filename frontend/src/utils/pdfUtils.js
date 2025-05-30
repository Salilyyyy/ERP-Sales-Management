import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  console.warn('PDF fonts not loaded properly. PDFs may not display correctly.');
}

const commonConfig = {
  defaultStyle: {
    fontSize: 10,
    lineHeight: 1.2
  },
  pageMargins: [40, 40, 40, 40],
  info: {
    producer: 'ERP System',
    creator: 'ERP System'
  },
  styles: {
    header: {
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 10],
      alignment: 'center'
    },
    subheader: {
      fontSize: 11,
      margin: [0, 0, 0, 10]
    },
    tableHeader: {
      bold: true,
      fontSize: 10,
      color: 'white',
      fillColor: '#2980b9',
      alignment: 'center'
    },
    table: {
      margin: [0, 5, 0, 15]
    }
  }
};

export function generatePostOfficePDF(office) {
  try {
    const docDefinition = {
      ...commonConfig,
      content: [
        { text: "CHI TIẾT BƯU CỤC", style: 'header' },
        { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: 'subheader' },
        {
          style: 'table',
          table: {
            headerRows: 1,
            widths: ['30%', '70%'],
            body: [
              [
                { text: "Thông tin", style: 'tableHeader' },
                { text: "Chi tiết", style: 'tableHeader' }
              ],
              ["Mã bưu cục", `#BC-${office.ID}`],
              ["Tên bưu cục", office.name],
              ["Số điện thoại", office.phoneNumber || ''],
              ["Email", office.email || ''],
              ["Địa chỉ", office.address || '']
            ]
          }
        }
      ]
    };

    pdfMake.createPdf(docDefinition).download(`chi-tiet-buu-cuc-${office.ID}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}

export function generateCustomerPDF(customer) {
  try {
    const docDefinition = {
      ...commonConfig,
      content: [
        { text: "CHI TIẾT KHÁCH HÀNG", style: 'header' },
        { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: 'subheader' },
        {
          style: 'table',
          table: {
            headerRows: 1,
            widths: ['30%', '70%'],
            body: [
              [
                { text: "Thông tin", style: 'tableHeader' },
                { text: "Chi tiết", style: 'tableHeader' }
              ],
              ["Mã khách hàng", `#KH-${customer.ID}`],
              ["Tên khách hàng", customer.name],
              ["Số điện thoại", customer.phoneNumber || ''],
              ["Email", customer.email || ''],
              ["Địa chỉ", customer.address || ''],
              ["Ngày tạo", new Date(customer.createdAt).toLocaleString("vi-VN")]
            ]
          }
        }
      ]
    };

    pdfMake.createPdf(docDefinition).download(`chi-tiet-khach-hang-${customer.ID}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}

export function generateEmployeePDF(employee) {
  try {
    const docDefinition = {
      ...commonConfig,
      content: [
        { text: "CHI TIẾT NHÂN VIÊN", style: 'header' },
        { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: 'subheader' },
        {
          style: 'table',
          table: {
            headerRows: 1,
            widths: ['30%', '70%'],
            body: [
              [
                { text: "Thông tin", style: 'tableHeader' },
                { text: "Chi tiết", style: 'tableHeader' }
              ],
              ["Mã nhân viên", `#NV-${employee.ID}`],
              ["Tên nhân viên", employee.name],
              ["Email", employee.email || ''],
              ["Số điện thoại", employee.phoneNumber || ''],
              ["Vai trò", employee.role === "admin" ? "Quản trị viên" : "Nhân viên"],
              ["Trạng thái", employee.isVerified ? "Đã xác thực" : "Chưa xác thực"]
            ]
          }
        }
      ]
    };

    pdfMake.createPdf(docDefinition).download(`chi-tiet-nhan-vien-${employee.ID}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}

export function exportPostOfficesToPDF(offices) {
  try {
    const docDefinition = {
      ...commonConfig,
      pageOrientation: 'landscape',
      content: [
        { text: "DANH SÁCH BƯU CỤC", style: 'header' },
        { text: `Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, style: 'subheader' },
        {
          style: 'table',
          table: {
            headerRows: 1,
            widths: ['10%', '25%', '15%', '20%', '30%'],
            body: [
              [
                { text: "Mã bưu cục", style: 'tableHeader' },
                { text: "Tên bưu cục", style: 'tableHeader' },
                { text: "Số điện thoại", style: 'tableHeader' },
                { text: "Email", style: 'tableHeader' },
                { text: "Địa chỉ", style: 'tableHeader' }
              ],
              ...offices.map(office => [
                `#BC-${office.ID}`,
                office.name,
                office.phoneNumber || '',
                office.email || '',
                office.address || ''
              ])
            ]
          }
        }
      ]
    };

    pdfMake.createPdf(docDefinition).download('danh-sach-buu-cuc.pdf');
    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    return false;
  }
}
