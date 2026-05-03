import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const PERIODS = [
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "last30", label: "Last 30 Days" },
  { key: "this_year", label: "This Year" },
];

const fmtNum = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};
const fmtPKR = (n) => `PKR ${fmtNum(n)}`;
const downloadTextFile = (text, filename, mime = "text/csv;charset=utf-8;") => {
  const blob = new Blob([text], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

const fmtDate = (dt) => {
  if (!dt) return "";
  try {
    const d = new Date(dt);
    return d.toLocaleDateString();
  } catch {
    return String(dt);
  }
};

const FinancialReport = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const [period, setPeriod] = useState("this_month");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [data, setData] = useState(null);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/reports/financial/?period=${period}`);
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
  }, [period, allowed]);

  const totalRevenue = data?.total_revenue ?? 0;
  const avgTicket = data?.avg_ticket ?? 0;
  const outstanding = data?.outstanding ?? 0;
  const recent = data?.recent_transactions || [];

  const growthBadge = useMemo(() => {
    // backend doesn't provide trend -> keep static
    return "+0% Growth";
  }, []);
  const exportAuditCSV = () => {
    const header = ["Date", "Description", "Customer", "Method", "Amount", "Paid"];
    const lines = recent.map((r) => [fmtDate(r.date), r.description, r.customer, r.method, r.amount, r.paid]);
    const csv = [header, ...lines]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadTextFile(csv, `financial-audit-${period}.csv`);
  };

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Financial Report</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Financial Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue analysis and financial metrics.</p>
        </div>

        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-bold text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={exportAuditCSV}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">description</span>
            Export Audit
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary-hover p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
          <p className="text-blue-100 font-medium mb-1">Total Revenue</p>
          <h3 className="text-3xl font-bold mb-4">{loading ? "..." : fmtPKR(totalRevenue)}</h3>
          <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="material-icons-outlined text-sm">trending_up</span>
            <span>{growthBadge}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
              <span className="material-icons-outlined">payments</span>
            </div>
            <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-gray-500">
              Avg / Slip
            </span>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Average Ticket</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white">{loading ? "..." : fmtPKR(avgTicket)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600">
              <span className="material-icons-outlined">account_balance_wallet</span>
            </div>
            <span className="text-xs font-bold bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg text-gray-500">
              Unpaid
            </span>
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">Outstanding</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white">{loading ? "..." : fmtPKR(outstanding)}</h3>
        </div>
      </div>

      {/* Recent Revenue Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col flex-1">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-dark dark:text-white">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase font-semibold bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Paid</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                recent.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">{fmtDate(row.date)}</td>
                    <td className="px-6 py-4 font-medium text-dark dark:text-white">{row.description}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{row.customer}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded text-xs font-bold">
                        {row.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-dark dark:text-white">{fmtPKR(row.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          row.paid === "Yes"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {row.paid}
                      </span>
                    </td>
                  </tr>
                ))}

              {!loading && recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-slate-500">
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

export default FinancialReport;
