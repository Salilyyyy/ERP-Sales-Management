import React, { useState } from 'react';
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./dashboardTemplate.scss";
import downloadIcon from "../../assets/img/export-icon.svg";
import upIcon from "../../assets/img/up-icon.svg";
import downIcon from "../../assets/img/down-iconn.svg";

const DashboardTemplate = ({
  showPopup,
  setShowPopup,
  timeFilter,
  setTimeFilter,
  totalRevenue,
  totalOrders,
  revenueData,
  lineChartOptions,
  topProducts,
  stockStats,
  donutCard
}) => {
  const [exportType, setExportType] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Function to handle Vietnamese text encoding for PDF
  const encodeVietnamese = (text) => {
    if (typeof text !== 'string') return text;
    
    const vietnameseMap = {
      'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
      'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
      'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
      'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
      'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
      'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
      'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
      'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
      'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
      'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
      'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
      'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
      'đ': 'd',
      'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
      'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
      'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
      'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
      'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
      'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
      'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
      'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
      'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
      'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
      'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
      'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
      'Đ': 'D'
    };
    
    return text.split('').map(char => vietnameseMap[char] || char).join('');
  };

  const handleExport = () => {
    if (exportType === "pdf") {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setLanguage("vi");

      // Set title
      doc.setFontSize(16);
      const title = encodeVietnamese("Bảng sản phẩm bán chạy");
      const pageWidth = doc.internal.pageSize.width;
      doc.text(title, pageWidth/2, 20, { align: "center" });

      // Prepare table data
      const tableRows = topProducts.map((p, index) => [
        index + 1,
        encodeVietnamese(p.name),
        encodeVietnamese(p.price),
        p.quantity,
        p.stockIn,
        p.remainingStock,
        encodeVietnamese(p.revenue)
      ]);

      // Configure table
      autoTable(doc, {
        head: [[
          "STT",
          encodeVietnamese("Ten san pham"),
          encodeVietnamese("Gia ban"),
          encodeVietnamese("Da ban"),
          encodeVietnamese("Nhap vao"),
          encodeVietnamese("Ton kho"),
          encodeVietnamese("Doanh thu")
        ]],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          minCellHeight: 14,
          valign: 'middle',
          font: 'helvetica',
          overflow: 'linebreak',
          fontStyle: 'normal'
        },
        headStyles: {
          fillColor: [109, 109, 255],
          textColor: 255,
          fontSize: 11,
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center' }, // STT
          2: { halign: 'right' },  // Giá bán
          3: { halign: 'right' },  // Đã bán
          4: { halign: 'right' },  // Nhập vào
          5: { halign: 'right' },  // Tồn kho
          6: { halign: 'right' }   // Doanh thu
        }
      });

      doc.save("thong-ke.pdf");
    } else if (exportType === "excel") {
      const excelData = topProducts.map((p, index) => ({
        STT: index + 1,
        "Tên sản phẩm": p.name,
        "Giá bán": p.price,
        "Đã bán": p.quantity,
        "Nhập vào": p.stockIn,
        "Tồn kho": p.remainingStock,
        "Doanh thu": p.revenue
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "thong-ke.xlsx");
    }

    setShowPopup(false);
  };
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan</h2>
        <button className="export-btn" onClick={() => setShowPopup(true)}>
          <img src={downloadIcon} alt="Export" /> Xuất
        </button>
      </div>

      <div className="grid-container">
        <div className="card chart-card">
          <div className="chart-header">
            <h4>Thống kê doanh thu & đơn hàng</h4>
            <div className="statistics-summary">
              <div className="stat-item">
                <label>Tổng doanh thu:</label>
                <span>{totalRevenue.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="stat-item">
                <label>Tổng đơn hàng:</label>
                <span>{totalOrders}</span>
              </div>
            </div>
            <div className="time-filter-container">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter"
              >
                <option value="day">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>
          </div>
          <Line data={revenueData} options={lineChartOptions} />
        </div>

        <div className="card stock-card">
          <h4>Hàng tồn kho</h4>
          {stockStats.map((item, index) => (
            <div className="stock-row" key={index}>
              <span>{item.label}</span>
              <div className="progress-bar">
                <div style={{ width: item.width, backgroundColor: item.color === "red" ? "#FFB6C1" : undefined }} />
              </div>
              <span className={item.color}>
                <img src={item.icon} alt="Change" /> {item.change}
              </span>
            </div>
          ))}
        </div>

        <div className="card table-card">
          <div className="table-header">
            <h4>Sản phẩm bán chạy</h4>
          </div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Đã bán</th>
                <th>Nhập vào</th>
                <th>Tồn kho</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.stockIn}</td>
                  <td>
                    <span style={{ 
                      color: product.remainingStock < 10 ? '#ff4d4f' : 
                             product.remainingStock < 30 ? '#faad14' : '#52c41a'
                    }}>
                      {product.remainingStock}
                    </span>
                  </td>
                  <td>{product.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card donut-card">
          <h4>{donutCard.title}</h4>
          <div className="donut">
            <div
              className="circle"
              style={{ '--percent': `${donutCard.percent}%` }}
            >
              {donutCard.percent.toFixed(1)}%
            </div>
            <div className="percent">
              <strong>{donutCard.target}</strong><br />
              <small>{donutCard.lastMonth}</small>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Xuất dữ liệu</h3>
            <div className="form-group">
              <label>Định dạng:</label>
              <select value={exportType} onChange={(e) => setExportType(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày bắt đầu:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ngày kết thúc:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="popup-actions">
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>Huỷ</button>
              <button className="confirm-btn" onClick={handleExport}>Xuất</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTemplate;
