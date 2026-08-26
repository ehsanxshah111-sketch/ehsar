import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  label: "",
  image: "",
  linkUrl: "/shop",
  isActive: true,
  order: 0,
};

const ManageCategoryTiles = () => {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadTiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/category-tiles/all");
      setTiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTiles();
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (t) => {
    setForm({
      label: t.label,
      image: t.image,
      linkUrl: t.linkUrl || "/shop",
      isActive: t.isActive,
      order: t.order || 0,
    });
    setEditingId(t._id);
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
        await api.put(`/category-tiles/${editingId}`, payload);
      } else {
        await api.post("/category-tiles", payload);
      }
      setShowForm(false);
      loadTiles();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save tile");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tile?")) return;
    try {
      await api.delete(`/category-tiles/${id}`);
      loadTiles();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/category-tiles/${t._id}`, { isActive: !t.isActive });
      loadTiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-display uppercase tracking-wide">Homepage Category Tiles</h1>
        <button onClick={openNewForm} className="btn-primary text-xs py-2 px-5">+ Add Tile</button>
      </div>
      <p className="text-xs text-gray-500 mb-8">
        These are the image tiles on the homepage (Women, Men, Shoes, Watches, etc.) - edit the image,
        label, or where each one links to. Only "Active" tiles show on the live site, in the order set below.
      </p>

      {showForm && (
        <div className="admin-card p-6 mb-10">
          <h2 className="text-lg font-medium mb-4">{editingId ? "Edit Tile" : "New Tile"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Label *</label>
              <input name="label" value={form.label} onChange={handleChange} placeholder="e.g. Women" className="input-field" required />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Links To *</label>
              <input name="linkUrl" value={form.linkUrl} onChange={handleChange} placeholder="/shop?category=women" className="input-field" required />
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
                Paste a link to an image already hosted online. Don't paste raw file data - only a link
                starting with http:// or https://
              </p>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Display Order</label>
              <input name="order" type="number" value={form.order} onChange={handleChange} className="input-field" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="tileActive" />
              <label htmlFor="tileActive" className="text-sm">Active (visible on site)</label>
            </div>

            {error && <p className="text-red-600 text-xs sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {editingId ? "Save Changes" : "Create Tile"}
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
      ) : tiles.length === 0 ? (
        <p className="text-gray-400">No tiles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((t) => (
            <div key={t._id} className="admin-card overflow-hidden">
              <div className="h-32 bg-ehsar-cream">
                <img src={t.image} alt={t.label} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{t.label}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3 truncate">{t.linkUrl}</p>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => openEditForm(t)} className="underline">Edit</button>
                  <button onClick={() => toggleActive(t)} className="underline">
                    {t.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="text-red-600 underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCategoryTiles;
