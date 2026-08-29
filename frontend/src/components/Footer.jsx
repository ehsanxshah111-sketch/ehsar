import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-ehsar-black text-white mt-24">
    <div className="container-ehsar py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
      <div className="col-span-2 md:col-span-1">
        <h3 className="text-2xl font-display tracking-widest2 uppercase mb-4">Ehsar</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Contemporary essentials, tailored for a modern wardrobe.
        </p>
      </div>
      <div>
        <h4 className="text-xs tracking-widest2 uppercase text-gray-400 mb-4">Shop</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop?category=women" className="hover:text-ehsar-gold">Women</Link></li>
          <li><Link to="/shop?category=men" className="hover:text-ehsar-gold">Men</Link></li>
          <li><Link to="/shop?sale=true" className="hover:text-ehsar-gold">Sale</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs tracking-widest2 uppercase text-gray-400 mb-4">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/about" className="hover:text-ehsar-gold">About Ehsar</Link></li>
          <li><Link to="/sustainability" className="hover:text-ehsar-gold">Sustainability</Link></li>
          <li><Link to="/careers" className="hover:text-ehsar-gold">Careers</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-xs tracking-widest2 uppercase text-gray-400 mb-4">Support</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shipping-returns" className="hover:text-ehsar-gold">Shipping & Returns</Link></li>
          <li><Link to="/contact" className="hover:text-ehsar-gold">Contact Us</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
      © {new Date().getFullYear()} Ehsar. All rights reserved.
    </div>
  </footer>
);

export default Footer;
