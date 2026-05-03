// src/pages/CreateSlipFixed.jsx - Full original structure with white screen fix
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const BRANCH_KEY = "current_branch_id";

const CreateSlipFixed = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const isAdmin = role === "Admin";

  // Tab State
  const [activeTab, setActiveTab] = useState("1st Weight");

  // Dropdown data
  const [activeMaterials, setActiveMaterials] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);

  // Lists
  const [recentSlips, setRecentSlips] = useState([]);
  const [pendingSlips, setPendingSlips] = useState([]);

  // Loading/errors
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Live Weight Simulation
  const [liveWeight, setLiveWeight] = useState(0);
  const [isAutoWeight, setIsAutoWeight] = useState(true);
  const [isWeightActive, setIsWeightActive] = useState(true);

  // UI constants
  const labelClass =
    "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";
  const inputClass =
    "w-full bg-blue-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-sm";

  // Helpers
  const strOrEmpty = (v) => (v === null || v === undefined ? "" : String(v));

  const numOr0 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const toISODateTime = (d, t) => {
    if (!d) return null;
    const time = t ? `${t}:00` : "00:00:00";
    return `${d}T${time}`;
  };

  const getBranchSelected = () => {
    const v = localStorage.getItem(BRANCH_KEY);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  // Forms
  const initialFirstForm = useMemo(
    () => ({
      serialNo: "",
      voucherNo: "",
      customerType: "Commercial",
      inDate: new Date().toISOString().slice(0, 10),
      inTime: new Date().toTimeString().slice(0, 5),
      vehicle: "",
      material: "",
      customer: "",
      partyName: "",
      supplierName: "",
      driver: "",
      phone: "",
      amount: "",
      paid: "No",
      packing: "",
      remarks: "",
      printType: "Win Print",
      weight1: "",
    }),
    []
  );

  const initialSecondForm = useMemo(
    () => ({
      slipId: null,
      serialNo: "",
      voucherNo: "",
      customerType: "Commercial",
      inDate: "",
      inTime: "",
      vehicleId: "",
      vehicleReg: "",
      materialId: "",
      materialName: "",
      customerId: "",
      customerName: "",
      partyName: "",
      supplierName: "",
      driver: "",
      phone: "",
      outDate: new Date().toISOString().slice(0, 10),
      outTime: new Date().toTimeString().slice(0, 5),
      amount: "",
      remarks: "",
      weight1: 0,
      weight2: "",
      netWeight: 0,
    }),
    []
  );

  const [firstWeightForm, setFirstWeightForm] = useState(initialFirstForm);
  const [secondWeightForm, setSecondWeightForm] = useState(initialSecondForm);

  // Fetch next serial number
  const getNextSerialNo = async () => {
    try {
      const response = await api.get('/slips/next_serial/');
      return response.data.serial_no;
    } catch (error) {
      return "Auto-generated";
    }
  };

  const resetFirstForm = async () => {
    const newSerialNo = await getNextSerialNo();
    setFirstWeightForm({
      ...initialFirstForm,
      serialNo: newSerialNo,
      inDate: new Date().toISOString().slice(0, 10),
      inTime: new Date().toTimeString().slice(0, 5),
    });
    setIsWeightActive(true);
  };

  const resetSecondForm = () => {
    setSecondWeightForm({
      ...initialSecondForm,
      outDate: new Date().toISOString().slice(0, 10),
      outTime: new Date().toTimeString().slice(0, 5),
    });
    setIsWeightActive(true);
  };

  // Load all data
  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const [mRes, cRes, vRes, rRes, pRes] = await Promise.all([
        api.get("/materials/", { params: { status: "Active" } }),
        api.get("/customers/"),
        api.get("/vehicles/"),
        api.get("/slips/recent/"),
        api.get("/slips/pending/"),
      ]);

      const mats = mRes?.data?.results || mRes?.data || [];
      const cust = cRes?.data?.results || cRes?.data || [];
      const vehs = vRes?.data?.results || vRes?.data || [];

      setActiveMaterials(Array.isArray(mats) ? mats : []);
      setActiveCustomers(Array.isArray(cust) ? cust : []);
      setActiveVehicles(Array.isArray(vehs) ? vehs : []);

      setRecentSlips(Array.isArray(rRes?.data) ? rRes.data : []);
      setPendingSlips(Array.isArray(pRes?.data) ? pRes.data : []);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  const reloadLists = async () => {
    try {
      const [rRes, pRes] = await Promise.all([api.get("/slips/recent/"), api.get("/slips/pending/")]);
      setRecentSlips(Array.isArray(rRes?.data) ? rRes.data : []);
      setPendingSlips(Array.isArray(pRes?.data) ? pRes.data : []);
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  useEffect(() => {
    loadAll();
    resetFirstForm();

    const onBranchChanged = () => {
      setErr("");
      resetFirstForm();
      resetSecondForm();
      setActiveTab("1st Weight");
      loadAll();
      setIsWeightActive(true);
    };

    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
  }, []);

  // Live weight simulation
  useEffect(() => {
    if (!isWeightActive) return;
    
    const interval = setInterval(() => {
      setLiveWeight(Math.floor(Math.random() * 500) + 40000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWeightActive]);

  useEffect(() => {
    if (!isAutoWeight) return;

    if (activeTab === "1st Weight") {
      setFirstWeightForm((p) => ({ ...p, weight1: liveWeight }));
    } else {
      setSecondWeightForm((p) => ({ ...p, weight2: liveWeight }));
      
      const w1 = Number(p.weight1 || 0);
      const w2 = Number(liveWeight || 0);
      if (w1 >= 0 && w2 >= 0) {
        setSecondWeightForm((prev) => ({ ...prev, netWeight: Math.abs(w2 - w1) }));
      }
    }
  }, [liveWeight, isAutoWeight, activeTab]);

  useEffect(() => {
    const w1 = Number(secondWeightForm.weight1 || 0);
    const w2 = Number(secondWeightForm.weight2 || 0);
    if (w1 >= 0 && w2 >= 0) {
      setSecondWeightForm((p) => ({ ...p, netWeight: Math.abs(w2 - w1) }));
    }
  }, [secondWeightForm.weight1, secondWeightForm.weight2]);

  // Auto-fill customer data
  useEffect(() => {
    const cid = firstWeightForm.customer;
    if (!cid) return;

    const c = activeCustomers.find((x) => String(x.id) === String(cid));
    if (!c) return;

    setFirstWeightForm((p) => ({
      ...p,
      phone: p.phone || strOrEmpty(c.phone),
      partyName: p.partyName || strOrEmpty(c.name),
    }));
  }, [firstWeightForm.customer, activeCustomers]);

  // Auto-fill vehicle data
  useEffect(() => {
    const vid = firstWeightForm.vehicle;
    if (!vid) return;

    const v = activeVehicles.find((x) => String(x.id) === String(vid));
    if (!v) return;

    setFirstWeightForm((p) => ({
      ...p,
      driver: p.driver || strOrEmpty(v.driver),
    }));
  }, [firstWeightForm.vehicle, activeVehicles]);

  // Submit First Weight
  const handleFirstWeightSubmit = async () => {
    setErr("");
    setIsWeightActive(false);

    const w1 = numOr0(firstWeightForm.weight1);
    if (w1 <= 0) {
      setIsWeightActive(true);
      return setErr("1st weight is required.");
    }
    if (!firstWeightForm.material) {
      setIsWeightActive(true);
      return setErr("Material is required.");
    }

    if (isAdmin) {
      const bid = getBranchSelected();
      if (!bid) {
        setIsWeightActive(true);
        return setErr("Please select a branch from header before creating a slip (Admin).");
      }
    }

    setSaving(true);
    try {
      const payload = {
        voucherNo: strOrEmpty(firstWeightForm.voucherNo),
        customerType: strOrEmpty(firstWeightForm.customerType),
        vehicle: firstWeightForm.vehicle ? Number(firstWeightForm.vehicle) : null,
        material: firstWeightForm.material ? Number(firstWeightForm.material) : null,
        customer: firstWeightForm.customer ? Number(firstWeightForm.customer) : null,
        partyName: strOrEmpty(firstWeightForm.partyName),
        supplierName: strOrEmpty(firstWeightForm.supplierName),
        driver: strOrEmpty(firstWeightForm.driver),
        phone: strOrEmpty(firstWeightForm.phone),
        amount: numOr0(firstWeightForm.amount),
        paid: strOrEmpty(firstWeightForm.paid) || "No",
        packing: strOrEmpty(firstWeightForm.packing),
        remarks: strOrEmpty(firstWeightForm.remarks),
        printType: strOrEmpty(firstWeightForm.printType) || "Win Print",
        in_at: toISODateTime(firstWeightForm.inDate, firstWeightForm.inTime),
        weight1: w1,
      };

      await api.post("/slips/first_weight/", payload);
      resetFirstForm();
      await reloadLists();
    } catch (e) {
      setErr(extractErr(e));
      setIsWeightActive(true);
    } finally {
      setSaving(false);
    }
  };

  // Submit Second Weight
  const handleSecondWeightSubmit = async () => {
    setErr("");
    setIsWeightActive(false);

    if (!secondWeightForm.slipId) {
      setIsWeightActive(true);
      return setErr("Please enter a valid pending Serial No first.");
    }

    const w2 = numOr0(secondWeightForm.weight2);
    if (w2 <= 0) {
      setIsWeightActive(true);
      return setErr("2nd weight is required.");
    }

    setSaving(true);
    try {
      const payload = {
        weight2: w2,
        out_at: toISODateTime(secondWeightForm.outDate, secondWeightForm.outTime),
        remarks: strOrEmpty(secondWeightForm.remarks),
        amount: numOr0(secondWeightForm.amount),
      };

      await api.post(`/slips/${secondWeightForm.slipId}/second_weight/`, payload);
      resetSecondForm();
      await reloadLists();
    } catch (e) {
      setErr(extractErr(e));
      setIsWeightActive(true);
    } finally {
      setSaving(false);
    }
  };

  const loadPendingSlip = (slip) => {
    setSecondWeightForm((p) => ({
      ...p,
      slipId: slip.id,
      serialNo: String(slip.serialNo || ""),
      voucherNo: slip.voucherNo || "",
      customerType: slip.customerType || "Commercial",
      inDate: slip.inDate || "",
      inTime: slip.inTime || "",
      vehicleId: slip.vehicleId || "",
      vehicleReg: slip.vehicleReg || "",
      materialId: slip.materialId || "",
      materialName: slip.materialName || "",
      customerId: slip.customerId || "",
      customerName: slip.customerName || "",
      partyName: slip.partyName || "",
      supplierName: slip.supplierName || "",
      driver: slip.driver || "",
      phone: slip.phone || "",
      amount: slip.amount || "",
      remarks: slip.remarks || "",
      weight1: slip.weight1 || 0,
    }));
    setActiveTab("2nd Weight");
  };

  // UI
  return (
    <div className="flex flex-col gap-4">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("1st Weight")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "1st Weight"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            1st Weight (Inbound)
          </button>
          <button
            onClick={() => setActiveTab("2nd Weight")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "2nd Weight"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            2nd Weight (Outbound)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-success uppercase tracking-wider">
            {loading ? "Loading..." : "Connected"}
          </span>
          <button
            onClick={loadAll}
            className="ml-3 px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN: FORMS */}
        <div className="flex-1">
          {/* 1ST WEIGHT FORM - COMPLETE ORIGINAL STRUCTURE */}
          {activeTab === "1st Weight" && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[700px]">
              <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
                <span className="material-icons-outlined">input</span>
                First Weight Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className={labelClass}>Serial No</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.serialNo)}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Customer Type</label>
                  <select
                    value={strOrEmpty(firstWeightForm.customerType)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, customerType: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Company">Company</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Voucher No</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.voucherNo)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, voucherNo: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className={labelClass}>IN Date / Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={strOrEmpty(firstWeightForm.inDate)}
                      onChange={(e) =>
                        setFirstWeightForm((p) => ({ ...p, inDate: e.target.value }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="time"
                      value={strOrEmpty(firstWeightForm.inTime)}
                      onChange={(e) =>
                        setFirstWeightForm((p) => ({ ...p, inTime: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Vehicle</label>
                  <select
                    className={inputClass}
                    value={strOrEmpty(firstWeightForm.vehicle)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, vehicle: e.target.value }))
                    }
                  >
                    <option value="">Select Vehicle</option>
                    {activeVehicles.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.reg} {v.driver ? `(${v.driver})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Material / Product *</label>
                  <select
                    className={inputClass}
                    value={strOrEmpty(firstWeightForm.material)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, material: e.target.value }))
                    }
                  >
                    <option value="">Select Material</option>
                    {activeMaterials.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Customer (optional)</label>
                  <select
                    className={inputClass}
                    value={strOrEmpty(firstWeightForm.customer)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, customer: e.target.value }))
                    }
                  >
                    <option value="">Select Customer</option>
                    {activeCustomers.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.code ? `${c.code} - ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Party Name</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.partyName)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, partyName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Supplier Name</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.supplierName)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, supplierName: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Driver Name</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.driver)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, driver: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone No</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.phone)}
                    readOnly
                    className={`${inputClass} bg-slate-50 dark:bg-slate-900`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Charges Amount</label>
                  <input
                    type="number"
                    value={strOrEmpty(firstWeightForm.amount)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Paid?</label>
                  <select
                    className={inputClass}
                    value={strOrEmpty(firstWeightForm.paid)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, paid: e.target.value }))
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Packing / Bags</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.packing)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, packing: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Remarks</label>
                  <input
                    type="text"
                    value={strOrEmpty(firstWeightForm.remarks)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, remarks: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className={`${labelClass} text-lg !text-primary mb-2 block`}>Weights</label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className={labelClass}>1st Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={strOrEmpty(firstWeightForm.weight1)}
                        readOnly={isAutoWeight}
                        onChange={(e) =>
                          setFirstWeightForm((p) => ({ ...p, weight1: e.target.value }))
                        }
                        className="w-full text-xl font-mono font-bold text-center py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:border-primary outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        KG
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className={labelClass}>2nd Weight</label>
                    <div className="text-xl font-mono font-bold text-slate-400 dark:text-slate-500 text-center py-2">
                      --
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <label className={`${labelClass} text-primary`}>Net Weight</label>
                    <div className="text-2xl font-mono font-bold text-primary text-center py-2">
                      {Math.abs(Number(firstWeightForm.weight1 || 0) - 0).toLocaleString()} kg
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAutoWeight(false)}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg uppercase ${
                      !isAutoWeight
                        ? "bg-slate-700 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200"
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setIsAutoWeight(true)}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg uppercase ${
                      isAutoWeight
                        ? "bg-primary text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-200"
                    }`}
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="print"
                      checked={firstWeightForm.printType === "DOS Print"}
                      onChange={() =>
                        setFirstWeightForm((p) => ({ ...p, printType: "DOS Print" }))
                      }
                      className="accent-primary"
                    />
                    <span className="text-sm font-bold">DOS Print</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="print"
                      checked={firstWeightForm.printType === "Win Print"}
                      onChange={() =>
                        setFirstWeightForm((p) => ({ ...p, printType: "Win Print" }))
                      }
                      className="accent-primary"
                    />
                    <span className="text-sm font-bold">Win Print</span>
                  </label>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    disabled={saving}
                    onClick={handleFirstWeightSubmit}
                    className="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors disabled:opacity-70"
                  >
                    {saving ? "Saving..." : "Save Slip"}
                  </button>

                  <button
                    disabled={saving}
                    onClick={resetFirstForm}
                    className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-70"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2ND WEIGHT FORM - COMPLETE ORIGINAL STRUCTURE */}
          {activeTab === "2nd Weight" && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[700px]">
              <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
                <span className="material-icons-outlined">output</span>
                Second Weight Entry
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className={labelClass}>Serial No</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.serialNo)}
                    onChange={(e) =>
                      setSecondWeightForm((p) => ({ ...p, serialNo: e.target.value }))
                    }
                    className={inputClass}
                    placeholder="Enter pending serial number"
                  />
                </div>

                <div>
                  <label className={labelClass}>OUT Date / Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={strOrEmpty(secondWeightForm.outDate)}
                      onChange={(e) =>
                        setSecondWeightForm((p) => ({ ...p, outDate: e.target.value }))
                      }
                      className={inputClass}
                    />
                    <input
                      type="time"
                      value={strOrEmpty(secondWeightForm.outTime)}
                      onChange={(e) =>
                        setSecondWeightForm((p) => ({ ...p, outTime: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Vehicle</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.vehicleReg || "")}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Material</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.materialName || "")}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Party</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.partyName || "")}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.phone || "")}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Charges Amount</label>
                  <input
                    type="number"
                    value={strOrEmpty(secondWeightForm.amount)}
                    onChange={(e) =>
                      setSecondWeightForm((p) => ({ ...p, amount: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Remarks</label>
                  <input
                    type="text"
                    value={strOrEmpty(secondWeightForm.remarks)}
                    onChange={(e) =>
                      setSecondWeightForm((p) => ({ ...p, remarks: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <label className={labelClass}>1st Weight</label>
                  <div className="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">
                    {Number(secondWeightForm.weight1 || 0).toLocaleString()} kg
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 relative">
                  <label className={`${labelClass} flex justify-between`}>
                    2nd Weight
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsAutoWeight(false)}
                        className={`px-1 py-0.5 text-[10px] rounded ${
                          !isAutoWeight
                            ? "bg-slate-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        MAN
                      </button>
                      <button
                        onClick={() => setIsAutoWeight(true)}
                        className={`px-1 py-0.5 text-[10px] rounded ${
                          isAutoWeight
                            ? "bg-primary text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        AUTO
                      </button>
                    </div>
                  </label>
                  <input
                    type="number"
                    value={strOrEmpty(secondWeightForm.weight2)}
                    readOnly={isAutoWeight}
                    onChange={(e) => {
                      const newWeight2 = e.target.value;
                      setSecondWeightForm((p) => ({ ...p, weight2: newWeight2 }));
                      
                      const w1 = Number(p.weight1 || 0);
                      const w2 = Number(newWeight2 || 0);
                      if (w1 >= 0 && w2 >= 0) {
                        setSecondWeightForm((prev) => ({ ...prev, netWeight: Math.abs(w2 - w1) }));
                      }
                    }}
                    className="w-full bg-transparent text-xl font-mono font-bold text-dark dark:text-white outline-none border-b border-primary"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <label className={`${labelClass} text-primary`}>Net Weight</label>
                  <div className="text-2xl font-mono font-bold text-primary">
                    {Number(secondWeightForm.netWeight || 0).toLocaleString()} kg
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  disabled={saving}
                  onClick={handleSecondWeightSubmit}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
                >
                  <span className="material-icons-outlined">check_circle</span>
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  disabled={saving}
                  onClick={resetSecondForm}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-70"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE INDICATOR */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl p-8 shadow-xl border-4 border-slate-700 relative overflow-hidden min-h-[220px] flex flex-col justify-center">
            <div className="text-center mb-2">
              <span className="text-red-500 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
                Live Weight
              </span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-6xl lg:text-7xl font-mono font-black text-success tracking-tight text-center">
                {liveWeight.toLocaleString()}
              </div>
              <div className="text-center text-slate-500 text-sm font-bold mt-2">kg</div>
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>Scale ID: #01</span>
              <span className="text-success">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Slips */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mt-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-200 uppercase tracking-wider">
          Recent Slips History
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Serial</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3 text-right">W1</th>
                <th className="px-4 py-3 text-right">W2</th>
                <th className="px-4 py-3 text-right">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentSlips.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold">{s.serialNo}</td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3">{s.vehicleReg}</td>
                  <td className="px-4 py-3">{s.materialName}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Number(s.weight1 || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Number(s.weight2 || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                    {Number(s.netWeight || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && recentSlips.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                    No recent slips.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Slips */}
      {activeTab === "2nd Weight" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
              Pending Slips
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Serial</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3 text-right">1st Weight</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pendingSlips.map((p) => (
                  <tr key={p.id} className="hover:bg-primary/5 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">#{p.serialNo}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {p.vehicleReg}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.materialName}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                      {Number(p.weight1 || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => loadPendingSlip(p)}
                        className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover font-semibold transition-colors"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && pendingSlips.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>
                      No pending slips.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSlipFixed;