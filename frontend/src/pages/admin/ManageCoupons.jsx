import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  code: "",
  discountPercent: "",
  isActive: true,
};

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (c) => {
    setForm({
      code: c.code,
      discountPercent: c.discountPercent,
      isActive: c.isActive,
    });
    setEditingId(c._id);
    setShowForm(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.code.trim()) {
      setError("Please enter a coupon code.");
      return;
    }
    const pct = Number(form.discountPercent);
    if (!pct || pct < 1 || pct > 100) {
      setError("Discount must be a number between 1 and 100.");
      return;
    }

    const payload = { code: form.code.trim(), discountPercent: pct, isActive: form.isActive };
    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
      } else {
        await api.post("/coupons", payload);
      }
      setShowForm(false);
      loadCoupons();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon? This can't be undone.")) return;
    try {
      await api.delete(`/coupons/${id}`);
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (c) => {
    try {
      await api.put(`/coupons/${c._id}`, { isActive: !c.isActive });
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display uppercase tracking-wide">Coupon Codes</h1>
        <button onClick={openNewForm} className="btn-primary text-xs py-2 px-5">+ Add Coupon</button>
      </div>

      <p className="text-xs text-gray-400 mb-6 max-w-2xl">
        A coupon gives whoever enters its code a percentage discount off their order's product total at
        checkout. Everyone who doesn't enter a code pays full price as usual. Deactivating a coupon stops it
        from being applied by anyone from that moment on - existing orders that already used it aren't
        changed.
      </p>

      {showForm && (
        <div className="admin-card p-6 mb-10">
          <h2 className="text-lg font-medium mb-4">{editingId ? "Edit Coupon" : "New Coupon"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Coupon Code *</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. EID20"
                className="input-field uppercase"
                maxLength={30}
                required
              />
              <p className="text-xs text-gray-400 mt-1">This is what the customer types at checkout.</p>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Discount (%) *</label>
              <input
                name="discountPercent"
                type="number"
                min="1"
                max="100"
                value={form.discountPercent}
                onChange={handleChange}
                placeholder="e.g. 20"
                className="input-field"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-2 sm:col-span-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
              <label htmlFor="isActive" className="text-sm">Active (customers can use this code)</label>
            </div>

            {error && <p className="text-red-600 text-xs sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {editingId ? "Save Changes" : "Create Coupon"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2 px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-400">No coupons yet.</p>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id} className="border-b border-gray-100">
                  <td className="p-4 font-mono">{c.code}</td>
                  <td className="p-4">{c.discountPercent}% off</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => openEditForm(c)} className="underline">Edit</button>
                      <button onClick={() => toggleActive(c)} className="underline">
                        {c.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-red-600 underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCoupons;
