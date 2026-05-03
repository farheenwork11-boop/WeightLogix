// src/pages/SlipsHistory.jsx
import React, { useEffect, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const BRANCH_KEY = "current_branch_id";

const SlipsHistory = () => {
  const { user } = useAuth();

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

  // -------------------------
  // UI state
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // -------------------------
  // Data
  // -------------------------
  const [slips, setSlips] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  // -------------------------
  // Filtering state
  // -------------------------
  const [filterType, setFilterType] = useState("all"); // today, week, month, 3months, year, all, custom
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // -------------------------
  // Helpers
  // -------------------------
  const localISODate = (d = new Date()) => {
    // local date (not UTC) in YYYY-MM-DD
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };

  // -------------------------
  // Date helpers for filtering
  // -------------------------
  const getFilterDates = () => {
    const today = new Date();
    const dates = { startDate: null, endDate: null };

    switch (filterType) {
      case "today":
        dates.startDate = localISODate(today);
        dates.endDate = localISODate(today);
        break;
      case "week":
        {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          dates.startDate = localISODate(weekStart);
          dates.endDate = localISODate(today);
        }
        break;
      case "month":
        dates.startDate = localISODate(new Date(today.getFullYear(), today.getMonth(), 1));
        dates.endDate = localISODate(today);
        break;
      case "3months":
        {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          dates.startDate = localISODate(threeMonthsAgo);
          dates.endDate = localISODate(today);
        }
        break;
      case "year":
        dates.startDate = localISODate(new Date(today.getFullYear(), 0, 1));
        dates.endDate = localISODate(today);
        break;
      case "custom":
        dates.startDate = customStartDate;
        dates.endDate = customEndDate;
        break;
      case "all":
      default:
        // No date filtering
        break;
    }

    return dates;
  };

  // -------------------------
  // Load slips with filtering
  // -------------------------
  const loadAll = async (p = page) => {
    setErr("");
    setLoading(true);

    try {
      const filterDates = getFilterDates();
      const params = { page: p };
      
      if (filterDates.startDate) {
        params.start_date = filterDates.startDate;
      }
      if (filterDates.endDate) {
        params.end_date = filterDates.endDate;
      }

      const [sRes] = await Promise.all([
        api.get("/slips/", { params }),
      ]);

      const slipPayload = sRes?.data || {};
      const slipRows = slipPayload?.results || slipPayload || [];
      setSlips(Array.isArray(slipRows) ? slipRows : []);
      setCount(Number(slipPayload?.count || (Array.isArray(slipRows) ? slipRows.length : 0)) || 0);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, customStartDate, customEndDate]);

  useEffect(() => {
    loadAll(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // -------------------------
  // UI classes
  // -------------------------
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";
  const inputClass = "w-full bg-blue-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
  const filterBtnClass = (active) => `px-3 py-2 text-sm font-bold rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}`;

  const totalPages = Math.max(1, Math.ceil((count || 0) / 10));

  // Get filter display text
  const getFilterText = () => {
    switch (filterType) {
      case "today": return "Today's Records";
      case "week": return "This Week";
      case "month": return "This Month";
      case "3months": return "Last 3 Months";
      case "year": return "This Year";
      case "custom": return "Custom Range";
      case "all": return "All Records";
      default: return "All Records";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Slips History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Filter and manage your weighing records
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                setErr("");
                const res = await api.get("/slips/export_csv/", { responseType: "blob" });
                downloadBlob(res.data, "slips.csv");
              } catch (e) {
                setErr(extractErr(e));
              }
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {err}
        </div>
      )}

      {/* Professional Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Filter Records</h3>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Showing: {getFilterText()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setFilterType("today")} className={filterBtnClass(filterType === "today")}>
            Today
          </button>
          <button onClick={() => setFilterType("week")} className={filterBtnClass(filterType === "week")}>
            This Week
          </button>
          <button onClick={() => setFilterType("month")} className={filterBtnClass(filterType === "month")}>
            This Month
          </button>
          <button onClick={() => setFilterType("3months")} className={filterBtnClass(filterType === "3months")}>
            Last 3 Months
          </button>
          <button onClick={() => setFilterType("year")} className={filterBtnClass(filterType === "year")}>
            This Year
          </button>
          <button onClick={() => setFilterType("all")} className={filterBtnClass(filterType === "all")}>
            All Records
          </button>
          <button onClick={() => setFilterType("custom")} className={filterBtnClass(filterType === "custom")}>
            Custom Range
          </button>
        </div>

        {/* Custom Date Range */}
        {filterType === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                className={inputClass}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                className={inputClass}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="flex gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{count}</div>
            <div className="text-sm text-slate-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {slips.filter(s => s.status === "Completed").length}
            </div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {slips.filter(s => s.status === "Pending").length}
            </div>
            <div className="text-sm text-slate-500">Pending</div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            Showing {slips.length} records {filterType !== "all" ? `for ${getFilterText()}` : "from all time"}
          </span>
          {filterType !== "all" && (
            <button 
              onClick={() => setFilterType("all")}
              className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Slips Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Slips History
          </div>
          <button
            onClick={() => loadAll(page)}
            className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-right">W1</th>
                <th className="px-4 py-3 text-right">W2</th>
                <th className="px-4 py-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {slips.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">#{s.serialNo ?? s.serial_no ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {s.inDate ? String(s.inDate) : "-"} {s.inTime ? String(s.inTime) : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      s.status === "Completed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                    }`}>
                      {s.status || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.vehicleReg || "-"}</td>
                  <td className="px-4 py-3">{s.customerName || "-"}</td>
                  <td className="px-4 py-3">{s.materialName || "-"}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {Number(s.weight1 || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {Number(s.weight2 || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                    {Number(s.netWeight || 0).toLocaleString()}
                  </td>
                </tr>
              ))}

              {!loading && slips.length === 0 && (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-500 dark:text-slate-400" colSpan={9}>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">📋</span>
                      <p className="font-medium">No slips found</p>
                      <p className="text-sm mt-1">
                        {filterType === "all" 
                          ? "No records available in the system" 
                          : `No records found for ${getFilterText()}`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {slips.length} of {count} records • Page {page} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlipsHistory;