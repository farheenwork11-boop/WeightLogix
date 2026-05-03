// src/pages/CreateSlip.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const BRANCH_KEY = "current_branch_id";

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const dispPrint = (v) => {
  const t = String(v ?? "").trim();
  if (!t || t === "__") return "—";
  return t;
};

/** Full HTML document for browser print — A4-oriented, print-safe colors */
function buildWeightSlipPrintHtml(d) {
  const e = escapeHtml;
  const D = (v) => e(dispPrint(v));
  const w = (n) => Number(n || 0).toLocaleString();
  const qr = e(d.qrUrl || "");
  const printMode = D(d.printType);
  const genDate = e(
    new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
  );
  const genTime = e(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Weighbridge Slip · ${D(d.serialNo)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --ink: #0c1222;
      --muted: #5c6578;
      --line: #d8dee9;
      --paper: #fbfcfe;
      --accent: #1e40af;
      --accent-soft: #e8eefc;
      --accent-2: #0f766e;
      --radius: 12px;
    }
    * { box-sizing: border-box; }
    @page { size: A4; margin: 14mm; }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: "DM Sans", system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 11.5px;
      line-height: 1.45;
      color: var(--ink);
      background: #e8ecf4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 190mm;
      margin: 0 auto;
      padding: 18px 20px 24px;
    }
    .frame {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: 0 24px 48px rgba(12, 18, 34, 0.12);
    }
    .accent-bar {
      height: 4px;
      background: linear-gradient(90deg, var(--accent) 0%, #3b82f6 45%, var(--accent-2) 100%);
    }
    .head {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: start;
      padding: 20px 22px 16px;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, #fff 0%, #f6f8fc 100%);
    }
    .doc-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--accent);
      background: var(--accent-soft);
      border: 1px solid #c7d4f0;
      border-radius: 999px;
      padding: 5px 12px;
      margin-bottom: 8px;
    }
    .co-name {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--ink);
      line-height: 1.15;
    }
    .co-meta {
      margin: 8px 0 0;
      font-size: 11px;
      color: var(--muted);
      max-width: 52ch;
    }
    .qr-wrap {
      width: 92px;
      height: 92px;
      padding: 6px;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px;
      flex-shrink: 0;
    }
    .qr-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .print-chip {
      margin-top: 10px;
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .print-chip strong { color: var(--ink); font-weight: 800; }
    .strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      padding: 14px 22px;
      background: #f1f4f9;
      border-bottom: 1px solid var(--line);
    }
    .chip {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
    }
    .chip .lab {
      display: block;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
      margin-bottom: 4px;
    }
    .chip .val {
      font-size: 14px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }
    .section {
      padding: 16px 22px;
    }
    .section + .section { border-top: 1px solid var(--line); }
    .sec-title {
      margin: 0 0 12px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 28px;
    }
    .row {
      display: flex;
      gap: 10px;
      padding: 7px 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .row .k {
      flex: 0 0 110px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
    }
    .row .v {
      flex: 1;
      font-size: 12px;
      font-weight: 600;
      word-break: break-word;
    }
    .timeline {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 4px;
    }
    .tl-card {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      background: #fff;
    }
    .tl-card .lab { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }
    .tl-card .val { font-size: 13px; font-weight: 700; margin-top: 4px; font-variant-numeric: tabular-nums; }
    .weights {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 4px;
    }
    .w-card {
      text-align: center;
      border-radius: 12px;
      padding: 16px 12px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, #fff, #f8fafc);
    }
    .w-card.net {
      border-color: #93c5fd;
      background: linear-gradient(180deg, #eff6ff, #dbeafe);
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.15);
    }
    .w-card .wl { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
    .w-card .wn {
      margin-top: 8px;
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      font-size: 26px;
      font-weight: 700;
      line-height: 1;
      color: var(--ink);
    }
    .w-card.net .wn { color: var(--accent); font-size: 30px; }
    .w-card .wu { font-size: 11px; font-weight: 700; color: var(--muted); margin-top: 6px; }
    .remarks {
      margin-top: 14px;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px dashed var(--line);
      background: #fafbfc;
      font-size: 11px;
      color: var(--muted);
    }
    .remarks strong { color: var(--ink); }
    .foot {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      padding: 18px 22px 22px;
      border-top: 1px solid var(--line);
      background: #f8fafc;
    }
    .foot-note {
      font-size: 10px;
      color: var(--muted);
      max-width: 280px;
      line-height: 1.5;
    }
    .sign {
      text-align: center;
      min-width: 200px;
    }
    .sign .line {
      border-top: 1px solid var(--ink);
      margin-top: 36px;
      padding-top: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .sign.weigh .line { margin-top: 28px; }
    @media print {
      body { background: #fff; }
      .page { padding: 0; max-width: none; }
      .frame { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="frame">
      <div class="accent-bar"></div>
      <header class="head">
        <div>
          <div class="doc-badge">Official · Weighbridge slip</div>
          <h1 class="co-name">${D(d.companyName)}</h1>
          <p class="co-meta">${D(d.companyAddress)}<br/>${D(d.companyContact)}</p>
          <div class="print-chip">Print mode · <strong>${printMode}</strong></div>
        </div>
        <div>
          <div class="qr-wrap">
            <img src="${qr}" alt="Verification QR" crossorigin="anonymous"/>
          </div>
        </div>
      </header>

      <div class="strip">
        <div class="chip"><span class="lab">Serial no.</span><span class="val">${D(d.serialNo)}</span></div>
        <div class="chip"><span class="lab">Voucher</span><span class="val">${D(d.voucherNo)}</span></div>
        <div class="chip"><span class="lab">Printed date</span><span class="val">${genDate}</span></div>
        <div class="chip"><span class="lab">Printed time</span><span class="val">${genTime}</span></div>
      </div>

      <div class="section">
        <h2 class="sec-title">Weighing schedule</h2>
        <div class="timeline">
          <div class="tl-card">
            <div class="lab">First weight (in)</div>
            <div class="val">${D(d.inDate)} &nbsp;·&nbsp; ${D(d.inTime)}</div>
          </div>
          <div class="tl-card">
            <div class="lab">Second weight (out)</div>
            <div class="val">${D(d.outDate)} &nbsp;·&nbsp; ${D(d.outTime)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="sec-title">Transaction details</h2>
        <div class="grid-2">
          <div class="row"><span class="k">Customer type</span><span class="v">${D(d.customerType)}</span></div>
          <div class="row"><span class="k">Vehicle</span><span class="v">${D(d.vehicleReg)}</span></div>
          <div class="row"><span class="k">Material</span><span class="v">${D(d.materialName)}</span></div>
          <div class="row"><span class="k">Driver</span><span class="v">${D(d.driver)}</span></div>
          <div class="row"><span class="k">Phone</span><span class="v">${D(d.phone)}</span></div>
          <div class="row"><span class="k">Customer</span><span class="v">${D(d.customerName)}</span></div>
          <div class="row"><span class="k">Party</span><span class="v">${D(d.partyName)}</span></div>
          <div class="row"><span class="k">Supplier</span><span class="v">${D(d.supplierName)}</span></div>
          <div class="row"><span class="k">Charges</span><span class="v">${D(d.amount)}</span></div>
        </div>
        <div class="remarks"><strong>Remarks</strong> — ${D(d.remarks)}</div>
      </div>

      <div class="section">
        <h2 class="sec-title">Weight summary</h2>
        <div class="weights">
          <div class="w-card">
            <div class="wl">1st weight</div>
            <div class="wn">${w(d.weight1)}</div>
            <div class="wu">kg</div>
          </div>
          <div class="w-card">
            <div class="wl">2nd weight</div>
            <div class="wn">${w(d.weight2)}</div>
            <div class="wu">kg</div>
          </div>
          <div class="w-card net">
            <div class="wl">Net weight</div>
            <div class="wn">${w(d.netWeight)}</div>
            <div class="wu">kg</div>
          </div>
        </div>
      </div>

      <footer class="foot">
        <p class="foot-note">This document was generated electronically. Please verify weight and party details before dispatch. Discrepancies must be reported immediately at the weighbridge.</p>
        <div class="sign">
          <div class="line">Operator / Authorized signatory</div>
        </div>
        <div class="sign weigh">
          <div class="line">Weighbridge stamp</div>
        </div>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

function printWhenImagesReady(printWindow) {
  const runPrint = () => {
    try {
      printWindow.focus();
      printWindow.print();
    } finally {
      printWindow.close();
    }
  };

  const doc = printWindow.document;
  const imgs = [...doc.images];
  if (imgs.length === 0) {
    runPrint();
    return;
  }
  let left = imgs.length;
  const done = () => {
    left -= 1;
    if (left <= 0) runPrint();
  };
  imgs.forEach((img) => {
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });
}

const CreateSlip = () => {
  const { user } = useAuth();
  const role = user?.role || "Operator";
  const isAdmin = role === "Admin";
  const userBranchId = Number(user?.branch_id);

  // -------------------------
  // Tab State
  // -------------------------
  const [activeTab, setActiveTab] = useState("1st Weight");

  // -------------------------
  // Dropdown data
  // -------------------------
  const [activeMaterials, setActiveMaterials] = useState([]);
  const [activeCustomers, setActiveCustomers] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [companyProfile, setCompanyProfile] = useState({
    name: "WEIGHTLOGIX",
    address: "",
    contact_number: "",
  });

  // -------------------------
  // Lists
  // -------------------------
  const [recentSlips, setRecentSlips] = useState([]);
  const [pendingSlips, setPendingSlips] = useState([]);

  // -------------------------
  // Loading/errors
  // -------------------------
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serialLoading, setSerialLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [err, setErr] = useState("");
  const [completedSlip, setCompletedSlip] = useState(null);
  const [iotDevices, setIotDevices] = useState([]);
  const [iotMode, setIotMode] = useState("simulation");
  const [iotError, setIotError] = useState("");

  // Live Weight Simulation
  const [liveWeight, setLiveWeight] = useState(0);
  const [isAutoWeight, setIsAutoWeight] = useState(true);
  const [isWeightActive, setIsWeightActive] = useState(true); // New state to control weight simulation
  const selectedIndicator = useMemo(
    () =>
      iotDevices.find((d) =>
        ["Weight Indicator", "Indicator + Printer"].includes(String(d?.device_type || ""))
      ) || null,
    [iotDevices]
  );
  const selectedPrinter = useMemo(
    () =>
      iotDevices.find((d) =>
        ["Thermal Printer", "Indicator + Printer"].includes(String(d?.device_type || ""))
      ) || null,
    [iotDevices]
  );

  // -------------------------
  // UI constants
  // -------------------------
  const labelClass =
    "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";
  const inputClass =
    "w-full bg-blue-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all backdrop-blur-sm";

  // -------------------------
  // Helpers
  // -------------------------
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

  const ensureBranchSelected = async () => {
    // Operator must use assigned branch.
    if (role === "Operator") {
      if (Number.isFinite(userBranchId) && userBranchId > 0) {
        localStorage.setItem(BRANCH_KEY, String(userBranchId));
        return userBranchId;
      }
      return null;
    }

    const existing = getBranchSelected();
    if (existing) return existing;

    try {
      const res = await api.get("/branches/");
      const branches = res?.data?.results || res?.data || [];
      const firstBranchId = Number(branches?.[0]?.id);
      if (Number.isFinite(firstBranchId) && firstBranchId > 0) {
        localStorage.setItem(BRANCH_KEY, String(firstBranchId));
        window.dispatchEvent(new Event("branch-changed"));
        return firstBranchId;
      }
    } catch {
      // no-op: validation message will be shown by caller
    }
    return null;
  };

  // -------------------------
  // Forms
  // -------------------------
  const initialFirstForm = useMemo(
    () => ({
      serialNo: "",
      voucherNo: "",
      customerType: "Commercial",
      inDate: new Date().toISOString().slice(0, 10),
      inTime: new Date().toTimeString().slice(0, 5),

      // keep selects as "" (string)
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
      
      printType: "DOS Print", // Default print type
    }),
    []
  );

  const [firstWeightForm, setFirstWeightForm] = useState(initialFirstForm);
  const [secondWeightForm, setSecondWeightForm] = useState(initialSecondForm);

  const printSlipData = useMemo(
    () => ({
      companyName: strOrEmpty(companyProfile.name || "WEIGHTLOGIX"),
      companyAddress: strOrEmpty(companyProfile.address || "Address not configured"),
      companyContact: strOrEmpty(companyProfile.contact_number || "Contact not configured"),
      serialNo: strOrEmpty(secondWeightForm.serialNo || firstWeightForm.serialNo || "__"),
      voucherNo: strOrEmpty(secondWeightForm.voucherNo || firstWeightForm.voucherNo || "__"),
      vehicleReg: strOrEmpty(secondWeightForm.vehicleReg || "__"),
      materialName: strOrEmpty(secondWeightForm.materialName || "__"),
      customerName: strOrEmpty(secondWeightForm.customerName || "__"),
      partyName: strOrEmpty(secondWeightForm.partyName || firstWeightForm.partyName || "__"),
      supplierName: strOrEmpty(secondWeightForm.supplierName || firstWeightForm.supplierName || "__"),
      driver: strOrEmpty(secondWeightForm.driver || firstWeightForm.driver || "__"),
      phone: strOrEmpty(secondWeightForm.phone || firstWeightForm.phone || "__"),
      amount: strOrEmpty(secondWeightForm.amount || firstWeightForm.amount || "__"),
      remarks: strOrEmpty(secondWeightForm.remarks || firstWeightForm.remarks || "__"),
      weight1: Number(secondWeightForm.weight1 || firstWeightForm.weight1 || 0),
      weight2: Number(secondWeightForm.weight2 || 0),
      netWeight: Number(secondWeightForm.netWeight || 0),
      printType: strOrEmpty(secondWeightForm.printType || firstWeightForm.printType || "Win Print"),
      qrUrl:
        "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" +
        encodeURIComponent("https://weightlogix.com"),
    }),
    [companyProfile, firstWeightForm, secondWeightForm]
  );

  // Fetch next serial number for the form
  const getNextSerialNo = async () => {
    const selectedBranch = await ensureBranchSelected();
    if (!selectedBranch) return "";

    setSerialLoading(true);
    try {
      const response = await api.get("/slips/next_serial/");
      const apiSerial =
        response?.data?.serial_no ??
        response?.data?.serialNo ??
        response?.data?.next_serial;

      if (Number.isFinite(Number(apiSerial)) && Number(apiSerial) > 0) {
        return String(Number(apiSerial));
      }

      throw new Error("Invalid serial response from server.");
    } catch {
      // Fallback: derive next serial from already-loaded list when API temporarily fails
      const maxRecentSerial = recentSlips.reduce((mx, s) => {
        const n = Number(s?.serialNo);
        return Number.isFinite(n) && n > mx ? n : mx;
      }, 0);
      if (maxRecentSerial > 0) return String(maxRecentSerial + 1);

      setErr((prev) => prev || "Unable to fetch next serial number right now.");
      return "";
    } finally {
      setSerialLoading(false);
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
    // Re-enable weight simulation when resetting
    setIsWeightActive(true);
    setSuccessMsg("");
    setCompletedSlip(null);
  };

  const resetSecondForm = () => {
    setSecondWeightForm({
      ...initialSecondForm,
      outDate: new Date().toISOString().slice(0, 10),
      outTime: new Date().toTimeString().slice(0, 5),
    });
    // Re-enable weight simulation when resetting
    setIsWeightActive(true);
    setCompletedSlip(null);
  };

  // -------------------------
  // Load dropdowns + lists
  // -------------------------
  const loadAll = async () => {
    setErr("");
    setSuccessMsg("");
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

      try {
        const companyRes = await api.get("/companies/me/");
        const c = companyRes?.data || {};
        setCompanyProfile({
          name: strOrEmpty(c.name || user?.company || "WEIGHTLOGIX"),
          address: strOrEmpty(c.address),
          contact_number: strOrEmpty(c.contact_number),
        });
      } catch {
        setCompanyProfile((prev) => ({
          ...prev,
          name: strOrEmpty(user?.company || prev.name || "WEIGHTLOGIX"),
        }));
      }
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

  const loadIoTDevices = async () => {
    try {
      const dRes = await api.get("/devices/");
      const list = dRes?.data?.results || dRes?.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setIotDevices(safeList);
      const hasIndicator = safeList.some((d) =>
        ["Weight Indicator", "Indicator + Printer"].includes(String(d?.device_type || ""))
      );
      setIotMode(hasIndicator ? "iot" : "simulation");
      setIotError("");
    } catch (e) {
      setIotDevices([]);
      setIotMode("simulation");
      setIotError(extractErr(e) || "Unable to load IoT devices.");
    }
  };

  const handleRefreshData = async () => {
    await Promise.all([loadAll(), loadIoTDevices()]);
  };

  const startNewSlipProcess = async () => {
    setCompletedSlip(null);
    setSuccessMsg("");
    setErr("");
    resetSecondForm();
    setActiveTab("1st Weight");
    await resetFirstForm();
    setIsAutoWeight(true);
    setIsWeightActive(true);
  };

  useEffect(() => {
    const onBranchChanged = () => {
      setErr("");
      resetFirstForm();
      resetSecondForm();
      setActiveTab("1st Weight");
      handleRefreshData();
      // Re-enable weight simulation when branch changes
      setIsWeightActive(true);
    };

    window.addEventListener("branch-changed", onBranchChanged);
    return () => window.removeEventListener("branch-changed", onBranchChanged);
  }, []);

  // Keep branch key aligned for operator and initialize page only after user is available.
  useEffect(() => {
    if (!user?.id) return;

    if (role === "Operator" && Number.isFinite(userBranchId) && userBranchId > 0) {
      localStorage.setItem(BRANCH_KEY, String(userBranchId));
    }

    const initialize = async () => {
      await ensureBranchSelected();
      await loadAll();
      await loadIoTDevices();
      await resetFirstForm();
      setIsWeightActive(true);
      setIsAutoWeight(true);
    };

    initialize();
  }, [user?.id, role, userBranchId]);

  // -------------------------
  // Live weight from IoT device
  // -------------------------
  useEffect(() => {
    if (!isWeightActive || !isAutoWeight) return;
    if (iotMode !== "iot" || !selectedIndicator?.code) return;

    let stopped = false;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/devices/${encodeURIComponent(selectedIndicator.code)}/read_weight/`);
        const weight = Number(res?.data?.weight);
        if (!stopped && Number.isFinite(weight) && weight >= 0) {
          setLiveWeight(Math.round(weight));
          setIotError("");
        }
      } catch {
        if (!stopped) {
          setIotMode("simulation");
          setIotError("IoT live feed is unavailable. Running in simulation mode.");
        }
      }
    }, 1500);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [isWeightActive, isAutoWeight, iotMode, selectedIndicator?.code]);

  // -------------------------
  // Simulation fallback mode
  // -------------------------
  useEffect(() => {
    if (!isWeightActive) return;
    if (iotMode === "iot") return;

    const interval = setInterval(() => {
      setLiveWeight(Math.floor(Math.random() * 500) + 40000);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWeightActive, iotMode]);

  useEffect(() => {
    if (!isAutoWeight) return;

    if (activeTab === "1st Weight") {
      setFirstWeightForm(prev => ({ ...prev, weight1: liveWeight }));
    } else {
      setSecondWeightForm(prev => {
        const newState = { ...prev, weight2: liveWeight };
        // Calculate net weight dynamically for second weight form
        const w1 = Number(newState.weight1 || 0);
        const w2 = Number(liveWeight || 0);
        if (w1 >= 0 && w2 >= 0) {  // Changed condition to allow zero weights
          newState.netWeight = Math.abs(w2 - w1);
        }
        return newState;
      });
    }
  }, [liveWeight, isAutoWeight, activeTab]);

  useEffect(() => {
    const w1 = Number(secondWeightForm.weight1 || 0);
    const w2 = Number(secondWeightForm.weight2 || 0);
    if (w1 >= 0 && w2 >= 0) {  // Changed condition to allow zero weights
      setSecondWeightForm(prev => ({ ...prev, netWeight: Math.abs(w2 - w1) }));
    }
  }, [secondWeightForm.weight1, secondWeightForm.weight2]);

  // Turn live indicator back on when user opens 2nd weight form.
  useEffect(() => {
    if (activeTab === "2nd Weight") {
      setIsWeightActive(true);
      setIsAutoWeight(true);
    }
  }, [activeTab]);

  // -------------------------
  // Auto-fill: customer -> phone + partyName
  // -------------------------
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

  // Auto-fill: vehicle -> driver
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

  // -------------------------
  // Submit: First Weight
  // -------------------------
  const handleFirstWeightSubmit = async () => {
    setErr("");
    setSuccessMsg("");
    
    // Stop weight simulation when saving
    setIsWeightActive(false);

    const w1 = numOr0(firstWeightForm.weight1);
    if (w1 <= 0) {
      setIsWeightActive(true); // Re-enable if validation fails
      return setErr("1st weight is required.");
    }
    if (!firstWeightForm.material) {
      setIsWeightActive(true); // Re-enable if validation fails
      return setErr("Material is required.");
    }

    const bid = await ensureBranchSelected();
    if (!bid) {
      setIsWeightActive(true); // Re-enable if validation fails
      return setErr("Please select a branch from header before creating a slip.");
    }

    if (isAdmin) {
      const bid = getBranchSelected();
      if (!bid) {
        setIsWeightActive(true); // Re-enable if validation fails
        return setErr("Please select a branch from header before creating a slip (Admin).");
      }
    }

    setSaving(true);
    try {
      const payload = {
        voucherNo: strOrEmpty(firstWeightForm.voucherNo),
        customerType: strOrEmpty(firstWeightForm.customerType),

        // ✅ send PK integers (or null)
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

      const res = await api.post("/slips/first_weight/", payload);
      const created = res?.data || {};

      // Keep saved values visible in form after save, and stop live indicator.
      setFirstWeightForm((prev) => ({
        ...prev,
        serialNo: strOrEmpty(created.serialNo || prev.serialNo),
        weight1: strOrEmpty(created.weight1 || prev.weight1),
        voucherNo: strOrEmpty(created.voucherNo || prev.voucherNo),
      }));
      setIsWeightActive(false);
      setIsAutoWeight(false);
      setSuccessMsg(`Slip #${created?.serialNo || firstWeightForm.serialNo} saved successfully.`);

      await reloadLists();
      
      // Keep weight simulation stopped after successful save
      // The weight simulation will restart only when user resets the form or changes branch
    } catch (e) {
      setErr(extractErr(e));
      // Re-enable weight simulation if save fails
      setIsWeightActive(true);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // Lookup pending slip by serial (2nd tab) - TEMPORARILY DISABLED
  // -------------------------
  // useEffect(() => {
  //   const serial = String(secondWeightForm.serialNo || "").trim();
  //   
  //   // Only proceed if we have a valid serial number (at least 1 character)
  //   if (!serial || serial.length < 1) {
  //     // Clear any existing slip data when serial is empty
  //     if (secondWeightForm.slipId) {
  //       setSecondWeightForm(prev => ({
  //         ...initialSecondForm,
  //         outDate: new Date().toISOString().slice(0, 10),
  //         outTime: new Date().toTimeString().slice(0, 5),
  //       }));
  //     }
  //     return;
  //   }

  //   const t = setTimeout(async () => {
  //     try {
  //       // Validate that serial is a number before making API call
  //       const serialNum = parseInt(serial, 10);
  //       if (isNaN(serialNum) || serialNum <= 0) {
  //         setErr("Please enter a valid serial number.");
  //         return;
  //       }

  //       const res = await api.get("/slips/lookup/", { params: { serial_no: serialNum } });
  //       const s = res?.data;

  //       if (!s?.id) {
  //         setErr("Slip not found.");
  //         return;
  //       }
        
  //       if (s.status !== "Pending") {
  //         setErr("This slip is not pending.");
  //         return;
  //       }

  //       setErr("");
  //       setSecondWeightForm((p) => ({
  //         ...p,
  //         slipId: s.id,
  //         serialNo: s.serialNo || serial,
  //         voucherNo: s.voucherNo || "",
  //         customerType: s.customerType || "Commercial",
  //         inDate: s.inDate || "",
  //         inTime: s.inTime || "",
  //         vehicleId: s.vehicle || "",
  //         vehicleReg: s.vehicleReg || "",
  //         materialId: s.material || "",
  //         materialName: s.materialName || "",
  //         customerId: s.customer || "",
  //         customerName: s.customerName || "",
  //         partyName: s.partyName || "",
  //         supplierName: s.supplierName || "",
  //         driver: s.driver || "",
  //         phone: s.phone || "",
  //         amount: s.amount || "",
  //         remarks: s.remarks || "",
  //         weight1: s.weight1 || 0,
  //       }));
  //     } catch (e) {
  //       // Handle different types of errors
  //       if (e.response?.status === 404) {
  //         setErr("Slip not found.");
  //       } else if (e.response?.status === 400) {
  //         setErr("Invalid serial number format.");
  //       } else {
  //         // For other errors, don't show error while user is still typing
  //         console.error("Serial lookup error:", e);
  //       }
  //     }
  //   }, 600); // Increased delay to reduce API calls

  //   return () => clearTimeout(t);
  // }, [secondWeightForm.serialNo]);

  // -------------------------
  // Submit: Second Weight
  // -------------------------
  const handleSecondWeightSubmit = async () => {
    setErr("");
    setSuccessMsg("");
    
    // Stop weight simulation when saving
    setIsWeightActive(false);

    if (!secondWeightForm.slipId) {
      setIsWeightActive(true); // Re-enable if validation fails
      return setErr("Please enter a valid pending Serial No first.");
    }

    const w2 = numOr0(secondWeightForm.weight2);
    if (w2 <= 0) {
      setIsWeightActive(true); // Re-enable if validation fails
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
      const netWeight = Math.abs(numOr0(secondWeightForm.weight1) - w2);
      setCompletedSlip({
        ...secondWeightForm,
        weight2: w2,
        netWeight,
        slipId: secondWeightForm.slipId,
      });
      setSecondWeightForm((prev) => ({
        ...prev,
        weight2: w2,
        netWeight,
      }));
      setSuccessMsg("Second weight saved successfully. You can now print this slip.");
      await reloadLists();
      
      // Keep weight simulation stopped after successful save
      // The weight simulation will restart only when user resets the form or changes branch
    } catch (e) {
      setErr(extractErr(e));
      // Re-enable weight simulation if save fails
      setIsWeightActive(true);
    } finally {
      setSaving(false);
    }
  };

  // Print Slip
  // -------------------------
  const handlePrintSlip = async () => {
    setErr("");
    
    if (!completedSlip?.slipId) {
      return setErr("Save second weight first, then print will be enabled.");
    }

    try {
      setSaving(true);
      
      let latestCompany = null;
      try {
        const companyRes = await api.get("/companies/me/");
        latestCompany = companyRes?.data || null;
      } catch {
        latestCompany = null;
      }

      const finalSlipData = {
        ...printSlipData,
        companyName: strOrEmpty(latestCompany?.name || companyProfile.name || user?.company || "WEIGHTLOGIX"),
        companyAddress: strOrEmpty(latestCompany?.address || companyProfile.address || "Address not configured"),
        companyContact: strOrEmpty(
          latestCompany?.contact_number || companyProfile.contact_number || "Contact not configured"
        ),
      };

      if (secondWeightForm.printType === "DOS Print") {
        if (!selectedPrinter?.code) {
          setErr("No IoT printer found. Please configure a printer device first.");
          return;
        }
        await api.post(`/devices/${encodeURIComponent(selectedPrinter.code)}/print_slip/`, {
          slip_id: completedSlip.slipId,
          slip_data: finalSlipData,
        });
        setSuccessMsg("Slip sent to thermal printer successfully.");
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setErr("Popup blocked. Please allow popups and try printing again.");
        return;
      }
      const html = buildWeightSlipPrintHtml(finalSlipData);
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWhenImagesReady(printWindow);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  // -------------------------
  // Load pending slip
  // -------------------------
  const loadPendingSlip = (slip) => {
    if (!slip) return;
    setCompletedSlip(null);
    
    setSecondWeightForm((p) => ({
      ...p,
      slipId: slip.id || null,
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

  // Function to lookup pending slip by serial number
  const lookupPendingSlipBySerial = async (serial) => {
    if (!serial || serial.trim() === '') {
      setErr("");
      return;
    }

    try {
      setLookupLoading(true);
      const serialNum = parseInt(serial, 10);
      if (isNaN(serialNum) || serialNum <= 0) {
        setErr("Please enter a valid serial number.");
        return;
      }

      // Use already loaded pending list first for instant UX
      const fromPending = pendingSlips.find(
        (p) => Number(p?.serialNo || p?.serial_no) === serialNum
      );
      if (fromPending?.id) {
        loadPendingSlip(fromPending);
        setErr("");
        return;
      }

      const res = await api.get("/slips/lookup/", { params: { serial_no: serialNum } });
      const s = res?.data;

      if (!s?.id) {
        setErr("Slip not found.");
        return;
      }
      
      if (s.status !== "Pending") {
        setErr("This slip is not pending.");
        return;
      }

      setErr("");
      setSecondWeightForm((p) => ({
        ...p,
        slipId: s.id,
        serialNo: String(s.serialNo || ""),
        voucherNo: s.voucherNo || "",
        customerType: s.customerType || "Commercial",
        inDate: s.inDate || "",
        inTime: s.inTime || "",
        vehicleId: s.vehicle || "",
        vehicleReg: s.vehicleReg || "",
        materialId: s.material || "",
        materialName: s.materialName || "",
        customerId: s.customer || "",
        customerName: s.customerName || "",
        partyName: s.partyName || "",
        supplierName: s.supplierName || "",
        driver: s.driver || "",
        phone: s.phone || "",
        amount: s.amount || "",
        remarks: s.remarks || "",
        weight1: s.weight1 || 0,
      }));
    } catch (error) {
      setErr(extractErr(error) || "Error looking up slip.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Auto load pending slip when serial is typed in 2nd weight tab
  useEffect(() => {
    if (activeTab !== "2nd Weight") return;
    const serial = String(secondWeightForm.serialNo || "").trim();
    if (!serial) return;
    if (secondWeightForm.slipId) return;

    const t = setTimeout(() => {
      lookupPendingSlipBySerial(serial);
    }, 450);

    return () => clearTimeout(t);
  }, [activeTab, secondWeightForm.serialNo]);

  // -------------------------
  // UI
  // -------------------------
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
            {loading ? "Loading..." : iotMode === "iot" ? "IoT Live" : "Simulation"}
          </span>
          <button
            onClick={handleRefreshData}
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

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}

      {completedSlip?.slipId && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div>
            <div className="text-sm font-extrabold text-emerald-800 uppercase tracking-wide">
              Slip ready for printing
            </div>
            <p className="text-xs text-emerald-700 mt-1">
              Serial #{completedSlip.serialNo} has been completed. Print it, then click Create New Slip.
            </p>
          </div>
          <button
            onClick={startNewSlipProcess}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            Create New Slip
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN: FORMS */}
        <div className="flex-1">
          {/* 1ST WEIGHT FORM */}
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
                    placeholder={serialLoading ? "Loading serial..." : ""}
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

          {/* 2ND WEIGHT FORM */}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            lookupPendingSlipBySerial(secondWeightForm.serialNo);
                          }
                        }}
                        className={inputClass}
                        placeholder={lookupLoading ? "Searching..." : "Enter pending serial number"}
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
                        value={strOrEmpty(secondWeightForm.vehicleReg || "__")}
                        readOnly
                        className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Material</label>
                      <input
                        type="text"
                        value={strOrEmpty(secondWeightForm.materialName || "__")}
                        readOnly
                        className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Party</label>
                      <input
                        type="text"
                        value={strOrEmpty(secondWeightForm.partyName || "__")}
                        readOnly
                        className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Customer</label>
                      <input
                        type="text"
                        value={strOrEmpty(secondWeightForm.customerName || "__")}
                        readOnly
                        className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        type="text"
                        value={strOrEmpty(secondWeightForm.phone || "__")}
                        readOnly
                        className={`${inputClass} bg-slate-100 dark:bg-slate-700`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Driver</label>
                      <input
                        type="text"
                        value={strOrEmpty(secondWeightForm.driver || "__")}
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
                        placeholder="__"
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
                        placeholder="__"
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
                          setSecondWeightForm(prev => {
                            const newState = { ...prev, weight2: newWeight2 };
                            
                            // Calculate net weight when manually entering weight2
                            const w1 = Number(newState.weight1 || 0);
                            const w2 = Number(newWeight2 || 0);
                            if (w1 >= 0 && w2 >= 0) {  // Changed condition to allow zero weights
                              newState.netWeight = Math.abs(w2 - w1);
                            }
                            return newState;
                          });
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
                      disabled={saving || Boolean(completedSlip?.slipId)}
                      onClick={handleSecondWeightSubmit}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-70"
                    >
                      <span className="material-icons-outlined">check_circle</span>
                      {saving ? "Saving..." : completedSlip?.slipId ? "Saved" : "Save"}
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
              <span>{selectedIndicator?.name ? `Scale: ${selectedIndicator.name}` : "Scale: Demo feed"}</span>
              <span className={iotMode === "iot" ? "text-success" : "text-amber-400"}>
                {iotMode === "iot" ? "IoT Online" : "Simulation"}
              </span>
            </div>
          </div>

          {iotError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-xs">
              {iotError}
            </div>
          )}

          {/* Print Slip Button */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl shadow-primary/10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary/20 to-primary-light/20" />

            <div className="relative p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-wide">
                    Premium Print Center
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Final review and print dispatch
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider">
                  {secondWeightForm.printType}
                </span>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 backdrop-blur px-3 py-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-100">Printer:</span>{" "}
                {selectedPrinter?.name ? selectedPrinter.name : "Not configured (Win Print available)"}
              </div>

              {/* Slip Preview */}
              <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/80 overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Slip Preview
                  </span>
                  <span className="text-[11px] font-mono font-bold text-primary">
                    #{printSlipData.serialNo || "__"}
                  </span>
                </div>
                <div className="p-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-200 max-h-48 overflow-y-auto">
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Vehicle</span><span className="font-semibold truncate">{printSlipData.vehicleReg}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Material</span><span className="font-semibold truncate">{printSlipData.materialName}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Customer</span><span className="font-semibold truncate">{printSlipData.customerName}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Driver</span><span className="font-semibold truncate">{printSlipData.driver}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">Remarks</span><span className="font-semibold truncate">{printSlipData.remarks}</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">1st Weight</span><span className="font-mono font-semibold">{Number(printSlipData.weight1 || 0).toLocaleString()} kg</span></div>
                  <div className="flex justify-between gap-2"><span className="text-slate-500">2nd Weight</span><span className="font-mono font-semibold">{Number(printSlipData.weight2 || 0).toLocaleString()} kg</span></div>
                  <div className="flex justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Net</span>
                    <span className="font-mono font-extrabold text-primary">{Number(printSlipData.netWeight || 0).toLocaleString()} kg</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePrintSlip}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-light hover:from-primary-hover hover:to-primary text-white font-extrabold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!completedSlip?.slipId || saving}
                >
                  <span className="material-icons-outlined text-sm">print</span>
                  {saving ? "Processing..." : "Print Slip"}
                </button>

                {!completedSlip?.slipId && (
                  <div className="text-[11px] text-center text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-2 py-1.5">
                    Load pending slip, save second weight, then printing will be enabled.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-900">
                  <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-lg px-2 py-2 transition-colors ${
                    secondWeightForm.printType === "DOS Print"
                      ? "bg-white dark:bg-slate-800 border border-primary/30 text-primary"
                      : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200"
                  }`}>
                    <input
                      type="radio"
                      name="printType"
                      checked={secondWeightForm.printType === "DOS Print"}
                      onChange={() => setSecondWeightForm((p) => ({ ...p, printType: "DOS Print" }))}
                      className="accent-primary"
                    />
                    <span className="text-xs font-bold uppercase tracking-wide">DOS Print</span>
                  </label>
                  <label className={`flex items-center justify-center gap-2 cursor-pointer rounded-lg px-2 py-2 transition-colors ${
                    secondWeightForm.printType === "Win Print"
                      ? "bg-white dark:bg-slate-800 border border-primary/30 text-primary"
                      : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-200"
                  }`}>
                    <input
                      type="radio"
                      name="printType"
                      checked={secondWeightForm.printType === "Win Print"}
                      onChange={() => setSecondWeightForm((p) => ({ ...p, printType: "Win Print" }))}
                      className="accent-primary"
                    />
                    <span className="text-xs font-bold uppercase tracking-wide">Win Print</span>
                  </label>
                </div>
              </div>
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
                    <td className="px-4 py-3 font-mono font-bold text-primary">#{p.serialNo || ''}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {p.vehicleReg || ''}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.materialName || ''}</td>
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

export default CreateSlip;
