import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

const Register = () => {
  const { register } = useCustomerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/my-orders");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-ehsar py-20 flex justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-display uppercase tracking-widest2 mb-1">Create Account</h1>
        <p className="text-center text-xs text-gray-500 mb-8">Track your orders and check out faster</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs tracking-widest2 uppercase text-gray-500 mb-1 block">Full Name</label>
            <input name="name" className="input-field" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs tracking-widest2 uppercase text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              className="input-field"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="text-xs tracking-widest2 uppercase text-gray-500 mb-1 block">Phone</label>
            <input name="phone" className="input-field" value={form.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="text-xs tracking-widest2 uppercase text-gray-500 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
