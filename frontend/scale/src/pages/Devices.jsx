// src/pages/Devices.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const BRANCH_KEY = "current_branch_id";

const Devices = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const isManager = role === "Manager";

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  // Server State
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Form
  const initialFormState = useMemo(
    () => ({
      name: "",
      status: "Online",
      ip: "",
      port: 8080,
      calibrationDue: null,
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormState);

  // ✅ always read latest branch from localStorage (admin can switch)
  const getBranchSelected = () => {
    const v = localStorage.getItem(BRANCH_KEY);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  // ✅ normalize device code (backend lookup uses code)
  const getCode = (d) => String(d?.code || d?.id || "").trim();

  // -------------------------
  // API
  // -------------------------
  const loadDevices = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/devices/");
      const list = res?.data?.results || res?.data || [];
      setDevices(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();

    // ✅ reload when branch selection changes (header selector dispatches this)
    const onBranchChanged = () => loadDevices();
    window.addEventListener("branch-changed", onBranchChanged);

    return () => window.removeEventListener("branch-changed", onBranchChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setIsAdding(false);
    setEditingCode(null);
    setFormData(initialFormState);
    setErr("");
  };

  const validateForm = () => {
    const name = (formData.name || "").trim();
    const ip = (formData.ip || "").trim();
    if (!name) return "Device name is required.";
    if (!ip) return "IP address is required.";
    return "";
  };

  const handleSave = async () => {
    const msg = validateForm();
    if (msg) {
      setErr(msg);
      return;
    }

    const branchSelected = getBranchSelected();

    // ✅ Manager create requires a selected branch (because backend requires X-Branch-Id for create)
    if (isManager && !editingCode && !branchSelected) {
      setErr("Manager: Please select a branch from header before creating a device.");
      return;
    }

    setSaving(true);
    setErr("");

    const payload = {
      name: formData.name?.trim(),
      status: formData.status,
      ip: formData.ip?.trim(),
      port: Number(formData.port || 0) || 8080,
      calibrationDue: formData.calibrationDue || null,
      // ✅ branch resolved from X-Branch-Id by api interceptor (services/api.js)
    };

    try {
      if (editingCode) {
        await api.patch(`/devices/${encodeURIComponent(editingCode)}/`, payload);
      } else {
        await api.post("/devices/", payload);
      }

      // ✅ tell Branches page to refresh devices_count
      window.dispatchEvent(new Event("device-changed"));

      resetForm();
      await loadDevices();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (device) => {
    setErr("");
    const code = getCode(device);
    if (!code) {
      setErr("Device code missing in response. Please refresh.");
      return;
    }

    setEditingCode(code);
    setIsAdding(true);
    setFormData({
      name: device?.name || "",
      status: device?.status || "Online",
      ip: device?.ip || "",
      port: device?.port || 8080,
      calibrationDue: device?.calibrationDue || null,
    });
  };

  const handleDelete = async (device) => {
    const code = getCode(device);
    if (!code) {
      setErr("Device code missing. Please refresh.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this device?");
    if (!ok) return;

    setErr("");
    try {
      await api.delete(`/devices/${encodeURIComponent(code)}/`);

      // ✅ tell Branches page to refresh devices_count
      window.dispatchEvent(new Event("device-changed"));

      await loadDevices();
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  // -------------------------
  // UI helpers
  // -------------------------
  const filteredDevices = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return devices;

    return devices.filter((d) => {
      const code = String(d?.code || d?.id || "").toLowerCase();
      const name = String(d?.name || "").toLowerCase();
      const ip = String(d?.ip || "").toLowerCase();
      return code.includes(q) || name.includes(q) || ip.includes(q);
    });
  }, [devices, searchTerm]);

  const statusDot = (status) => {
    if (status === "Online") return "bg-green-500 ring-green-500";
    if (status === "Offline") return "bg-red-500 ring-red-500";
    return "bg-yellow-500 ring-yellow-500";
  };

  const statusText = (status) => {
    if (status === "Online") return "text-green-600";
    if (status === "Offline") return "text-red-600";
    return "text-yellow-600";
  };

  const branchSelected = getBranchSelected();

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Devices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor scale connectivity and calibration status.
          </p>

          {/* ✅ Manager branch hint */}
          {isManager && !branchSelected && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg inline-block px-3 py-2">
              Manager: Pehle header se branch select karo (X-Branch-Id) phir device add karo.
            </p>
          )}
        </div>

        {!isAdding && (
          <button
            onClick={() => {
              setErr("");
              setIsAdding(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30"
          >
            <span className="material-icons-outlined text-lg">add_link</span>
            Connect New Device
          </button>
        )}
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {err}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {editingCode ? "edit" : "add_circle"}
              </span>
              {editingCode ? "Edit Device Configuration" : "Connect New Device"}
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
                Device Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Gate 1 Scale"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                IP Address *
              </label>
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => setFormData((p) => ({ ...p, ip: e.target.value }))}
                placeholder="192.168.1.x"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Port
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData((p) => ({ ...p, port: e.target.value }))}
                placeholder="8080"
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
                <option>Online</option>
                <option>Offline</option>
                <option>Maintenance</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Calibration Due
              </label>
              <input
                type="date"
                value={formData.calibrationDue || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    calibrationDue: e.target.value || null,
                  }))
                }
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <span className="material-symbols-outlined">check</span>
              {saving ? "Saving..." : editingCode ? "Update Device" : "Connect Device"}
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex gap-4">
        <div className="relative flex-1">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search devices by Code / Name / IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary outline-none transition-colors"
          />
        </div>

        <button
          onClick={loadDevices}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-dark hover:bg-slate-50 flex items-center gap-2"
          disabled={loading}
        >
          <span className="material-icons-outlined text-lg">refresh</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDevices.map((device) => {
          const code = getCode(device); // ✅ always code
          return (
            <div
              key={code || device?.id || device?.name}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all group relative"
            >
              {/* Status Dot */}
              <div
                className={`absolute top-6 right-6 w-3 h-3 rounded-full ring-4 ring-opacity-20 ${statusDot(
                  device.status
                )}`}
              />

              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-900 text-dark dark:text-white flex items-center justify-center mb-4">
                <span className="material-icons-outlined text-2xl">scale</span>
              </div>

              <h3 className="text-lg font-bold text-dark dark:text-white">{device.name}</h3>
              <p className="text-xs font-mono text-gray-400 mb-1">{code || "—"}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">{device.branch || "—"}</p>

              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 space-y-2 mb-4 border border-gray-100 dark:border-slate-700">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Status</span>
                  <span className={`font-bold ${statusText(device.status)}`}>{device.status}</span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">IP Addr</span>
                  <span className="font-medium text-dark dark:text-slate-200">
                    {device.ip}:{device.port}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Calibration</span>
                  <span className="font-medium text-dark dark:text-slate-200">
                    {device.calibrationDue || "—"}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">Last Sync</span>
                  <span className="font-medium text-dark dark:text-slate-200">
                    {device.lastSync ? new Date(device.lastSync).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(device)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-dark dark:bg-slate-600 rounded-lg hover:bg-black dark:hover:bg-slate-500 transition-colors"
                >
                  Configure
                </button>
                <button
                  onClick={() => handleDelete(device)}
                  className="flex-1 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && filteredDevices.length === 0 && (
        <div className="text-sm text-slate-500 text-center py-10">No devices found.</div>
      )}
    </div>
  );
};

export default Devices;
