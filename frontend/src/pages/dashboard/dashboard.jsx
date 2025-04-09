import React from "react";
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
import "./dashboard.scss";

import downloadIcon from "../../assets/img/export-icon.svg";
import upIcon from "../../assets/img/up-icon.svg";
import downIcon from "../../assets/img/down-iconn.svg"; 

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const lineChartData = {
    labels: ["Aug 1", "Aug 2", "Aug 3", "Aug 4", "Aug 5"],
    datasets: [
      {
        label: "Revenue",
        data: [60, 80, 45, 65, 96],
        fill: false,
        borderColor: "#6D6DFF",
        tension: 0.4,
      },
      {
        label: "Order",
        data: [30, 70, 50, 40, 13],
        fill: false,
        borderColor: "#E08AFF",
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        type: "category",
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan</h2>
        <button className="export-btn">
          <img src={downloadIcon} alt="Export" />
          Xuất
        </button>
      </div>

      <div className="grid-container">
        <div className="card chart-card">
          <h4>Tổng tiền</h4>
          <div className="total-values">
            <span className="revenue">● 96.534</span>
            <span className="order">● 13.465</span>
          </div>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        <div className="card stock-card">
          <h4>Hàng tồn kho</h4>
          <div className="stock-row">
            <span>Initiated</span>
            <div className="progress-bar"><div style={{ width: "100%" }} /></div>
            <span className="up"><img src={upIcon} alt="Up" /> 42.1%</span>
          </div>
          <div className="stock-row">
            <span>Abandonment rate</span>
            <div className="progress-bar"><div style={{ width: "70%", backgroundColor: "#FFB6C1" }} /></div>
            <span className="down"><img src={downIcon} alt="Down" /> 16.6%</span>
          </div>
          <div className="stock-row">
            <span>Bounce rate</span>
            <div className="progress-bar"><div style={{ width: "85%" }} /></div>
            <span className="up"><img src={upIcon} alt="Up" /> 22%</span>
          </div>
          <div className="stock-row">
            <span>Completion rate</span>
            <div className="progress-bar"><div style={{ width: "95%" }} /></div>
            <span className="up"><img src={upIcon} alt="Up" /> 45.32%</span>
          </div>
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
              <tr>
                <td>1</td>
                <td>Chén sứ</td>
                <td>350.000VND</td>
                <td>250</td>
                <td>87.500.000 VND</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Ly sứ</td>
                <td>350.000VND</td>
                <td>250</td>
                <td>87.500.000 VND</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Tranh điêu khắc</td>
                <td>350.000VND</td>
                <td>250</td>
                <td>87.500.000 VND</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card donut-card">
          <h4>Khuyến mãi</h4>
          <div className="donut">
            <div className="circle">50%</div>
            <div className="percent">
              <strong>32.1%</strong><br />
              Target<br />
              <small>Last month: 28%</small>
            </div>
          </div>
        </div>

        <div className="card donut-card">
          <h4>Khách hàng mới</h4>
          <div className="donut">
            <div className="circle">50%</div>
            <div className="percent">
              <strong>32.1%</strong><br />
              Target<br />
              <small>Last month: 28%</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
