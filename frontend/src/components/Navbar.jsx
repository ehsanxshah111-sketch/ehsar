import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const Navbar = () => {
  const { count } = useCart();
  const { isAuthenticated, customer, logout } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="container-ehsar flex items-center justify-between py-5">
        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-ehsar-gold flex items-center justify-center font-serif font-semibold text-lg text-[#e9e2cd] bg-[radial-gradient(circle_at_35%_30%,#262624,#0d0d0c_70%)] logo-badge-360">
            E
          </div>
          <span className="text-2xl sm:text-3xl font-display tracking-widest2 uppercase">
            Ehsar
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm tracking-widest2 uppercase">
          <Link to="/shop?category=women" className="hover:text-ehsar-gold transition-colors">Women</Link>
          <Link to="/shop?category=men" className="hover:text-ehsar-gold transition-colors">Men</Link>
          <Link to="/shop?isNew=true" className="hover:text-ehsar-gold transition-colors">New In</Link>
          <Link to="/shop?sale=true" className="hover:text-ehsar-gold transition-colors">Sale</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-orders" className="hover:text-ehsar-gold transition-colors">
                {customer?.name?.split(" ")[0] ? `Hi, ${customer.name.split(" ")[0]}` : "My Orders"}
              </Link>
              <button onClick={handleLogout} className="hover:text-ehsar-gold transition-colors">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-ehsar-gold transition-colors">Login</Link>
          )}
        </nav>

        <div className="flex items-center gap-5">
          <form onSubmit={submitSearch} className="hidden md:flex items-center border-b border-gray-300">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="text-sm py-1 px-1 outline-none w-32"
            />
          </form>
          <Link to="/cart" className="relative" aria-label="Cart">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7h16l-1.5 11a2 2 0 01-2 1.8H7.5a2 2 0 01-2-1.8L4 7z" />
              <path d="M8 7V5a4 4 0 018 0v2" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-ehsar-black text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-gray-200 px-5 py-4 flex flex-col gap-4 text-sm tracking-widest2 uppercase">
          <Link to="/shop?category=women" onClick={() => setMenuOpen(false)}>Women</Link>
          <Link to="/shop?category=men" onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/shop?isNew=true" onClick={() => setMenuOpen(false)}>New In</Link>
          <Link to="/shop?sale=true" onClick={() => setMenuOpen(false)}>Sale</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button
                className="text-left"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
