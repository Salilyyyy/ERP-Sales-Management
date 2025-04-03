import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/layout'; 
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



function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />  
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />  
                    <Route path="/" element={<Layout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="invoices" element={<Invoices />} />
                        <Route path="/invoice/:id" element={<OrderDetails />} />
                        <Route path="/create-invoice" element={<CreateInvoice />} /> 
                        <Route path="/product" element={<Product />} />  
                        <Route path="/create-product" element={<CreateProduct />} /> 
                        <Route path="/product/:id" element={<DetailProduct />} />
                        <Route path="/categories" element={<Category />} />
                        <Route path="/create-category" element={<CreateCategory/>} />
                        <Route path="/category/:id" element={<DetailCategory />} />
                        <Route path="/customer" element={<Customer />} />
                        <Route path="/create-customer" element={<CreateCustomer />} />
                        <Route path="/customer/:id" element={<DetailCustomer />} />
                        <Route path="/supplier-list" element={<Supplier />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;