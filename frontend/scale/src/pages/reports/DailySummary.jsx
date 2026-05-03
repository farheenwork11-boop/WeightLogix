import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

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

const DailySummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayISO());
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [data, setData] = useState(null);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/reports/daily/?date=${date}`);
      setData(res.data || null);
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
  }, [date, allowed]);

  const exportPDF = async () => {
    try {
      setErr("");
      const res = await api.get(`/reports/export/daily.pdf?date=${date}`, { responseType: "blob" });
      downloadBlob(res.data, `daily-summary-${date}.pdf`);
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  const filteredTx = useMemo(() => {
    const tx = data?.transactions || [];
    const needle = (q || "").trim().toLowerCase();
    if (!needle) return tx;

    return tx.filter((t) => {
      const s = `${t.serial_no} ${t.customer} ${t.vehicle} ${t.material} ${t.status}`.toLowerCase();
      return s.includes(needle);
    });
  }, [data, q]);

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Daily Summary</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Slips",
      value: fmtNum(data?.total_slips),
      icon: "receipt_long",
      color: "bg-primary-light text-primary",
    },
    {
      title: "Total Weight",
      value: fmtKg(data?.total_weight),
      icon: "monitor_weight",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Avg Weight/Slip",
      value: fmtKg(data?.avg_weight_per_slip),
      icon: "analytics",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Active Hours",
      value: `${fmtNum(data?.active_hours)} Hrs`,
      icon: "schedule",
      color: "bg-primary-light text-secondary",
    },
  ];

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Daily Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detailed transactions and weight summary for selected date.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-dark dark:text-white focus:outline-none focus:border-primary"
          />
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">download</span>
            Export PDF
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(loading ? Array.from({ length: 4 }) : stats).map((stat, i) => {
          if (loading) {
            return (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 animate-pulse"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100" />
                <div className="flex-1">
                  <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
                  <div className="h-5 w-28 bg-slate-100 rounded" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} bg-opacity-100 dark:bg-opacity-20`}>
                <span className="material-icons-outlined">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{stat.title}</p>
                <h3 className="text-xl font-bold text-dark dark:text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col flex-1">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center gap-3">
          <h3 className="text-lg font-bold text-dark dark:text-white">Transactions</h3>

          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search slips..."
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-1 focus:ring-primary w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Slip ID</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4 text-right">Net Weight</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {!loading &&
                filteredTx.map((row, i) => (
                  <tr key={row.id ?? i} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{`SL-${row.serial_no}`}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{row.time || ""}</td>
                    <td className="px-6 py-4 text-dark dark:text-white font-medium">{row.customer || "Walk-in"}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{row.vehicle || ""}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{row.material || ""}</td>
                    <td className="px-6 py-4 text-right font-bold text-dark dark:text-slate-200">{fmtKg(row.net_weight)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          row.status === "Completed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && filteredTx.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-sm text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
