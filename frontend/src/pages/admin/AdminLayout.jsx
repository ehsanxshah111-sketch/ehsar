import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from "../../adminConfig.js";
import api from "../../api/axios.js";

const linkClass = ({ isActive }) =>
  `block px-4 py-3 text-sm tracking-wide rounded-sm ${
    isActive ? "bg-ehsar-black text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const AdminLayout = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  // Fetched once when the admin dashboard loads, so the sidebar can flag a
  // payment that's waiting on review without the admin having to click into
  // Payments first just to find out one exists.
  const [pendingPayments, setPendingPayments] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api
      .get("/orders/summary")
      .then(({ data }) => setPendingPayments(data.pendingPayments))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ADMIN_LOGIN_PATH);
  };

  // Shared between the desktop sidebar and the mobile dropdown so the two
  // never drift out of sync when a section gets added or renamed later.
  const navLinks = (onNavigate) => (
    <>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}`} end className={linkClass} onClick={onNavigate}>
        Overview
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/products`} className={linkClass} onClick={onNavigate}>
        Products
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/orders`} className={linkClass} onClick={onNavigate}>
        Orders
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/payments`} className={linkClass} onClick={onNavigate}>
        <span className="flex items-center justify-between">
          Payments
          {pendingPayments > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px]">
              {pendingPayments}
            </span>
          )}
        </span>
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/customers`} className={linkClass} onClick={onNavigate}>
        Customers
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/banners`} className={linkClass} onClick={onNavigate}>
        Banners
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/category-tiles`} className={linkClass} onClick={onNavigate}>
        Category Tiles
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/payment-settings`} className={linkClass} onClick={onNavigate}>
        Payment Settings
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/activity-log`} className={linkClass} onClick={onNavigate}>
        Activity Log
      </NavLink>
      <NavLink to={`${ADMIN_DASHBOARD_PATH}/settings`} className={linkClass} onClick={onNavigate}>
        Account Settings
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="font-display text-xl tracking-widest2 uppercase">Ehsar</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">{navLinks()}</nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-2">Signed in as <b>{username}</b></p>
          <button onClick={handleLogout} className="text-xs text-red-600 underline">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <span className="font-display tracking-widest2 uppercase">Ehsar Admin</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="text-xl leading-none px-1 relative"
            >
              {mobileMenuOpen ? "✕" : "☰"}
              {!mobileMenuOpen && pendingPayments > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600" />
              )}
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-white border-b border-gray-200 p-4 space-y-1">
            {navLinks(() => setMobileMenuOpen(false))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-sm text-red-600"
            >
              Log out
            </button>
          </nav>
        )}

        <main className="flex-1 p-6 sm:p-10 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
