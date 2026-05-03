// src/pages/CreateSlipMinimal.jsx - Ultra-minimal version to eliminate white screen
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const CreateSlipMinimal = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("1st Weight");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [firstWeightForm, setFirstWeightForm] = useState({
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
  });

  const [secondWeightForm, setSecondWeightForm] = useState({
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
  });

  // Dropdown data
  const [activeMaterials, setActiveMaterials] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [pendingSlips, setPendingSlips] = useState([]);

  // UI constants
  const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";
  const inputClass = "w-full bg-blue-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-sm";

  // Helpers
  const strOrEmpty = (v) => (v === null || v === undefined ? "" : String(v));
  const numOr0 = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Load all data
  const loadAll = async () => {
    setErr("");
    setLoading(true);
    try {
      const [mRes, cRes, vRes, pRes] = await Promise.all([
        api.get("/materials/", { params: { status: "Active" } }),
        api.get("/customers/"),
        api.get("/vehicles/"),
        api.get("/slips/pending/"),
      ]);

      const mats = mRes?.data?.results || mRes?.data || [];
      const cust = cRes?.data?.results || cRes?.data || [];
      const vehs = vRes?.data?.results || vRes?.data || [];

      setActiveMaterials(Array.isArray(mats) ? mats : []);
      setActiveCustomers(Array.isArray(cust) ? cust : []);
      setActiveVehicles(Array.isArray(vehs) ? vehs : []);
      setPendingSlips(Array.isArray(pRes?.data) ? pRes.data : []);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  // Get next serial number
  const getNextSerialNo = async () => {
    try {
      const response = await api.get('/slips/next_serial/');
      return response.data.serial_no;
    } catch (error) {
      return "Auto-generated";
    }
  };

  // Reset forms
  const resetFirstForm = async () => {
    const newSerialNo = await getNextSerialNo();
    setFirstWeightForm({
      serialNo: newSerialNo,
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
    });
  };

  const resetSecondForm = () => {
    setSecondWeightForm({
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
    });
  };

  // Load pending slip
  const loadPendingSlip = (slip) => {
    setSecondWeightForm({
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
      outDate: new Date().toISOString().slice(0, 10),
      outTime: new Date().toTimeString().slice(0, 5),
      weight2: "",
      netWeight: 0,
    });
    setActiveTab("2nd Weight");
  };

  // Initialize
  useEffect(() => {
    loadAll();
    resetFirstForm();

    const onBranchChanged = () => {
      setErr("");
      resetFirstForm();
      resetSecondForm();
      setActiveTab("1st Weight");
      loadAll();
    };

    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
  }, []);

  // Submit handlers
  const handleFirstWeightSubmit = async () => {
    setErr("");
    const w1 = numOr0(firstWeightForm.weight1);
    if (w1 <= 0) return setErr("1st weight is required.");
    if (!firstWeightForm.material) return setErr("Material is required.");

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
        in_at: `${firstWeightForm.inDate}T${firstWeightForm.inTime}:00`,
        weight1: w1,
      };

      await api.post("/slips/first_weight/", payload);
      resetFirstForm();
      await loadAll();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const handleSecondWeightSubmit = async () => {
    setErr("");
    if (!secondWeightForm.slipId) return setErr("Please enter a valid pending Serial No first.");
    const w2 = numOr0(secondWeightForm.weight2);
    if (w2 <= 0) return setErr("2nd weight is required.");

    setSaving(true);
    try {
      const payload = {
        weight2: w2,
        out_at: `${secondWeightForm.outDate}T${secondWeightForm.outTime}:00`,
        remarks: strOrEmpty(secondWeightForm.remarks),
        amount: numOr0(secondWeightForm.amount),
      };

      await api.post(`/slips/${secondWeightForm.slipId}/second_weight/`, payload);
      resetSecondForm();
      await loadAll();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

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
          {/* 1ST WEIGHT FORM */}
          {activeTab === "1st Weight" && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[700px]">
              <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
                <span>📝</span>
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
                  <label className={labelClass}>Material *</label>
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
                  <label className={labelClass}>Weight 1</label>
                  <input
                    type="number"
                    value={strOrEmpty(firstWeightForm.weight1)}
                    onChange={(e) =>
                      setFirstWeightForm((p) => ({ ...p, weight1: e.target.value }))
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

              <div className="mt-8 flex justify-end gap-3">
                <button
                  disabled={saving}
                  onClick={handleFirstWeightSubmit}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Slip"}
                </button>
                <button
                  disabled={saving}
                  onClick={resetFirstForm}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-70"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* 2ND WEIGHT FORM - MINIMAL AND SAFE */}
          {activeTab === "2nd Weight" && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[700px]">
              <h2 className="text-lg font-bold mb-4 text-primary flex items-center gap-2">
                <span>✅</span>
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
                  <label className={labelClass}>Weight 2</label>
                  <input
                    type="number"
                    value={strOrEmpty(secondWeightForm.weight2)}
                    onChange={(e) => {
                      const newWeight2 = e.target.value;
                      setSecondWeightForm((p) => ({ ...p, weight2: newWeight2 }));
                      // Calculate net weight
                      const w1 = Number(p.weight1 || 0);
                      const w2 = Number(newWeight2 || 0);
                      if (w1 >= 0 && w2 >= 0) {
                        setSecondWeightForm((prev) => ({ ...prev, netWeight: Math.abs(w2 - w1) }));
                      }
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>1st Weight</label>
                  <input
                    type="text"
                    value={Number(secondWeightForm.weight1 || 0).toLocaleString() + " kg"}
                    readOnly
                    className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Net Weight</label>
                  <input
                    type="text"
                    value={Number(secondWeightForm.netWeight || 0).toLocaleString() + " kg"}
                    readOnly
                    className={`${inputClass} bg-blue-50 dark:bg-blue-900/20 text-primary font-bold`}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  disabled={saving}
                  onClick={handleSecondWeightSubmit}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Complete Slip"}
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

        {/* RIGHT COLUMN: PENDING SLIPS */}
        <div className="w-full lg:w-80">
          {activeTab === "2nd Weight" && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                  Pending Slips
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3">Serial</th>
                      <th className="px-4 py-3">Vehicle</th>
                      <th className="px-4 py-3 text-right">W1</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {pendingSlips.map((p) => (
                      <tr key={p.id} className="hover:bg-primary/5 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">#{p.serialNo}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {p.vehicleReg}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                          {Number(p.weight1 || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => loadPendingSlip(p)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary-hover font-semibold transition-colors"
                          >
                            Load
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && pendingSlips.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-slate-500 dark:text-slate-400" colSpan={4}>
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
      </div>
    </div>
  );
};

export default CreateSlipMinimal;