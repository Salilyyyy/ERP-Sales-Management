import React, { useState } from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./dashboardTemplate.scss";
import downloadIcon from "../../assets/img/export-icon.svg";


const DashboardTemplate = ({
  language,
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFontSize(18);
    doc.text(encodeVietnamese(language === 'en' ? "Overview Report" : "Báo cáo tổng quan"), doc.internal.pageSize.width/2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(encodeVietnamese(language === 'en' ? `From: ${startDate} - To: ${endDate}` : `Từ ngày: ${startDate} - Đến ngày: ${endDate}`), doc.internal.pageSize.width/2, 30, { align: "center" });

    doc.setFontSize(14);
    doc.text(encodeVietnamese(language === 'en' ? "Revenue & Orders Statistics" : "Thống kê doanh thu & đơn hàng"), 14, 45);
    doc.setFontSize(12);
    doc.text(encodeVietnamese(language === 'en' ? `Total Revenue: ${totalRevenue.toLocaleString('vi-VN')}đ` : `Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')}đ`), 14, 55);
    doc.text(encodeVietnamese(language === 'en' ? `Total Orders: ${totalOrders}` : `Tổng đơn hàng: ${totalOrders}`), 14, 65);

    doc.setFontSize(14);
    doc.text(encodeVietnamese(language === 'en' ? "Inventory" : "Hàng tồn kho"), 14, 85);
    doc.setFontSize(12);
    let yPos = 95;
    stockStats.forEach(item => {
      doc.text(encodeVietnamese(`${item.label}: ${item.change}`), 14, yPos);
      yPos += 10;
    });

    const tableRows = topProducts.map((p, index) => [
      index + 1,
      encodeVietnamese(p.name),
      encodeVietnamese(p.price),
      p.quantity,
      p.stockIn,
      p.remainingStock,
      encodeVietnamese(p.revenue)
    ]);

    autoTable(doc, {
      head: [[
        language === 'en' ? "No." : "STT",
        encodeVietnamese(language === 'en' ? "Product Name" : "Tên sản phẩm"),
        encodeVietnamese(language === 'en' ? "Price" : "Giá bán"),
        encodeVietnamese(language === 'en' ? "Sold" : "Đã bán"),
        encodeVietnamese(language === 'en' ? "Stock In" : "Nhập vào"),
        encodeVietnamese(language === 'en' ? "In Stock" : "Tồn kho"),
        encodeVietnamese(language === 'en' ? "Revenue" : "Doanh thu")
      ]],
      body: tableRows,
      startY: yPos + 20,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        minCellHeight: 14,
        valign: 'middle',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [109, 109, 255],
        textColor: 255,
        fontSize: 11,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      }
    });

    const finalY = (doc.previousAutoTable?.finalY || yPos + 80) + 20;
    doc.setFontSize(14);
    doc.text(encodeVietnamese(language === 'en' ? "Customer Statistics" : "Thống kê khách hàng"), 14, finalY);
    doc.setFontSize(12);
    doc.text(encodeVietnamese(language === 'en' ? `${donutCard.newCustomers} new customers (in the last 30 days)` : `${donutCard.newCustomers} khách hàng mới (trong 30 ngày qua)`), 14, finalY + 10);
    doc.text(encodeVietnamese(donutCard.lastMonth), 14, finalY + 20);

    doc.save("bao-cao-tong-quan.pdf");

    setShowPopup(false);
  };
  return (
    <div className="page-container dashboard">
      <div className="dashboard-header">
        <h2>{language === 'en' ? "Overview" : "Tổng quan"}</h2>
        <button className="export-btn" onClick={() => setShowPopup(true)}>
          <img src={downloadIcon} alt="Export" /> {language === 'en' ? "Export" : "Xuất"}
        </button>
      </div>

      <div className="grid-container">
        <div className="card chart-card">
          <div className="chart-header">
            <h4>{language === 'en' ? "Revenue & Orders Statistics" : "Thống kê doanh thu & đơn hàng"}</h4>
            <div className="statistics-summary">
              <div className="stat-item">
                <label>{language === 'en' ? "Total Revenue:" : "Tổng doanh thu:"}</label>
                <span>{totalRevenue.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="stat-item">
                <label>{language === 'en' ? "Total Orders:" : "Tổng đơn hàng:"}</label>
                <span>{totalOrders}</span>
              </div>
            </div>
            <div className="time-filter-container">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="time-filter"
              >
                <option value="day">{language === 'en' ? "Today" : "Hôm nay"}</option>
                <option value="week">{language === 'en' ? "This Week" : "Tuần này"}</option>
                <option value="month">{language === 'en' ? "This Month" : "Tháng này"}</option>
              </select>
            </div>
          </div>
          <Line data={revenueData} options={lineChartOptions} />
        </div>

        <div className="card stock-card">
          <h4>{language === 'en' ? "Inventory" : "Hàng tồn kho"}</h4>
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
            <h4>{language === 'en' ? "Best Selling Products" : "Sản phẩm bán chạy"}</h4>
          </div>
          <table>
            <thead>
              <tr>
                <th>{language === 'en' ? "No." : "STT"}</th>
                <th>{language === 'en' ? "Product Name" : "Tên sản phẩm"}</th>
                <th>{language === 'en' ? "Price" : "Giá bán"}</th>
                <th>{language === 'en' ? "Sold" : "Đã bán"}</th>
                <th>{language === 'en' ? "Stock In" : "Nhập vào"}</th>
                <th>{language === 'en' ? "Revenue" : "Doanh thu"}</th>
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
          <strong>{language === 'en' ? `${donutCard.newCustomers} new customers` : `${donutCard.newCustomers} khách hàng mới`}</strong><br />
          <small>{language === 'en' ? "(in the last 30 days)" : "(trong 30 ngày qua)"}</small><br />
          <small>{donutCard.lastMonth}</small>
        </div>
      </div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{language === 'en' ? "Export Data" : "Xuất dữ liệu"}</h3>
            <div className="form-group">
              <label>{language === 'en' ? "Start Date:" : "Ngày bắt đầu:"}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{language === 'en' ? "End Date:" : "Ngày kết thúc:"}</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="popup-actions">
              <button className="cancel-btn" onClick={() => setShowPopup(false)}>{language === 'en' ? "Cancel" : "Huỷ"}</button>
              <button className="confirm-btn" onClick={handleExport}>{language === 'en' ? "Export" : "Xuất"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTemplate;
