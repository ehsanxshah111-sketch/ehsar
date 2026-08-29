import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import AboutEhsar from "./pages/info/AboutEhsar.jsx";
import Sustainability from "./pages/info/Sustainability.jsx";
import Careers from "./pages/info/Careers.jsx";
import ShippingReturns from "./pages/info/ShippingReturns.jsx";
import ContactUs from "./pages/info/ContactUs.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import ManageProducts from "./pages/admin/ManageProducts.jsx";
import ManageOrders from "./pages/admin/ManageOrders.jsx";
import Payments from "./pages/admin/Payments.jsx";
import ManageBanners from "./pages/admin/ManageBanners.jsx";
import ManageCategoryTiles from "./pages/admin/ManageCategoryTiles.jsx";
import ManagePaymentSettings from "./pages/admin/ManagePaymentSettings.jsx";
import ManageCoupons from "./pages/admin/ManageCoupons.jsx";
import ActivityLog from "./pages/admin/ActivityLog.jsx";
import Customers from "./pages/admin/Customers.jsx";
import ChangePassword from "./pages/admin/ChangePassword.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ADMIN_LOGIN_PATH, ADMIN_DASHBOARD_PATH } from "./adminConfig.js";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-[60vh]">{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/shop" element={<PublicLayout><Shop /></PublicLayout>} />
      <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
      <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutEhsar /></PublicLayout>} />
      <Route path="/sustainability" element={<PublicLayout><Sustainability /></PublicLayout>} />
      <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
      <Route path="/shipping-returns" element={<PublicLayout><ShippingReturns /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactUs /></PublicLayout>} />
      <Route
        path="/my-orders"
        element={
          <PublicLayout>
            <CustomerProtectedRoute>
              <MyOrders />
            </CustomerProtectedRoute>
          </PublicLayout>
        }
      />

      {/* Hidden admin login — not linked anywhere in the public site */}
      <Route path={ADMIN_LOGIN_PATH} element={<AdminLogin />} />

      {/* Protected admin dashboard */}
      <Route
        path={ADMIN_DASHBOARD_PATH}
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="banners" element={<ManageBanners />} />
        <Route path="category-tiles" element={<ManageCategoryTiles />} />
        <Route path="coupons" element={<ManageCoupons />} />
        <Route path="payment-settings" element={<ManagePaymentSettings />} />
        <Route path="activity-log" element={<ActivityLog />} />
        <Route path="customers" element={<Customers />} />
        <Route path="settings" element={<ChangePassword />} />
      </Route>

      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="container-ehsar py-32 text-center">
              <h1 className="text-3xl font-display uppercase mb-4">404</h1>
              <p className="text-gray-500">Page not found.</p>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

export default App;
