// src/pages/Materials.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Materials = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";

  // ✅ Current branch (reactive)
  const [currentBranchId, setCurrentBranchId] = useState(() => {
    const v = localStorage.getItem("current_branch_id");
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  });

  useEffect(() => {
    const sync = () => {
      const v = localStorage.getItem("current_branch_id");
      const n = Number(v);
      setCurrentBranchId(Number.isFinite(n) && n > 0 ? n : null);
    };

    // storage event same-tab pe fire nahi hota mostly
    const t = setInterval(sync, 800);
    window.addEventListener("storage", sync);

    return () => {
      clearInterval(t);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // server state
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const initialFormState = useMemo(
    () => ({
      name: "",
      code: "",
      type: "Bulk",
      description: "",
      status: "Active",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);

  // -------------------------
  // API
  // -------------------------
  const loadMaterials = async () => {
    setErr("");
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.material_type = typeFilter; // backend filter field

      const res = await api.get("/materials/", { params });
      const list = res?.data?.results || res?.data || [];
      setMaterials(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh on filters
  useEffect(() => {
    const t = setTimeout(() => loadMaterials(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, typeFilter, statusFilter, currentBranchId]);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErr("");
  };

  const validateForm = () => {
    const name = (formData.name || "").trim();
    if (!name) return "Material Name is required.";
    return "";
  };

  const handleSave = async () => {
    const msg = validateForm();
    if (msg) {
      setErr(msg);
      return;
    }

    // ✅ Admin must select branch in header first
    if (role === "Admin" && !currentBranchId) {
      setErr("Admin: Please select branch from header (X-Branch-Id) before creating material.");
      return;
    }

    setSaving(true);
    setErr("");

    const payload = {
      name: formData.name?.trim(),
      code: (formData.code || "").trim(), // can be blank; model auto generates
      type: formData.type,
      description: formData.description || "",
      status: formData.status,
    };

    try {
      if (editingId) {
        await api.patch(`/materials/${editingId}/`, payload);
      } else {
        await api.post("/materials/", payload);
      }
      resetForm();
      await loadMaterials();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material) => {
    setErr("");
    setEditingId(material.id);
    setIsAdding(true);
    setFormData({
      name: material?.name || "",
      code: material?.code || "",
      type: material?.type || "Bulk",
      description: material?.description || "",
      status: material?.status || "Active",
    });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this material?");
    if (!ok) return;

    setErr("");
    try {
      await api.delete(`/materials/${id}/`);
      await loadMaterials();
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  const handleToggleStatus = async (id) => {
    setErr("");
    try {
      await api.post(`/materials/${id}/toggle_status/`);
      await loadMaterials();
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  const filteredMaterials = useMemo(() => materials, [materials]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Materials Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage materials and products for weighing operations.
          </p>

          {role === "Admin" && !currentBranchId && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg inline-block px-3 py-2">
              Admin: Pehle header se branch select karo (X-Branch-Id) phir material add karo.
            </p>
          )}
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setErr("");
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">category</span>
            Add Material
          </button>
        )}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {err}
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {editingId ? "edit" : "add_circle"}
              </span>
              {editingId ? "Edit Material" : "New Material"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Material Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Sand, Cement, Coal"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Material Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                placeholder="Leave blank for auto"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Material Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option>Bulk</option>
                <option>Solid</option>
                <option>Liquid</option>
              </select>
            </div>

            <div className="space-y-1 lg:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Description / Remarks
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Additional details about the material"
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
              {saving ? "Saving..." : editingId ? "Update Material" : "Save Material"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search materials by name or code..."
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
          <option value="Bulk">Bulk</option>
          <option value="Solid">Solid</option>
          <option value="Liquid">Liquid</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-300 focus:border-primary outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={loadMaterials}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-dark hover:bg-slate-50 flex items-center gap-2"
          disabled={loading}
        >
          <span className="material-icons-outlined text-lg">refresh</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Material Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredMaterials.map((mat) => (
                <tr key={mat.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-dark dark:text-white">{mat.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{mat.code}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                        mat.type === "Bulk"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : mat.type === "Solid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}
                    >
                      {mat.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300 max-w-xs truncate" title={mat.description}>
                    {mat.description || "N/A"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(mat.id)}
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border transition-colors ${
                        mat.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-slate-700 dark:text-slate-400"
                      }`}
                      title="Toggle Status"
                    >
                      {mat.status}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-sm">{mat.createdDate}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(mat)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                        title="Edit"
                        disabled={saving}
                      >
                        <span className="material-icons-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                        disabled={saving}
                      >
                        <span className="material-icons-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredMaterials.length === 0 && (
          <div className="text-sm text-slate-500 text-center py-10">No materials found.</div>
        )}
      </div>
    </div>
  );
};

export default Materials;
