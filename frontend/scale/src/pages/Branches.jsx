// src/pages/Branches.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Branches = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const isManager = role === "Manager";

  const myCompany = (user?.company || "").trim();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [branches, setBranches] = useState([]);

  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const initialFormState = useMemo(
    () => ({
      name: "",
      location: "",
      status: "Active",
      manager_id: null,
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErr("");
  };

  const openAdd = () => {
    if (!isManager) return;
    setErr("");
    setFormData(initialFormState);
    setEditingId(null);
    setIsAdding(true);
  };

  const openEdit = (branch) => {
    if (!isManager) return;

    setErr("");
    setEditingId(branch.id);

    setFormData({
      name: branch.name || "",
      location: branch.location || "",
      status: branch.status || "Active",
      // ✅ we return "manager" read-only id from serializer
      manager_id: branch?.manager ?? null,
    });

    setIsAdding(true);
  };

  const loadBranches = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/branches/");
      const list = res?.data?.results || res?.data || [];
      setBranches(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ managers dropdown from dedicated endpoint
  const loadManagers = async () => {
    if (!isManager) return;
    setLoadingManagers(true);
    try {
      const res = await api.get("/accounts/managers/");
      const list = res?.data?.results || res?.data || [];
      setManagers(Array.isArray(list) ? list : []);
    } catch (e) {
      setManagers([]);
    } finally {
      setLoadingManagers(false);
    }
  };

  const createBranch = async () => {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        name: (formData.name || "").trim(),
        location: (formData.location || "").trim(),
        status: formData.status || "Active",
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
      };

      const res = await api.post("/branches/", payload);
      const created = res?.data;

      setBranches((prev) => [created, ...prev]);
      resetForm();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const updateBranch = async (id) => {
    setErr("");
    setSaving(true);
    try {
      const payload = {
        name: (formData.name || "").trim(),
        location: (formData.location || "").trim(),
        status: formData.status || "Active",
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
      };

      const res = await api.put(`/branches/${id}/`, payload);
      const updated = res?.data;

      setBranches((prev) => prev.map((b) => (b.id === id ? updated : b)));
      resetForm();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteBranch = async (id) => {
    if (!isManager) return;
    const ok = window.confirm("Are you sure you want to delete this branch?");
    if (!ok) return;

    setErr("");
    try {
      await api.delete(`/branches/${id}/`);
      setBranches((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  const handleSave = async () => {
    if (!isManager) return;

    if (!(formData.name || "").trim()) {
      setErr("Branch Name is required!");
      return;
    }
    if (!myCompany) {
      setErr("Your account has no company set. Please update profile/company first.");
      return;
    }

    if (editingId) await updateBranch(editingId);
    else await createBranch();
  };

  useEffect(() => {
    loadBranches();

    const onBranchChanged = () => loadBranches();
    const onDeviceChanged = () => loadBranches();

    window.addEventListener("branch-changed", onBranchChanged);
    window.addEventListener("device-changed", onDeviceChanged);

    return () => {
      window.removeEventListener("branch-changed", onBranchChanged);
      window.removeEventListener("device-changed", onDeviceChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (isAdding && isManager) loadManagers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdding, isManager]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Branches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isManager ? "Manage your locations and site settings." : "View your assigned branch."}
          </p>
        </div>

        {isManager && (
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30"
          >
            <span className="material-icons-outlined text-lg">store</span>
            Add Branch
          </button>
        )}
      </div>

      {err && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
          {err}
        </div>
      )}

      {loading && <div className="text-sm text-gray-500">Loading branches...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {branches.map((branch) => {
            const devicesCount = Number.isFinite(Number(branch.devices_count))
              ? Number(branch.devices_count)
              : 0;

            return (
              <div
                key={branch.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center">
                    <span className="material-icons-outlined text-2xl">business</span>
                  </div>

                  {isManager && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(branch)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <span className="material-icons-outlined">edit</span>
                      </button>
                      <button
                        onClick={() => deleteBranch(branch.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <span className="material-icons-outlined">delete</span>
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-dark dark:text-white">{branch.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">location_on</span>
                  {branch.location || "—"}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-slate-700">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-gray-500 dark:text-slate-400">Company</span>
                    <span className="font-medium text-dark dark:text-white">{branch.company || "—"}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-gray-500 dark:text-slate-400">Manager</span>
                    <span className="font-medium text-dark dark:text-white">
                      {branch.manager_name || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
                    <span className="text-gray-500 dark:text-slate-400">Active Scales</span>
                    <span className="font-medium text-dark dark:text-white">{devicesCount} Devices</span>
                  </div>

                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500 dark:text-slate-400">Status</span>
                    <span
                      className={`px-2 py-0.5 rounded textxs font-bold ${
                        branch.status === "Active"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : branch.status === "Maintenance"
                          ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full mt-4 py-2 border border-blue-100 dark:border-blue-900/50 text-primary rounded-lg text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={() => window.dispatchEvent(new Event("branch-changed"))}
                >
                  Manage Branch
                </button>
              </div>
            );
          })}

          {isManager && (
            <button
              onClick={openAdd}
              className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all min-h-[280px]"
            >
              <span className="material-icons-outlined text-4xl mb-2">add_circle_outline</span>
              <span className="font-bold">Add New Branch</span>
            </button>
          )}
        </div>
      )}

      {isAdding && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-icons-outlined text-primary">
                  {editingId ? "edit" : "add_circle"}
                </span>
                {editingId ? "Edit Branch Details" : "Register New Branch"}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            {/* Company auto */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Company (Auto)
              </label>
              <input
                value={myCompany}
                readOnly
                className="w-full mt-1 bg-gray-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-bold cursor-not-allowed text-dark dark:text-white"
                placeholder="Company not set"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-dark dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-dark dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Manager (Optional)
                </label>
                <select
                  value={formData.manager_id ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      manager_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-dark dark:text-white cursor-pointer"
                >
                  <option value="">
                    {loadingManagers ? "Loading managers..." : "No manager (select later)"}
                  </option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email || `Manager #${m.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-dark dark:text-white cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {err && (
              <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
                {err}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={resetForm}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim() || !myCompany}
                className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                <span className="material-icons-outlined">check</span>
                {saving ? "Saving..." : editingId ? "Update Branch" : "Save Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
