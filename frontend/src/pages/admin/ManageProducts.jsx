import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { formatPKR } from "../../utils/currency.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "women",
  type: "clothing",
  subCategory: "",
  sizes: "S, M, L, XL",
  colors: "",
  images: "",
  stock: 50,
  isFeatured: false,
  isNew: true,
  isOnSale: false,
};

// Default size suggestions per product type - purely a helper hint for the
// admin filling the form, not a validation rule (the sizes field stays free
// text either way, since shoe sizing varies by brand/region).
const SIZE_HINTS = {
  clothing: "S, M, L, XL",
  shoes: "38, 39, 40, 41, 42",
  watches: "",
  jewelry: "",
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
    setUploadError("");
  };

  const openEditForm = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      discountPrice: p.discountPrice || "",
      category: p.category,
      type: p.type || "clothing",
      subCategory: p.subCategory || "",
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      images: (p.images || []).join("\n"),
      stock: p.stock,
      isFeatured: p.isFeatured,
      isNew: p.isNew,
      isOnSale: p.isOnSale,
    });
    setEditingId(p._id);
    setShowForm(true);
    setError("");
    setUploadError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    setForm((prev) => ({
      ...prev,
      type: nextType,
      // Only auto-fill the size hint if the sizes field still holds another
      // type's default - never clobber sizes the admin already typed in.
      sizes: Object.values(SIZE_HINTS).includes(prev.sizes.trim())
        ? SIZE_HINTS[nextType]
        : prev.sizes,
    }));
  };

  const MAX_IMAGES = 4;

  // Split by newline, not comma - a huge number of real image URLs (every
  // Cloudinary transformation URL, many other CDNs) legitimately contain
  // commas as part of the URL itself, e.g. ".../w_800,h_800,c_fill/photo.jpg".
  // Splitting on commas was silently shredding those into broken fragments,
  // which is exactly why a pasted URL with that kind of text in it failed
  // to load - it was never one URL by the time it got saved.
  const currentImageList = (imagesStr) => imagesStr.split("\n").map((s) => s.trim()).filter(Boolean);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadError("");

    const existing = currentImageList(form.images);
    const remaining = MAX_IMAGES - existing.length;
    if (remaining <= 0) {
      setUploadError(`You can only have up to ${MAX_IMAGES} images per product. Remove one first.`);
      e.target.value = "";
      return;
    }
    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setUploadError(`Only ${remaining} more image(s) allowed (max ${MAX_IMAGES} total) — the rest were skipped.`);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      filesToUpload.forEach((f) => formData.append("images", f));
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({
        ...prev,
        images: [...existing, ...data.urls].filter(Boolean).join("\n"),
      }));
    } catch (err) {
      setUploadError(err?.response?.data?.message || "Upload failed. You can paste image URLs instead.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const remainingImages = currentImageList(form.images).filter((_, i) => i !== indexToRemove);
    setForm((prev) => ({ ...prev, images: remainingImages.join("\n") }));
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
      type: form.type,
      subCategory: form.subCategory || "General",
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      images: form.images.split("\n").map((i) => i.trim()).filter(Boolean).slice(0, MAX_IMAGES),
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

  const visibleProducts = products.filter((p) => {
    const matchesType = typeFilter ? (p.type || "clothing") === typeFilter : true;
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesType && matchesCategory;
  });

  // "Select all" only ever selects the currently filtered/visible rows -
  // not every product in the store - so it does what it looks like it does
  // even while a category/type filter is active.
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((p) => selectedIds.has(p._id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) return new Set();
      return new Set(visibleProducts.map((p) => p._id));
    });
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      await api.put("/products/bulk-update", { ids: Array.from(selectedIds), action });
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
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
              <label className="text-xs uppercase text-gray-500 mb-1 block">Product Type *</label>
              <select name="type" value={form.type} onChange={handleTypeChange} className="input-field">
                <option value="clothing">Clothing</option>
                <option value="shoes">Shoes</option>
                <option value="watches">Watches</option>
                <option value="jewelry">Jewelry</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Sub-category</label>
              <input name="subCategory" value={form.subCategory} onChange={handleChange} placeholder="e.g. Shirts, Sneakers, Chronograph" className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Price (PKR) *</label>
              <input name="price" type="number" step="1" value={form.price} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Discount Price (PKR)</label>
              <input name="discountPrice" type="number" step="1" value={form.discountPrice} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Stock</label>
              <input name="stock" type="number" value={form.stock} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">
                Sizes (comma separated){form.type === "shoes" && " — use numeric EU/UK sizes"}
                {(form.type === "watches" || form.type === "jewelry") && " — usually leave blank"}
              </label>
              <input name="sizes" value={form.sizes} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 mb-1 block">Colors (comma separated)</label>
              <input name="colors" value={form.colors} onChange={handleChange} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs uppercase text-gray-500 mb-1 block">
                Product Images ({currentImageList(form.images).length}/{MAX_IMAGES})
              </label>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <label className={`btn-outline text-xs py-2 px-4 cursor-pointer ${(uploading || currentImageList(form.images).length >= MAX_IMAGES) ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploading ? "Uploading..." : "Upload Images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || currentImageList(form.images).length >= MAX_IMAGES}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-gray-400">or paste URLs below, one per line · max {MAX_IMAGES} photos, first one is the cover image</span>
              </div>
              {uploadError && <p className="text-red-600 text-xs mb-2">{uploadError}</p>}
              <textarea
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                rows={3}
                className="input-field"
              />
              {form.images && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentImageList(form.images).map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-14 h-18 object-cover bg-ehsar-cream border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        aria-label="Remove image"
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-ehsar-black text-white text-xs leading-none flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label className="text-xs uppercase text-gray-500">Filter by category:</label>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-32 py-1.5">
          <option value="">All</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
        </select>
        <label className="text-xs uppercase text-gray-500">Filter by type:</label>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-40 py-1.5">
          <option value="">All</option>
          <option value="clothing">Clothing</option>
          <option value="shoes">Shoes</option>
          <option value="watches">Watches</option>
          <option value="jewelry">Jewelry</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-ehsar-cream px-4 py-3 mb-4 text-xs">
          <span className="font-medium">{selectedIds.size} selected</span>
          <button
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("feature")}
            className="btn-outline py-1.5 px-3 disabled:opacity-50"
          >
            Mark as Featured
          </button>
          <button
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("sale")}
            className="btn-outline py-1.5 px-3 disabled:opacity-50"
          >
            Mark as On Sale
          </button>
          <button
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("none")}
            className="btn-outline py-1.5 px-3 disabled:opacity-50"
          >
            Clear (Nothing)
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="underline text-gray-500 ml-auto">
            Clear selection
          </button>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <th className="p-4 w-10">
                <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} aria-label="Select all products" />
              </th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Type</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Flags</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : visibleProducts.length === 0 ? (
              <tr><td colSpan="8" className="p-6 text-center text-gray-400">No products yet.</td></tr>
            ) : (
              visibleProducts.map((p) => (
                <tr key={p._id} className="border-b border-gray-100">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p._id)}
                      onChange={() => toggleSelectOne(p._id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/60x80?text=Ehsar"}
                      alt=""
                      className="w-10 h-14 object-cover bg-ehsar-cream"
                    />
                    <span>{p.name}</span>
                  </td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4 capitalize">{p.type || "clothing"}</td>
                  <td className="p-4">
                    {p.isOnSale && p.discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-1">{formatPKR(p.price)}</span>
                        <span>{formatPKR(p.discountPrice)}</span>
                      </>
                    ) : (
                      formatPKR(p.price)
                    )}
                  </td>
                  <td className="p-4">
                    {p.stock <= 0 ? <span className="text-red-600">Out of stock</span> : p.stock}
                  </td>
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
