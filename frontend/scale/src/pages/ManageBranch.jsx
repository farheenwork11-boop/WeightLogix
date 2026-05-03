import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const ManageBranch = () => {
  const { user } = useAuth();

  const role = user?.role || "Operator";
  const isAdmin = role === "Admin";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("customers"); // customers | vehicles | materials | slips | devices

  const branchIdSelected = useMemo(() => {
    // Admin must select branch in header selector (saved in localStorage)
    const raw = localStorage.getItem("current_branch_id");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, []);

  const loadSummary = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/branches/manage/summary/");
      setData(res.data);
    } catch (e) {
      setErr(extractErr(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const branch = data?.branch || null;
  const counts = data?.counts || {};
  const lists = data?.lists || {};

  const StatCard = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{label}</p>
        <span className="material-icons-outlined text-slate-400">{icon}</span>
      </div>
      <h3 className="text-2xl font-black text-dark dark:text-white mt-2">
        {Number.isFinite(Number(value)) ? Number(value) : 0}
      </h3>
    </div>
  );

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
        activeTab === id
          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-primary/40"
      }`}
    >
      <span className="material-icons-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );

  const EmptyState = ({ text }) => (
    <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-300">
      {text}
    </div>
  );

  // table rows
  const renderList = () => {
    if (!data) return null;

    if (activeTab === "customers") {
      const rows = lists.customers || [];
      if (!rows.length) return <EmptyState text="No recent customers found." />;
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm font-bold text-dark dark:text-white">{c.name || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{c.phone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "vehicles") {
      const rows = lists.vehicles || [];
      if (!rows.length) return <EmptyState text="No recent vehicles found." />;
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Number
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm font-bold text-dark dark:text-white">{v.number || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{v.type || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "materials") {
      const rows = lists.materials || [];
      if (!rows.length) return <EmptyState text="No recent materials found." />;
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Material
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm font-bold text-dark dark:text-white">{m.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === "slips") {
      const rows = lists.slips || [];
      if (!rows.length) return <EmptyState text="No recent slips found." />;
      return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Slip No
                </th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-sm font-bold text-dark dark:text-white">{s.slip_no || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">
                    {s.date ? String(s.date) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // devices
    const rows = lists.devices || [];
    if (!rows.length) return <EmptyState text="No recent devices found." />;
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Device
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Serial
              </th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {rows.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4 text-sm font-bold text-dark dark:text-white">{d.name || "—"}</td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{d.serial_no || "—"}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black border ${
                      String(d.status || "").toLowerCase() === "active"
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900"
                        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                    }`}
                  >
                    {d.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Manage Branch</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Branch dashboard summary (customers, vehicles, materials, slips, devices).
          </p>

          {/* Admin hint if branch not selected */}
          {isAdmin && !branchIdSelected && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-900">
              Admin: pehle header se branch select karo (top bar branch selector). Phir yeh page refresh karo.
            </div>
          )}

          {err && (
            <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 dark:bg-red-900/20 dark:text-red-200 dark:border-red-900">
              {err}
            </div>
          )}
        </div>

        <button
          onClick={loadSummary}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-primary/40 transition-colors"
          disabled={loading}
        >
          <span className="material-icons-outlined align-middle text-[18px] mr-2">refresh</span>
          Refresh
        </button>
      </div>

      {/* Branch Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
        {loading ? (
          <div className="text-sm text-slate-500 dark:text-slate-300">Loading branch summary...</div>
        ) : branch ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center">
                <span className="material-icons-outlined text-2xl">store</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-dark dark:text-white">{branch.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-300 flex items-center gap-1 mt-1">
                  <span className="material-icons-outlined text-[16px]">location_on</span>
                  {branch.location || "—"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                  Manager: <span className="font-bold text-slate-600 dark:text-slate-200">{branch.manager_name || "—"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black border ${
                  branch.status === "Active"
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900"
                    : branch.status === "Maintenance"
                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900"
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-900"
                }`}
              >
                {branch.status}
              </span>

              <div className="text-xs text-slate-400">
                Devices: <span className="font-black text-slate-700 dark:text-slate-200">{branch.devices ?? 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState text="No branch summary available." />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Customers" value={counts.customers} icon="group" />
        <StatCard label="Vehicles" value={counts.vehicles} icon="local_shipping" />
        <StatCard label="Materials" value={counts.materials} icon="category" />
        <StatCard label="Slips" value={counts.slips} icon="receipt_long" />
        <StatCard label="Devices" value={counts.devices} icon="scale" />
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Role</p>
          <h3 className="text-2xl font-black text-dark dark:text-white mt-2">{role}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        <TabButton id="customers" label="Customers" icon="group" />
        <TabButton id="vehicles" label="Vehicles" icon="local_shipping" />
        <TabButton id="materials" label="Materials" icon="category" />
        <TabButton id="slips" label="Slips" icon="receipt_long" />
        <TabButton id="devices" label="Devices" icon="scale" />
      </div>

      {/* Lists */}
      {loading ? (
        <div className="text-sm text-slate-500 dark:text-slate-300">Loading list...</div>
      ) : (
        renderList()
      )}
    </div>
  );
};

export default ManageBranch;
