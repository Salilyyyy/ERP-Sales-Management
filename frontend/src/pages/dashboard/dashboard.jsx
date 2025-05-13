import React, { useState, useEffect } from "react";
import apiProduct from "../../api/apiProduct";
import apiInvoice from "../../api/apiInvoice";
import apiStockIn from "../../api/apiStockIn";
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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [timeFilter, setTimeFilter] = useState("day");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [
      {
        label: "Doanh thu",
        data: [],
        borderColor: "#6D6DFF",
        tension: 0.4,
      },
      {
        label: "Đơn hàng",
        data: [],
        borderColor: "#E08AFF",
        tension: 0.4,
      },
    ],
  });

  const calculateRevenueData = (invoices, period) => {
    const data = new Map();
    const orderCounts = new Map();
    let totalRev = 0;
    let totalOrd = 0;
    
    invoices.forEach(invoice => {
      if (!invoice.exportTime) return;

      const date = new Date(invoice.exportTime);
      if (isNaN(date.getTime())) return;

      const invoiceTotal = invoice.total || invoice.totalAmount || 0;

      totalRev += invoiceTotal;
      totalOrd += 1;

      let dateKey;
      
      switch(period) {
        case 'day':
          dateKey = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
          break;
        case 'week':
          const firstDayOfWeek = new Date(date);
          firstDayOfWeek.setDate(date.getDate() - date.getDay());
          const weekNum = Math.ceil((date.getDate() - firstDayOfWeek.getDate() + 1) / 7);
          dateKey = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
          break;
        case 'month':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          dateKey = date.getFullYear().toString();
          break;
        default:
          dateKey = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
      }
      
      const roundedTotal = Math.round(invoiceTotal * 100) / 100;
      data.set(dateKey, (data.get(dateKey) || 0) + roundedTotal);
      orderCounts.set(dateKey, (orderCounts.get(dateKey) || 0) + 1);
    });

    setTotalRevenue(totalRev);
    setTotalOrders(totalOrd);

    const sortedDates = Array.from(data.keys()).sort();
    
    return {
      labels: sortedDates.map(date => {
        switch(period) {
          case 'day':
            return new Date(date).toLocaleDateString('vi-VN');
        case 'week':
            const [year, week] = date.split('-W');
            return `Tuần ${week}/${year}`;
          case 'month':
            return `Tháng ${date.split('-')[1]}/${date.split('-')[0]}`;
          default:
            return date;
        }
      }),
      datasets: [
        {
          ...revenueData.datasets[0],
          data: sortedDates.map(date => data.get(date) || 0)
        },
        {
          ...revenueData.datasets[1],
          data: sortedDates.map(date => orderCounts.get(date) || 0)
        }
      ]
    };
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

  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchRevenueData = async () => {
     
        const response = await apiInvoice.getAll();
        const invoices = response?.data || [];
        const chartData = calculateRevenueData(invoices, timeFilter);
        setRevenueData(chartData);
    };
    
    fetchRevenueData();
  }, [timeFilter]);

  useEffect(() => {
    const fetchTopProducts = async () => {
        const [invoiceResponse, stockInResponse] = await Promise.all([
          apiInvoice.getAll(),
          apiStockIn.getAll()
        ]);

        const invoices = invoiceResponse?.data || [];
        const stockIns = stockInResponse?.data || [];
        
        const productData = new Map();
        
        stockIns.forEach(stockIn => {
          if (!stockIn?.DetailStockins) return;
          
          stockIn.DetailStockins.forEach(detail => {
            if (!detail?.Products) return;
            
            const productId = detail.Products.ID;
            const productName = detail.Products.name;
            const quantity = parseInt(detail.quantity || 0, 10);
            const unitPrice = parseFloat(detail.unitPrice || 0);
            
            if (productId && productName) {
              console.log('Processing stock-in:', {
                productId,
                name: productName,
                quantity,
                unitPrice
              });
              
              if (!productData.has(productId)) {
                productData.set(productId, {
                  id: productId,
                  name: productName,
                  stockInQuantity: 0,
                  salesQuantity: 0,
                  price: unitPrice,
                  revenue: 0
                });
              }
              
              const product = productData.get(productId);
              product.stockInQuantity += quantity;
            }
          });
        });
        
        invoices.forEach(invoice => {
          if (!invoice?.InvoiceDetails) return;
          
          invoice.InvoiceDetails.forEach(detail => {
            if (!detail?.Products) return;
            
            const productId = detail.Products.ID;
            const quantity = parseInt(detail.quantity || 0, 10);
            const unitPrice = parseFloat(detail.unitPrice || 0);
            
            if (productId && productData.has(productId)) {
              
              const product = productData.get(productId);
              product.salesQuantity += quantity;
              product.revenue += quantity * unitPrice;
              product.price = unitPrice;
            }
          });
        });
        
        const sortedProducts = Array.from(productData.values())
          .map(product => ({
            ...product,
            salesRate: product.salesQuantity / (product.stockInQuantity || 1) 
          }))
          .sort((a, b) => b.salesRate - a.salesRate)
          .slice(0, 3)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: `${product.price.toLocaleString('vi-VN')}đ`,
            quantity: product.salesQuantity,
            revenue: `${product.revenue.toLocaleString('vi-VN')}đ`,
            stockIn: product.stockInQuantity,
            salesRate: (product.salesRate * 100).toFixed(1) + '%'
          }));
        
        setTopProducts(sortedProducts);
    
    };

    fetchTopProducts();
  }, []);

  const [lowestStock, setLowestStock] = useState([]);
  const [highestStock, setHighestStock] = useState([]);

  useEffect(() => {
    const fetchInventoryData = async () => {
        const response = await apiProduct.getAll();
        const products = response.data;
        
        const sortedProducts = [...products].sort((a, b) => a.quantity - b.quantity);
        
        const lowest = sortedProducts.slice(0, 3);
        const highest = sortedProducts.slice(-3).reverse();

        setLowestStock(lowest.map(product => ({
          label: product.name,
          width: `${(product.quantity / 100) * 100}%`,
          change: `${product.quantity} sản phẩm`,
          icon: downIcon,
          color: "red"
        })));

        setHighestStock(highest.map(product => ({
          label: product.name,
          width: `${(product.quantity / 100) * 100}%`,
          change: `${product.quantity} sản phẩm`,
          icon: upIcon,
          color: "green"
        })));
     
    };

    fetchInventoryData();
  }, []);

  const stockStats = [...lowestStock, ...highestStock];

  const donutCards = ["Khuyến mãi", "Khách hàng mới"];

  const handleExport = () => {
    const filteredData = topProducts;

    if (exportType === "pdf") {
      const doc = new jsPDF();
      doc.text("Bảng sản phẩm bán chạy", 10, 10);

      const tableRows = filteredData.map(p => [p.id, p.name, p.price, p.quantity, p.stockIn, p.salesRate, p.revenue]);

      autoTable(doc, {
        head: [["STT", "Tên sản phẩm", "Giá bán", "Đã bán", "Nhập vào", "Tỷ lệ BH", "Doanh thu"]],
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
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
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
          <h4>Sản phẩm bán chạy</h4>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Đã bán</th>
                <th>Nhập vào</th>
                <th>Tỷ lệ BH</th>
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
                  <td>{product.stockIn}</td>
                  <td>{product.salesRate}</td>
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
