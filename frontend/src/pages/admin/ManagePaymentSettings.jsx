import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";

const emptyForm = {
  jazzCash: { accountTitle: "", accountNumber: "", instructions: "" },
  easypaisa: { accountTitle: "", accountNumber: "", instructions: "" },
  bankTransfer: { accountTitle: "", accountNumber: "", bankName: "", instructions: "" },
};

const FieldGroup = ({ title, method, form, onChange, showBank }) => (
  <div className="admin-card p-5 space-y-3">
    <h2 className="text-sm font-medium uppercase tracking-wide">{title}</h2>
    <div>
      <label className="text-xs text-gray-500 block mb-1">Account Title / Name</label>
      <input
        className="input-field"
        value={form[method].accountTitle}
        onChange={(e) => onChange(method, "accountTitle", e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 block mb-1">Account Number</label>
      <input
        className="input-field"
        value={form[method].accountNumber}
        onChange={(e) => onChange(method, "accountNumber", e.target.value)}
      />
    </div>
    {showBank && (
      <div>
        <label className="text-xs text-gray-500 block mb-1">Bank Name</label>
        <input
          className="input-field"
          value={form[method].bankName}
          onChange={(e) => onChange(method, "bankName", e.target.value)}
        />
      </div>
    )}
    <div>
      <label className="text-xs text-gray-500 block mb-1">Instructions shown to customer</label>
      <textarea
        className="input-field"
        rows={2}
        value={form[method].instructions}
        onChange={(e) => onChange(method, "instructions", e.target.value)}
      />
    </div>
  </div>
);

const ManagePaymentSettings = () => {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/settings/payment")
      .then(({ data }) =>
        setForm({
          jazzCash: { accountTitle: "", accountNumber: "", instructions: "", ...data.jazzCash },
          easypaisa: { accountTitle: "", accountNumber: "", instructions: "", ...data.easypaisa },
          bankTransfer: { accountTitle: "", accountNumber: "", bankName: "", instructions: "", ...data.bankTransfer },
        })
      )
      .catch((err) => setError(err?.response?.data?.message || "Failed to load payment settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (method, field, value) => {
    setForm((prev) => ({ ...prev, [method]: { ...prev[method], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await api.put("/settings/payment", form);
      setMessage("Payment account details updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save payment settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading payment settings…</p>;

  return (
    <div>
      <h1 className="text-2xl font-display uppercase tracking-widest2 mb-2">Payment Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        These are the account numbers customers see at checkout for JazzCash, Easypaisa and Bank Transfer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <FieldGroup title="JazzCash" method="jazzCash" form={form} onChange={handleChange} />
        <FieldGroup title="Easypaisa" method="easypaisa" form={form} onChange={handleChange} />
        <FieldGroup title="Bank Transfer" method="bankTransfer" form={form} onChange={handleChange} showBank />

        {message && <p className="text-green-700 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ManagePaymentSettings;
