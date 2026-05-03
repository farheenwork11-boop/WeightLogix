import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";


const PERIODS = [
  { key: "last30", label: "Last 30 Days" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "this_year", label: "This Year" },
  { key: "last7", label: "Last 7 Days" },
];

const fmtNum = (n) => {
  const x = Number(n || 0);
  return Number.isFinite(x) ? x.toLocaleString() : "0";
};

const fmtKg = (kg) => `${fmtNum(kg)} kg`;
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

const ProductSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const allowed = role === "Admin" || role === "Manager";

  const [period, setPeriod] = useState("last30");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState([]);

  const load = async () => {
    if (!allowed) return;
    setErr("");
    setLoading(true);
    try {
      const res = await api.get(`/reports/products/?period=${period}`);
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(extractErr(e));
      setRows([]);
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
  }, [period]);

  const products = useMemo(() => {
    // backend gives: {material_id, material_name, slips, total_weight, percentage}
    return rows.map((r) => ({
      id: r.material_id,
      name: r.material_name || "Unknown",
      slips: r.slips || 0,
      total_weight: r.total_weight || 0,
      percentage: r.percentage || 0,
    }));
  }, [rows]);
  const exportProductCSV = () => {
    const header = ["Product", "Slips", "Total Weight (kg)", "Percentage"];
    const lines = products.map((p) => [p.name, p.slips, p.total_weight, p.percentage]);
    const csv = [header, ...lines]
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadTextFile(csv, `products-summary-${period}.csv`);
  };

  if (!allowed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-dark">Product Summary</h1>
        <p className="text-sm text-slate-500 mt-1">Reports are available for Admin/Manager only.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-auto min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Product Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Inventory movement and product distribution analysis.
          </p>
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
            onClick={exportProductCSV}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover flex items-center gap-2 shadow-sm shadow-primary/30 transition-all"
          >
            <span className="material-icons-outlined text-lg">pie_chart</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Weight Distribution</h3>

          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-slate-500">No data found.</div>
          ) : (
            <div className="space-y-6">
              {products.map((p) => (
                <div key={p.id ?? p.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-dark dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                      {p.name}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {fmtKg(p.total_weight)} ({fmtNum(p.percentage)}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(0, Math.min(100, Number(p.percentage || 0)))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-dark dark:text-white mb-6">Product Details</h3>

          <div className="divide-y divide-gray-50 dark:divide-slate-700 overflow-x-auto">
            {loading && <div className="py-4 text-sm text-slate-500">Loading...</div>}

            {!loading &&
              products.map((p) => (
                <div key={p.id ?? p.name} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <span className="material-icons-outlined text-lg text-primary">category</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-500">{fmtNum(p.slips)} Transactions</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-dark dark:text-white">{fmtKg(p.total_weight)}</p>
                    <p className="text-xs text-slate-500">{fmtNum(p.percentage)}% share</p>
                  </div>
                </div>
              ))}

            {!loading && products.length === 0 && (
              <div className="py-4 text-sm text-slate-500">No data found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;
