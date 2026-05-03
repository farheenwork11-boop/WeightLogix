import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const PERIODS = [
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
  { key: "last30", label: "Last 30 Days" },
];

const fmtNum = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};
const fmtKg = (kg) => `${fmtNum(kg)} kg`;
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const timeAgoOrDate = (dt) => {
  if (!dt) return "--";
  try {
    const d = new Date(dt);
    return d.toLocaleString();
  } catch {
    return String(dt);
  }
};

const CustomerReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const [period, setPeriod] = useState("this_month");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'

  const [rows, setRows] = useState([]);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/reports/customers/?period=${period}`);
      setRows(res.data || []);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onBranchChanged = () => load();
    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, allowed]);

  const exportCSV = async () => {
    try {
      setErr("");
      const res = await api.get(`/reports/export/customers.csv?period=${period}`, { responseType: "blob" });
      downloadBlob(res.data, `customers-report-${period}.csv`);
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Customer Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Customer Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View customer performance and transaction history.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-dark dark:text-white focus:outline-none focus:border-primary"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <div className="flex border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-2 text-sm font-medium ${viewMode === "cards" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"}`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm font-medium ${viewMode === "table" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"}`}
            >
              Table
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {[
          { name: "Daily Summary", path: "/reports/daily" },
          { name: "Customer Report", path: "/reports/customers" },
          { name: "Vehicle Report", path: "/reports/vehicles" },
          { name: "Product Summary", path: "/reports/products" },
          { name: "Financial Report", path: "/reports/financial" },
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              location.pathname === item.path
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/50"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {err && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-red-600">
          {err}
        </div>
      )}

      {/* Cards or Table View */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto">
          {(loading ? Array.from({ length: 6 }) : rows).map((customer, i) => {
            if (loading) {
              return (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 mb-4" />
                  <div className="h-4 w-40 bg-slate-100 rounded mb-2" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              );
            }

            const name = customer.customer_name || "Walk-in";
            const slips = customer.total_slips || 0;
            const weight = customer.total_weight || 0;
            const lastActive = timeAgoOrDate(customer.last_active);

            return (
              <div
                key={customer.customer_id ?? `${name}-${i}`}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                    {lastActive}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-dark dark:text-white mb-2 group-hover:text-primary transition-colors">
                  {name}
                </h3>

                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-slate-400">Slips</p>
                    <p className="font-bold text-dark dark:text-white">{fmtNum(slips)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 dark:text-slate-400">Total Weight</p>
                    <p className="font-bold text-dark dark:text-white">{fmtKg(weight)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table View
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4 text-center">Slips</th>
                <th className="px-6 py-4 text-right">Total Weight</th>
                <th className="px-6 py-4 text-right">Avg Weight/Slip</th>
                <th className="px-6 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                    No data found for selected period.
                  </td>
                </tr>
              )}
              {!loading && rows.map((customer, i) => {
                const name = customer.customer_name || "Walk-in";
                const slips = customer.total_slips || 0;
                const weight = customer.total_weight || 0;
                const avgWeight = slips ? (weight / slips) : 0;
                const lastActive = timeAgoOrDate(customer.last_active);
                
                return (
                  <tr key={customer.customer_id ?? `${name}-${i}`} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-dark dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {name.charAt(0)}
                        </div>
                        {name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
                        {fmtNum(slips)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-dark dark:text-slate-200">{fmtKg(weight)}</td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-400">{fmtKg(avgWeight)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{lastActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerReport;
