// src/pages/Customers.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Customers = () => {
  const { user } = useAuth();

  const role = user?.role || "Operator";
  const canCreate = ["Admin", "Manager", "Operator"].includes(role);
  const canUpdateDelete = ["Admin", "Manager"].includes(role);

  // ✅ branch id should update when header changes
  const [currentBranchId, setCurrentBranchId] = useState(() => {
    const v = localStorage.getItem("current_branch_id");
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  const [currentBranchName, setCurrentBranchName] = useState("");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingPk, setEditingPk] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const initialFormState = useMemo(
    () => ({
      name: "",
      contact: "",
      phone: "",
      email: "",
      address: "",
      type: "Commercial",
      status: "Active",
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormState);

  const formatPKR = (val) => {
    const n = Number(val);
    if (!Number.isFinite(n)) return "PKR 0";
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(n);
    return `PKR ${sign}${abs.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
  };

  const fromApi = (c) => ({
    pk: c.pk ?? null,
    id: c.id || "",
    name: c.name || "",
    contact: c.contact || "",
    phone: c.phone || "",
    email: c.email || "",
    address: c.address || "",
    type: c.type || "Commercial",
    status: c.status || "Active",
    balanceRaw: c.balance ?? 0,
    balance: formatPKR(c.balance ?? 0),
  });

  const toApi = (ui) => ({
    name: (ui.name || "").trim(),
    contact: (ui.contact || "").trim(),
    phone: (ui.phone || "").trim(),
    email: (ui.email || "").trim(),
    address: (ui.address || "").trim(),
    type: ui.type || "Commercial",
    status: ui.status || "Active",
  });

  const loadBranchName = async (bid) => {
    if (!bid) {
      setCurrentBranchName("");
      return;
    }
    try {
      const res = await api.get(`/branches/${bid}/`);
      setCurrentBranchName(res?.data?.name || "");
    } catch {
      setCurrentBranchName("");
    }
  };

  const loadCustomers = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/customers/");
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setCustomers(list.map(fromApi));
    } catch (e) {
      setErr(extractErr(e));
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ initial load
  useEffect(() => {
    loadBranchName(currentBranchId);
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ listen to header branch change event
  useEffect(() => {
    const onBranchChanged = async () => {
      const v = localStorage.getItem("current_branch_id");
      const n = Number(v);
      const bid = Number.isFinite(n) && n > 0 ? n : null;

      setCurrentBranchId(bid);
      await loadBranchName(bid);
      await loadCustomers();
    };

    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const s = searchTerm.toLowerCase().trim();
    const okSearch =
      !s ||
      c.name.toLowerCase().includes(s) ||
      c.contact.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s);

    const okType = typeFilter === "All Types" ? true : c.type === typeFilter;
    const okStatus = statusFilter === "All Status" ? true : c.status === statusFilter;

    return okSearch && okType && okStatus;
  });

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      alert("Customer Name and Phone are required!");
      return;
    }

    // ✅ branch must be selected (because backend now requires branch always)
    if (!currentBranchId) {
      alert("Please select branch from header first.");
      return;
    }

    setSaving(true);
    setErr("");
    try {
      const payload = toApi(formData);

      if (editingPk) {
        if (!canUpdateDelete) {
          alert("You do not have permission to update.");
          return;
        }
        const res = await api.patch(`/customers/${editingPk}/`, payload);
        const updated = fromApi(res.data);
        setCustomers((prev) => prev.map((x) => (x.pk === editingPk ? updated : x)));
      } else {
        const res = await api.post("/customers/", payload);
        const created = fromApi(res.data);
        setCustomers((prev) => [created, ...prev]);
      }

      setIsAdding(false);
      setEditingPk(null);
      setFormData(initialFormState);
    } catch (e) {
      const msg = extractErr(e);
      setErr(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cust) => {
    if (!canUpdateDelete) return;
    if (!cust.pk) {
      alert("Customer pk missing. Add `pk` in serializer.");
      return;
    }
    setFormData({
      name: cust.name,
      contact: cust.contact,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      type: cust.type,
      status: cust.status,
    });
    setEditingPk(cust.pk);
    setIsAdding(true);
  };

  const handleDelete = async (cust) => {
    if (!canUpdateDelete) return;
    if (!cust.pk) {
      alert("Customer pk missing. Add `pk` in serializer.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this customer?")) return;

    setSaving(true);
    setErr("");
    try {
      await api.delete(`/customers/${cust.pk}/`);
      setCustomers((prev) => prev.filter((x) => x.pk !== cust.pk));
    } catch (e) {
      const msg = extractErr(e);
      setErr(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingPk(null);
    setFormData(initialFormState);
  };

  const branchLabel =
    currentBranchName || (currentBranchId ? `Branch #${currentBranchId}` : "Not Selected");

  const formBlocked = !currentBranchId;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Customers Management</h1>
          <p className="text-sm text-slate-500">Customers are saved under selected branch.</p>

          <p className="mt-2 text-xs text-slate-600">
            Selected Branch: <span className="font-bold">{branchLabel}</span>
          </p>

          {err ? <p className="mt-2 text-xs text-red-600">{err}</p> : null}
        </div>

        {!isAdding && canCreate && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-md shadow-primary/30 transition-all disabled:opacity-60"
            disabled={saving}
          >
            <span className="material-icons-outlined text-lg">person_add</span>
            Add Customer
          </button>
        )}
      </div>

      {/* ADD / EDIT FORM */}
      {isAdding && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-fade-in-up">
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-2">
            <h2 className="text-lg font-bold text-dark flex items-center gap-2">
              <span className="material-icons-outlined text-primary">
                {editingPk ? "edit" : "add_circle"}
              </span>
              {editingPk ? "Edit Customer" : "New Customer Registration"}
            </h2>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600"
              disabled={saving}
            >
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          {/* ✅ Branch auto display */}
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase">Branch (Auto)</label>
            <input
              value={branchLabel === "Not Selected" ? "" : branchLabel}
              readOnly
              className="w-full mt-1 bg-gray-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold cursor-not-allowed"
              placeholder="Select branch from header"
            />
          </div>

          {formBlocked && (
            <div className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Please select branch from header first.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Customer Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ahmad Traders"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Contact Person</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Full Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="03xx..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              />
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, City"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Customer Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                disabled={saving || formBlocked}
              >
                <option>Commercial</option>
                <option>Logistics</option>
                <option>Construction</option>
                <option>Agriculture</option>
                <option>Individual</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-success text-white font-bold hover:bg-success/90 shadow-md shadow-success/20 transition-all flex items-center gap-2 disabled:opacity-60"
              disabled={saving || formBlocked}
            >
              <span className="material-icons-outlined">check</span>
              {saving ? "Saving..." : editingPk ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search customers by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-dark focus:bg-white focus:border-primary outline-none transition-colors"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-primary outline-none cursor-pointer"
        >
          <option>All Types</option>
          <option>Commercial</option>
          <option>Logistics</option>
          <option>Construction</option>
          <option>Agriculture</option>
          <option>Individual</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:border-primary outline-none cursor-pointer"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Overdue</option>
          <option>Inactive</option>
        </select>

        <button
          onClick={loadCustomers}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-primary/40 transition-colors"
          disabled={loading}
        >
          <span className="material-icons-outlined text-[18px] mr-2 align-middle">refresh</span>
          Refresh
        </button>
      </div>

      {/* LIST VIEW */}
      {loading ? (
        <div className="text-sm text-slate-500">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.pk ?? cust.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center text-xl font-bold shadow-inner">
                  {(cust.name || "CU").substring(0, 2).toUpperCase()}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    cust.status === "Active"
                      ? "bg-success/10 text-success border border-success/20"
                      : cust.status === "Overdue"
                      ? "bg-error/10 text-error border border-error/20"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {cust.status}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-900 text-lg truncate mb-1" title={cust.name}>
                  {cust.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  {cust.type}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{cust.id}</p>
              </div>

              <div className="space-y-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-slate-400 text-[18px]">person</span>
                  <span className="font-medium truncate">{cust.contact || "—"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-icons-outlined text-slate-400 text-[18px]">phone</span>
                  <span className="font-medium truncate">{cust.phone || "—"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-icons-outlined text-slate-400 text-[18px] mt-0.5">
                    location_on
                  </span>
                  <span className="font-medium leading-tight line-clamp-2">{cust.address || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 pt-3 mt-1 border-t border-slate-200">
                  <span className="material-icons-outlined text-slate-400 text-[18px]">
                    account_balance_wallet
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      String(cust.balanceRaw).includes("-") ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {cust.balance}
                  </span>
                </div>
              </div>

              {canUpdateDelete && (
                <div className="mt-5 pt-0 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-white p-1 rounded-lg border border-slate-100 shadow-sm z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(cust);
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded transition-colors"
                    title="Edit"
                    disabled={saving}
                  >
                    <span className="material-icons-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cust);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                    disabled={saving}
                  >
                    <span className="material-icons-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Customers;
