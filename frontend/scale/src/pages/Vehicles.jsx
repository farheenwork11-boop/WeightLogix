// src/pages/Vehicles.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Vehicles = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";

  const canCreate = ["Admin", "Manager", "Operator"].includes(role);
  const canUpdateDelete = ["Admin", "Manager"].includes(role);

  // ✅ Current branch (from header selector localStorage)
  const currentBranchId = useMemo(() => {
    const v = localStorage.getItem("current_branch_id");
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  // CRUD State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // server state
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Form State
  const initialFormState = useMemo(
    () => ({
      reg: "",
      type: "Truck 10-Wheeler",
      driver: "",
      capacity: "",
      status: "Active",
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormState);

  // -------------------------
  // API
  // -------------------------
  const loadVehicles = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      // ✅ backend will scope using X-Branch-Id via axios interceptor
      const res = await api.get("/vehicles/", { params });
      const list = res?.data?.results || res?.data || [];
      setVehicles(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadVehicles(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, typeFilter, statusFilter]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErr("");
  };

  const validateForm = () => {
    const reg = (formData.reg || "").trim();
    if (!reg) return "Registration Number is required.";
    const cap = formData.capacity === "" ? 0 : Number(formData.capacity);
    if (!Number.isFinite(cap) || cap < 0) return "Capacity must be a valid number (>= 0).";
    return "";
  };

  const handleSave = async () => {
    const msg = validateForm();
    if (msg) {
      setErr(msg);
      return;
    }

    // ✅ Admin must select branch in header first (since backend derives company from branch)
    if (role === "Admin" && !currentBranchId) {
      setErr("Admin: Please select branch from header before saving vehicle.");
      return;
    }

    setSaving(true);
    setErr("");

    const payload = {
      reg: formData.reg?.trim(),
      type: formData.type,
      driver: (formData.driver || "").trim(),
      capacity: Number(formData.capacity || 0),
      status: formData.status,
      // ❌ company/branch not sent - backend handles via selected branch header
    };

    try {
      if (editingId) {
        if (!canUpdateDelete) {
          setErr("You do not have permission to update.");
          return;
        }
        await api.patch(`/vehicles/${editingId}/`, payload);
      } else {
        if (!canCreate) {
          setErr("You do not have permission to create.");
          return;
        }
        await api.post("/vehicles/", payload);
      }

      resetForm();
      await loadVehicles();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vehicle) => {
    if (!canUpdateDelete) return;
    setErr("");
    setEditingId(vehicle.id);
    setIsAdding(true);
    setFormData({
      reg: vehicle?.reg || "",
      type: vehicle?.type || "Truck 10-Wheeler",
      driver: vehicle?.driver || "",
      capacity: vehicle?.capacity ?? "",
      status: vehicle?.status || "Active",
    });
  };

  const handleDelete = async (id) => {
    if (!canUpdateDelete) return;

    const ok = window.confirm("Are you sure you want to delete this vehicle?");
    if (!ok) return;

    setErr("");
    try {
      await api.delete(`/vehicles/${id}/`);
      await loadVehicles();
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  const filteredVehicles = useMemo(() => vehicles, [vehicles]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Vehicles Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage fleet registry and tare weights.
          </p>
        </div>

        {!isAdding && canCreate && (
          <button
            onClick={() => {
              setErr("");
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">local_shipping</span>
            Add Vehicle
          </button>
        )}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {err}
        </div>
      )}

      {/* ✅ Admin hint if branch not selected */}
      {role === "Admin" && !currentBranchId && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          Admin: Please select a branch from header first (current_branch_id) — vehicles branch/company backend se auto set hota hai.
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {editingId ? "edit" : ""}
              </span>
              {editingId ? "Edit Vehicle" : "New Vehicle Registry"}
            </h2>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Registration # *
              </label>
              <input
                type="text"
                value={formData.reg}
                onChange={(e) => setFormData((p) => ({ ...p, reg: e.target.value }))}
                placeholder="e.g. KAB-902"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Driver Name
              </label>
              <input
                type="text"
                value={formData.driver}
                onChange={(e) => setFormData((p) => ({ ...p, driver: e.target.value }))}
                placeholder="Driver Name"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Vehicle Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option>Truck 10-Wheeler</option>
                <option>Mazda High Roof</option>
                <option>Dumper</option>
                <option>Trailer 22-Wheeler</option>
                <option>Pickup</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Max Capacity (kg)
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                placeholder="50000"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={resetForm}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-70"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <span className="material-symbols-outlined">check</span>
              {saving ? "Saving..." : editingId ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search vehicles by Reg #, Driver, Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary outline-none transition-colors"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 focus:border-primary outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="Truck 10-Wheeler">Truck 10-Wheeler</option>
          <option value="Mazda High Roof">Mazda High Roof</option>
          <option value="Dumper">Dumper</option>
          <option value="Trailer 22-Wheeler">Trailer 22-Wheeler</option>
          <option value="Pickup">Pickup</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 focus:border-primary outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={loadVehicles}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-dark hover:bg-slate-50 flex items-center gap-2"
          disabled={loading}
        >
          <span className="material-icons-outlined text-lg">refresh</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Registration #</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Max Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredVehicles.map((veh) => (
                <tr
                  key={veh.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-dark dark:text-white">{veh.reg}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{veh.type}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{veh.driver || "—"}</td>
                  <td className="px-6 py-4 font-mono font-medium text-dark dark:text-slate-200">
                    {Number(veh.capacity || 0).toLocaleString()} kg
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border 
                      ${
                        veh.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900"
                          : veh.status === "Maintenance"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900"
                          : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {veh.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {canUpdateDelete && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(veh)}
                          className="p-1 text-gray-400 hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(veh.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredVehicles.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-10">No vehicles found.</div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
