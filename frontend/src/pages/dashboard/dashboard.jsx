import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// 👉 Import jsPDF và autoTable đúng cách
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // <- Cách chính xác
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./dashboard.scss";
import downloadIcon from "../../assets/img/export-icon.svg";
import upIcon from "../../assets/img/up-icon.svg";
import downIcon from "../../assets/img/down-iconn.svg";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Dashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const lineChartData = {
    labels: ["Aug 1", "Aug 2", "Aug 3", "Aug 4", "Aug 5"],
    datasets: [
      {
        label: "Doanh thu",
        data: [60, 80, 45, 65, 96],
        borderColor: "#6D6DFF",
        tension: 0.4,
      },
      {
        label: "Đơn hàng",
        data: [30, 70, 50, 40, 13],
        borderColor: "#E08AFF",
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  const topProducts = [
    { id: 1, name: "Chén sứ", price: "350.000VND", quantity: 250, revenue: "87.500.000 VND" },
    { id: 2, name: "Ly sứ", price: "350.000VND", quantity: 250, revenue: "87.500.000 VND" },
    { id: 3, name: "Tranh điêu khắc", price: "350.000VND", quantity: 250, revenue: "87.500.000 VND" },
  ];

  const stockStats = [
    { label: "Initiated", width: "100%", change: "+42.1%", icon: upIcon, color: "green" },
    { label: "Abandonment rate", width: "70%", change: "-16.6%", icon: downIcon, color: "red" },
    { label: "Bounce rate", width: "85%", change: "+22%", icon: upIcon, color: "green" },
    { label: "Completion rate", width: "95%", change: "+45.32%", icon: upIcon, color: "green" },
  ];

  const donutCards = ["Khuyến mãi", "Khách hàng mới"];

  const handleExport = () => {
    const filteredData = topProducts;

    if (exportType === "pdf") {
      const doc = new jsPDF();
      doc.text("Bảng sản phẩm bán chạy", 10, 10);

      const tableRows = filteredData.map(p => [p.id, p.name, p.price, p.quantity, p.revenue]);

      // 👉 Gọi autoTable từ function đã import
      autoTable(doc, {
        head: [["STT", "Tên sản phẩm", "Giá bán", "Số lượng", "Doanh thu"]],
        body: tableRows,
        startY: 20,
      });

      doc.save("thong-ke.pdf");
    } else if (exportType === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
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
          <h4>Thống kê doanh thu & đơn hàng</h4>
          <Line data={lineChartData} options={lineChartOptions} />
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
          <h4>Sản phẩm bán chạy</h4>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Số lượng</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>{product.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {donutCards.map((title, index) => (
          <div className="card donut-card" key={index}>
            <h4>{title}</h4>
            <div className="donut">
              <div className="circle">50%</div>
              <div className="percent">
                <strong>32.1%</strong><br />Target<br />
                <small>Last month: 28%</small>
              </div>
            </div>
          </div>
        ))}
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

export default Dashboard;
