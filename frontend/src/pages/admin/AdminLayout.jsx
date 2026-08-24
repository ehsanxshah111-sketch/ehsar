import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from "../../adminConfig.js";

const linkClass = ({ isActive }) =>
  `block px-4 py-3 text-sm tracking-wide rounded-sm ${
    isActive ? "bg-ehsar-black text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

const AdminLayout = () => {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ADMIN_LOGIN_PATH);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="font-display text-xl tracking-widest2 uppercase">Ehsar</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to={`${ADMIN_DASHBOARD_PATH}`} end className={linkClass}>Overview</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/products`} className={linkClass}>Products</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/orders`} className={linkClass}>Orders</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/customers`} className={linkClass}>Customers</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/banners`} className={linkClass}>Banners</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/payment-settings`} className={linkClass}>Payment Settings</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/activity-log`} className={linkClass}>Activity Log</NavLink>
          <NavLink to={`${ADMIN_DASHBOARD_PATH}/settings`} className={linkClass}>Account Settings</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-2">Signed in as <b>{username}</b></p>
          <button onClick={handleLogout} className="text-xs text-red-600 underline">
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <span className="font-display tracking-widest2 uppercase">Ehsar Admin</span>
          <button onClick={handleLogout} className="text-xs text-red-600 underline">Log out</button>
        </header>
        <main className="flex-1 p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
