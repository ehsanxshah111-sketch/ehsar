import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  title: "",
  subtitle: "",
  promotionText: "",
  image: "",
  linkUrl: "/shop",
  buttonText: "Shop Now",
  isActive: true,
  order: 0,
};

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/banners/all");
      setBanners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (b) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      promotionText: b.promotionText || "",
      image: b.image,
      linkUrl: b.linkUrl || "/shop",
      buttonText: b.buttonText || "Shop Now",
      isActive: b.isActive,
      order: b.order || 0,
    });
    setEditingId(b._id);
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

    if (!/^https?:\/\//i.test(form.image.trim())) {
      setError("Image must be a link starting with http:// or https:// - not raw file data.");
      return;
    }

    const payload = { ...form, order: Number(form.order) || 0 };
    try {
      if (editingId) {
        await api.put(`/banners/${editingId}`, payload);
      } else {
        await api.post("/banners", payload);
      }
      setShowForm(false);
      loadBanners();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save banner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await api.delete(`/banners/${id}`);
      loadBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (b) => {
    try {
      await api.put(`/banners/${b._id}`, { isActive: !b.isActive });
      loadBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display uppercase tracking-wide">Banners & Promotions</h1>
        <button onClick={openNewForm} className="btn-primary text-xs py-2 px-5">+ Add Banner</button>
      </div>

      {showForm && (
        <div className="admin-card p-6 mb-10">
          <h2 className="text-lg font-medium mb-4">{editingId ? "Edit Banner" : "New Banner"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Promotion Text</label>
              <input name="promotionText" value={form.promotionText} onChange={handleChange} placeholder="e.g. UP TO 50% OFF" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase text-gray-500 mb-1 block">Subtitle</label>
              <input name="subtitle" value={form.subtitle} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase text-gray-500 mb-1 block">Image URL *</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://i.imgur.com/example.jpg"
                className="input-field"
                maxLength={2000}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Paste a link to an image already hosted online (e.g. upload it to imgur.com first and copy
                its image address). Don't paste raw file data - only a link starting with http:// or https://
              </p>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Button Link</label>
              <input name="linkUrl" value={form.linkUrl} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Button Text</label>
              <input name="buttonText" value={form.buttonText} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Display Order</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} className="input-field" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
              <label htmlFor="isActive" className="text-sm">Active (visible on site)</label>
            </div>

            {error && <p className="text-red-600 text-xs sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {editingId ? "Save Changes" : "Create Banner"}
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
      ) : banners.length === 0 ? (
        <p className="text-gray-400">No banners yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {banners.map((b) => (
            <div key={b._id} className="admin-card overflow-hidden">
              <div className="h-40 bg-ehsar-cream">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{b.title}</h3>
                    {b.promotionText && (
                      <span className="text-xs text-ehsar-gold uppercase">{b.promotionText}</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${b.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {b.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex gap-3 text-xs mt-3">
                  <button onClick={() => openEditForm(b)} className="underline">Edit</button>
                  <button onClick={() => toggleActive(b)} className="underline">
                    {b.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="text-red-600 underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBanners;
