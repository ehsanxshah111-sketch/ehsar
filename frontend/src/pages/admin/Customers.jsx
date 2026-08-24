import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setCustomers(data))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading customers…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-2">Customers</h1>
      <p className="text-sm text-gray-500 mb-6">
        Everyone registered on the storefront. Passwords aren't shown here - they're stored as one-way
        hashes and can't be reversed, even by us.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {customers.length === 0 ? (
        <p className="text-gray-500">No customers yet.</p>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b border-gray-100">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
