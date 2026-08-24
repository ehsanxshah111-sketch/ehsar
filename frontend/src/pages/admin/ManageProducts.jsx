import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "women",
  subCategory: "",
  sizes: "S, M, L, XL",
  colors: "",
  images: "",
  stock: 50,
  isFeatured: false,
  isNew: true,
  isOnSale: false,
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || "",
      category: p.category,
      subCategory: p.subCategory || "",
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      images: (p.images || []).join(", "),
      stock: p.stock,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isOnSale: p.isOnSale,
    });
    setEditingId(p._id);
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
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      category: form.category,
      subCategory: form.subCategory || "General",
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      images: form.images.split(",").map((i) => i.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      isOnSale: form.isOnSale,
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-display uppercase tracking-wide">Products</h1>
        <button onClick={openNewForm} className="btn-primary text-xs py-2 px-5">+ Add Product</button>
      </div>

      {showForm && (
        <div className="admin-card p-6 mb-10">
          <h2 className="text-lg font-medium mb-4">{editingId ? "Edit Product" : "New Product"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Price ($) *</label>
              <input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Discount Price ($)</label>
              <input name="discountPrice" type="number" step="0.01" value={form.discountPrice} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Sub-category</label>
              <input name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. Shirts, Dresses" className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Sizes (comma separated)</label>
              <input name="sizes" value={form.sizes} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Colors (comma separated)</label>
              <input name="colors" value={form.colors} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase text-gray-500 mb-1 block">Image URLs (comma separated)</label>
              <input name="images" value={form.images} onChange={handleChange} placeholder="https://..., https://..." className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase text-gray-500 mb-1 block">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field" />
            </div>

            <div className="sm:col-span-2 flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} />
                New
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isOnSale" checked={form.isOnSale} onChange={handleChange} />
                On Sale
              </label>
            </div>

            {error && <p className="text-red-600 text-xs sm:col-span-2">{error}</p>}

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-xs py-2 px-6">
                {editingId ? "Save Changes" : "Create Product"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2 px-6">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Flags</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-400">No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-b border-gray-100">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/60x80?text=Ehsar"}
                      alt=""
                      className="w-10 h-14 object-cover bg-ehsar-cream"
                    />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4">
                    {p.isOnSale && p.discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">${p.price}</span>
                        <span>${p.discountPrice}</span>
                      </>
                    ) : (
                      `$${p.price}`
                    )}
                  </td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4 text-xs text-gray-500 space-x-1">
                    {p.isFeatured && <span className="bg-gray-100 px-2 py-0.5 rounded">Featured</span>}
                    {p.isNew && <span className="bg-gray-100 px-2 py-0.5 rounded">New</span>}
                    {p.isOnSale && <span className="bg-gray-100 px-2 py-0.5 rounded">Sale</span>}
                  </td>
                  <td className="p-4 space-x-3">
                    <button onClick={() => openEditForm(p)} className="text-xs underline">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-xs text-red-600 underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageProducts;
