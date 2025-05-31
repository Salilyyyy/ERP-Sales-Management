import React, { useState, useEffect } from "react";
import apiProduct from "../../api/apiProduct";
import apiInvoice from "../../api/apiInvoice";
import apiStockIn from "../../api/apiStockIn";
import apiCustomer from "../../api/apiCustomer";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import DashboardTemplate from "../../components/dashboardTemplate/dashboardTemplate";
import upIcon from "../../assets/img/up-icon.svg";
import downIcon from "../../assets/img/down-iconn.svg";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Dashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filteredInvoices = invoices.filter(invoice => {
      if (!invoice.exportTime) return false;
      const date = new Date(invoice.exportTime);
      if (isNaN(date.getTime())) return false;

      if (period === 'week') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return date >= sevenDaysAgo;
      } else if (period === 'month') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return date >= thirtyDaysAgo;
      }
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    });

    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.exportTime);
      const invoiceTotal = invoice.total || invoice.totalAmount || 0;

      totalRev += invoiceTotal;
      totalOrd += 1;

      let dateKey;

      switch (period) {
        case 'day':
          dateKey = date.getHours().toString().padStart(2, '0') + ':00';
          break;
        case 'week':
        case 'month':
          dateKey = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
          break;
        default:
          dateKey = date.getHours().toString().padStart(2, '0') + ':00';
      }

      const roundedTotal = Math.round(invoiceTotal * 100) / 100;
      data.set(dateKey, (data.get(dateKey) || 0) + roundedTotal);
      orderCounts.set(dateKey, (orderCounts.get(dateKey) || 0) + 1);
    });

    setTotalRevenue(totalRev);
    setTotalOrders(totalOrd);

    const sortedDates = Array.from(data.keys()).sort();

    let labels = [];
    let completeData = new Map(data);
    let completeOrders = new Map(orderCounts);

    if (period === 'day') {
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        if (!completeData.has(hour)) {
          completeData.set(hour, 0);
          completeOrders.set(hour, 0);
        }
      }
      labels = Array.from(completeData.keys()).sort();
    } else if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0');
        if (!completeData.has(dateKey)) {
          completeData.set(dateKey, 0);
          completeOrders.set(dateKey, 0);
        }
      }
      labels = Array.from(completeData.keys()).sort();
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0');
        if (!completeData.has(dateKey)) {
          completeData.set(dateKey, 0);
          completeOrders.set(dateKey, 0);
        }
      }
      labels = Array.from(completeData.keys()).sort();
    }

    return {
      labels: labels.map(date => {
        if (period === 'day') {
          return date;
        }
        return new Date(date).toLocaleDateString('vi-VN');
      }),
      datasets: [
        {
          ...revenueData.datasets[0],
          data: labels.map(date => completeData.get(date) || 0)
        },
        {
          ...revenueData.datasets[1],
          data: labels.map(date => completeOrders.get(date) || 0)
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
  const [newCustomersCount, setNewCustomersCount] = useState(0);
  const [newCustomers, setNewCustomers] = useState([]);
  const [lowestStock, setLowestStock] = useState([]);
  const [highestStock, setHighestStock] = useState([]);
  const TARGET_CUSTOMERS = 500;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check if authenticated, if not the ProtectedRoute will handle redirect
        if (!apiCustomer.isAuthenticated()) {
          return;
        }

        // Fetch all data in parallel
        const [
          newCustomers,
          invoicesResponse,
          stockInsResponse,
          productsResponse,
          newCustomersCount
        ] = await Promise.all([
          apiCustomer.getNewCustomers(),
          apiInvoice.getAll(),
          apiStockIn.getAll(),
          apiProduct.getAll(),
          apiCustomer.getNewCustomersCount()
        ]);

        // Set new customers data
        setNewCustomers(newCustomers);
        setNewCustomersCount(newCustomersCount?.count || 0);

        // Process invoices data
        const invoices = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse?.data || [];
        const chartData = calculateRevenueData(invoices, timeFilter);
        setRevenueData(chartData);

        // Process stock data
        const stockIns = Array.isArray(stockInsResponse) ? stockInsResponse : stockInsResponse?.data || [];
        const productData = new Map();

        // Process products and sales data
        const processProductData = () => {
          invoices.forEach((invoice) => {
            if (!invoice?.InvoiceDetails) return;

            invoice.InvoiceDetails.forEach(detail => {
              if (!detail?.Products) return;

              const productId = detail.Products.ID;
              const productName = detail.Products.name;
              
              if (productId && productName && !productData.has(productId)) {
                productData.set(productId, {
                  id: detail.Products.ID,
                  name: productName,
                  stockInQuantity: 0,
                  salesQuantity: 0,
                  price: detail.unitPrice || 0,
                  revenue: 0
                });
              }
            });
          });

          stockIns.forEach((stockIn) => {
            if (!stockIn?.DetailStockins) return;

            stockIn.DetailStockins.forEach(detail => {
              if (!detail?.Products) return;

              const productId = detail.Products.ID;
              const productName = detail.Products.name;
              const quantity = parseInt(detail.quantity || 0, 10);
              const unitPrice = parseFloat(detail.unitPrice || 0);

              if (productId && productName) {
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

          invoices.forEach((invoice) => {
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

          return Array.from(productData.values())
            .map(product => ({
              ...product,
              remainingStock: product.stockInQuantity - product.salesQuantity
            }))
            .sort((a, b) => b.salesQuantity - a.salesQuantity)
            .slice(0, 3)
            .map(product => ({
              id: product.id,
              name: product.name,
              price: `${product.price.toLocaleString('vi-VN')}đ`,
              quantity: product.salesQuantity,
              revenue: `${product.revenue.toLocaleString('vi-VN')}đ`,
              stockIn: product.stockInQuantity,
              remainingStock: product.remainingStock
            }));
        };

        const sortedProducts = processProductData();
        setTopProducts(sortedProducts);

        // Process inventory data
        const products = Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || [];
        const sortedInventory = [...products].sort((a, b) => a.quantity - b.quantity);

        const lowest = sortedInventory.slice(0, 3);
        const highest = sortedInventory.slice(-3).reverse();

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

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If auth error occurs, ProtectedRoute will handle redirect
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  const stockStats = [...lowestStock, ...highestStock];

  const donutCard = {
    title: "Khách hàng mới",
    percent: (newCustomersCount / TARGET_CUSTOMERS) * 100,
    target: `${newCustomersCount}/${TARGET_CUSTOMERS}`,
    lastMonth: `Mục tiêu tháng: ${TARGET_CUSTOMERS} khách hàng`
  };


  return (
    <DashboardTemplate
      showPopup={showPopup}
      setShowPopup={setShowPopup}
      timeFilter={timeFilter}
      setTimeFilter={setTimeFilter}
      totalRevenue={totalRevenue}
      totalOrders={totalOrders}
      revenueData={revenueData}
      lineChartOptions={lineChartOptions}
      topProducts={topProducts}
      stockStats={stockStats}
      donutCard={donutCard}
    />
  );
};

export default Dashboard;
