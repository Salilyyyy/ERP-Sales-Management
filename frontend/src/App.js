import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoadingProvider } from './context/LoadingContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/layout';
import ProtectedRoute from './components/protectedRoute/protectedRoute';
import Dashboard from './pages/dashboard/dashboard';
import LoginPage from './components/login/login';
import ForgotPassword from './components/forgotPassword/forgotPassword';
import ResetPassword from './components/resetPassword/resetPassword';
import Invoices from './pages/invoices/invoices';
import OrderDetails from './pages/detailInvoice/detailInvoice';
import CreateInvoice from './pages/createInvoice/createInvoice';
import Product from './pages/products/product';
import CreateProduct from './pages/createProduct/createProduct';
import DetailProduct from './pages/detailProduct/detailProduct';
import Category from './pages/categories/categories';
import CreateCategory from './pages/createCategory/createCategory';
import DetailCategory from './pages/detailCategory/detailCategory';
import Customer from './pages/customer/customer';
import CreateCustomer from './pages/createCustomer/createCustomer';
import DetailCustomer from './pages/detailCustomer/detailCustomer';
import Supplier from './pages/supplier/supplier';
import CreateSupplier from './pages/createSupplier/createSupplier';
import DetailSupplier from './pages/detailSupplier/detailSupplier';
import StockIn from './pages/stockIn/stockIn';
import CreateStockIn from './pages/createStockIn/createStockIn';
import DetailStockIn from './pages/detailStockIn/detailStockIn';
import PostOffice from './pages/postOffice/postOffice';
import CreatePostOffice from './pages/createPostOffice/createPostOffice';
import DetailPostOffice from './pages/detailPostOffice/detailPostOffice';
import Shipping from './pages/shipping/shipping';
import CreateShipping from './pages/createShipping/createShipping';
import DetailShipping from './pages/detailShipping/detailShipping';
import Promotion from './pages/promotion/promotion';
import CreatePromotion from './pages/createPromotion/createPromotion';
import DetailPromotion from './pages/detailPromotion/detailPromotion';
import Settings from './components/setting/setting';
import Profile from './components/profile/profile';
import Employee from './pages/employee/employee';
import CreateEmployee from './pages/createEmployee/createEmployee';
import DetailEmployee from './pages/detailEmployee/detailEmployee';
import Error404 from './components/error/error-404';
import Error403 from './components/error/error-403';
import Error401 from './components/error/error-401';
import Error500 from './components/error/error-500';

function App() {
    return (
        <div className="App">
            <LoadingProvider>
                <LanguageProvider>
                <BrowserRouter>
                    <ToastContainer />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/error-403" element={<Error403 />} />
                        <Route path="/error-401" element={<Error401 />} />
                        <Route path="/error-500" element={<Error500 />} />
                        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="/invoice/:id" element={<OrderDetails />} />
                            <Route path="/create-invoice" element={<CreateInvoice />} />
                            <Route path="/product" element={<Product />} />
                            <Route path="/create-product" element={<CreateProduct />} />
                            <Route path="/product/:id" element={<DetailProduct />} />
                            <Route path="/categories" element={<Category />} />
                            <Route path="/create-category" element={<CreateCategory />} />
                            <Route path="/category/:id" element={<DetailCategory />} />
                            <Route path="/customer" element={<Customer />} />
                            <Route path="/create-customer" element={<CreateCustomer />} />
                            <Route path="/customer/:id" element={<DetailCustomer />} />
                            <Route path="/supplier-list" element={<Supplier />} />
                            <Route path="/create-supplier" element={<CreateSupplier />} />
                            <Route path="/supplier/:id" element={<DetailSupplier />} />
                            <Route path="/stock-history" element={<StockIn />} />
                            <Route path="/create-stockin" element={<CreateStockIn />} />
                            <Route path="/stockin/:id" element={<DetailStockIn />} />
                            <Route path="/post-office" element={<PostOffice />} />
                            <Route path="/create-postOffice" element={<CreatePostOffice />} />
                            <Route path="/postOffice/:id" element={<DetailPostOffice />} />
                            <Route path="/shipping-list" element={<Shipping />} />
                            <Route path="/create-shipping" element={<CreateShipping />} />
                            <Route path="/shipping/:id" element={<DetailShipping />} />
                            <Route path="/promotion" element={<Promotion />} />
                            <Route path="/create-promotion" element={<CreatePromotion />} />
                            <Route path="/promotion/:id" element={<DetailPromotion />} />
                            <Route path="/setting" element={<Settings />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/employee" element={<Employee />} />
                            <Route path="/create-employee" element={<CreateEmployee />} />
                            <Route path="/employee/:id" element={<DetailEmployee />} />
                        </Route>
                        <Route path="*" element={<Error404 />} />
                    </Routes>
                </BrowserRouter>
                </LanguageProvider>
            </LoadingProvider>
        </div>
    );
}

export default App;
