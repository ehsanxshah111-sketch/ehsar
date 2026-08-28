import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const ALL_TYPE = { label: "All", type: "" };
const SHOES_TYPE = { label: "Shoes", type: "shoes" };
const WATCHES_TYPE = { label: "Watches", type: "watches" };

// Women and Men each get their own dropdown contents now, instead of one
// shared list - Women shows Jewelry in place of Clothing.
const WOMEN_TYPES = [ALL_TYPE, { label: "Jewelry", type: "jewelry" }, SHOES_TYPE, WATCHES_TYPE];
const MEN_TYPES = [ALL_TYPE, { label: "Clothing", type: "clothing" }, SHOES_TYPE, WATCHES_TYPE];

// Desktop dropdown for Women/Men - hover reveals that category's own set of
// sub-links so the new lines don't get buried in with the existing catalog.
const CategoryDropdown = ({ label, category, types }) => (
  <div className="relative group">
    <Link to={`/shop?category=${category}`} className="hover:text-ehsar-gold transition-colors">
      {label}
    </Link>
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50">
      <div className="bg-white border border-gray-200 shadow-lg py-2 min-w-[160px] normal-case tracking-normal text-left">
        {types.map((t) => (
          <Link
            key={t.label}
            to={`/shop?category=${category}${t.type ? `&type=${t.type}` : ""}`}
            className="block px-4 py-2 text-xs uppercase tracking-wide hover:bg-ehsar-cream hover:text-ehsar-gold"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { isAuthenticated, customer, logout } = useCustomerAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null); // "women" | "men" | null
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

  const closeMobile = () => {
    setMenuOpen(false);
    setMobileExpanded(null);
  };

  return (
    <header className="border-b border-gray-200 sticky top-0 bg-white z-40">
      <div className="container-ehsar flex items-center justify-between py-5">
        <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Ehsar - Style from head to toe" className="h-14 sm:h-16 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm tracking-widest2 uppercase">
          <CategoryDropdown label="Women" category="women" types={WOMEN_TYPES} />
          <CategoryDropdown label="Men" category="men" types={MEN_TYPES} />
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
          <Link to="/wishlist" className="relative hidden sm:block" aria-label="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7.5-4.6-10.2-9.1C.2 8.9 1.4 5 5 4.2c2.1-.5 4 .5 5 2.3.9-1.8 2.9-2.8 5-2.3 3.6.8 4.8 4.7 3.2 7.7C19.5 16.4 12 21 12 21z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-ehsar-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
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
        <nav className="lg:hidden border-t border-gray-200 px-5 py-4 flex flex-col gap-1 text-sm tracking-widest2 uppercase">
          {["women", "men"].map((cat) => (
            <div key={cat}>
              <div className="flex items-center justify-between py-2">
                <Link to={`/shop?category=${cat}`} onClick={closeMobile}>
                  {cat === "women" ? "Women" : "Men"}
                </Link>
                <button
                  aria-label={`Toggle ${cat} types`}
                  onClick={() => setMobileExpanded(mobileExpanded === cat ? null : cat)}
                  className="text-xs px-2"
                >
                  {mobileExpanded === cat ? "−" : "+"}
                </button>
              </div>
              {mobileExpanded === cat && (
                <div className="pl-4 pb-2 flex flex-col gap-2 normal-case text-xs text-gray-500">
                  {(cat === "women" ? WOMEN_TYPES : MEN_TYPES).filter((t) => t.type).map((t) => (
                    <Link key={t.type} to={`/shop?category=${cat}&type=${t.type}`} onClick={closeMobile}>
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link to="/shop?isNew=true" onClick={closeMobile} className="py-2">New In</Link>
          <Link to="/shop?sale=true" onClick={closeMobile} className="py-2">Sale</Link>
          <Link to="/wishlist" onClick={closeMobile} className="py-2">
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-orders" onClick={closeMobile} className="py-2">My Orders</Link>
              <button
                className="text-left py-2"
                onClick={() => {
                  closeMobile();
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={closeMobile} className="py-2">Login</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
