// src/pages/CreateSlipDiagnostic.jsx - Diagnostic version to find exact cause
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const CreateSlipDiagnostic = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("1st Weight");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState("");

  // Test state to isolate the issue
  const [testState, setTestState] = useState({
    basicField: "test value",
    numberField: 123,
    booleanField: true
  });

  // Log diagnostic information
  const logDiagnostic = (message) => {
    console.log(`[DIAGNOSTIC] ${message}`);
    setDiagnosticInfo(prev => prev + `\n${new Date().toLocaleTimeString()}: ${message}`);
  };

  // Simple forms for testing
  const [firstForm, setFirstForm] = useState({ serialNo: "TEST-001", weight1: "" });
  const [secondForm, setSecondForm] = useState({ serialNo: "", weight1: 0, weight2: "", netWeight: 0 });

  // Load basic data
  const loadBasicData = async () => {
    logDiagnostic("Starting data load...");
    setLoading(true);
    try {
      // Test minimal API calls
      const [materialsRes, pendingRes] = await Promise.all([
        api.get("/materials/", { params: { status: "Active" } }).catch(e => ({ data: { results: [] } })),
        api.get("/slips/pending/").catch(e => ({ data: [] }))
      ]);
      
      logDiagnostic(`Materials loaded: ${materialsRes.data.results?.length || 0}`);
      logDiagnostic(`Pending slips loaded: ${pendingRes.data?.length || 0}`);
    } catch (e) {
      logDiagnostic(`Error loading data: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    logDiagnostic("Component mounted");
    loadBasicData();
  }, []);

  // Test rendering functions
  const renderFirstWeightForm = () => {
    logDiagnostic("Rendering first weight form");
    try {
      return (
        <div className="bg-white p-4 rounded">
          <h3 className="font-bold mb-3">First Weight Form</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Serial No:</label>
              <input 
                type="text" 
                value={firstForm.serialNo} 
                className="w-full border rounded p-2"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight 1:</label>
              <input 
                type="number" 
                value={firstForm.weight1} 
                onChange={(e) => setFirstForm({...firstForm, weight1: e.target.value})}
                className="w-full border rounded p-2"
              />
            </div>
            <button 
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={() => logDiagnostic("First form save clicked")}
            >
              Save First Weight
            </button>
          </div>
        </div>
      );
    } catch (error) {
      logDiagnostic(`First form render error: ${error.message}`);
      return <div className="text-red-500">First form render error: {error.message}</div>;
    }
  };

  const renderSecondWeightForm = () => {
    logDiagnostic("Rendering second weight form - THIS IS THE PROBLEM AREA");
    try {
      return (
        <div className="bg-white p-4 rounded">
          <h3 className="font-bold mb-3">Second Weight Form - DIAGNOSTIC MODE</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Serial No:</label>
              <input 
                type="text" 
                value={secondForm.serialNo} 
                onChange={(e) => setSecondForm({...secondForm, serialNo: e.target.value})}
                className="w-full border rounded p-2"
                placeholder="Enter serial number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">1st Weight:</label>
              <input 
                type="text" 
                value={`${secondForm.weight1} kg`} 
                readOnly
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">2nd Weight:</label>
              <input 
                type="number" 
                value={secondForm.weight2} 
                onChange={(e) => {
                  const newWeight2 = e.target.value;
                  setSecondForm({
                    ...secondForm, 
                    weight2: newWeight2,
                    netWeight: Math.abs(Number(newWeight2 || 0) - Number(secondForm.weight1 || 0))
                  });
                }}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Net Weight:</label>
              <input 
                type="text" 
                value={`${secondForm.netWeight} kg`} 
                readOnly
                className="w-full border rounded p-2 bg-blue-50 font-bold"
              />
            </div>
            <button 
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => logDiagnostic("Second form save clicked")}
            >
              Complete Second Weight
            </button>
          </div>
        </div>
      );
    } catch (error) {
      logDiagnostic(`SECOND FORM RENDER ERROR: ${error.message}`);
      return <div className="text-red-500 p-4">SECOND FORM CRASHED: {error.message}</div>;
    }
  };

  logDiagnostic(`Current active tab: ${activeTab}`);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Diagnostic Tool - White Screen Investigation</h1>
        <p className="text-sm text-gray-600">This tool helps identify exactly what's causing the 2nd weight form crash</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            logDiagnostic("Switching to 1st Weight tab");
            setActiveTab("1st Weight");
          }}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "1st Weight" 
              ? "bg-primary text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          1st Weight (Inbound)
        </button>
        <button
          onClick={() => {
            logDiagnostic("Switching to 2nd Weight tab - TESTING NOW");
            setActiveTab("2nd Weight");
          }}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "2nd Weight" 
              ? "bg-primary text-white" 
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          2nd Weight (Outbound) - TEST AREA
        </button>
      </div>

      {/* Error display */}
      {err && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {err}
        </div>
      )}

      {/* Diagnostic info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
        <h3 className="font-bold text-yellow-800 mb-2">Diagnostic Information:</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
          {diagnosticInfo || "No diagnostic info yet..."}
        </pre>
        <button 
          onClick={() => setDiagnosticInfo("")}
          className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
        >
          Clear Log
        </button>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white p-8 rounded text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : activeTab === "1st Weight" ? (
            renderFirstWeightForm()
          ) : (
            renderSecondWeightForm()
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">Test State</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(testState, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">Form States</h3>
            <div className="text-sm">
              <p><strong>First Form:</strong></p>
              <pre className="text-xs bg-gray-100 p-1 rounded mb-2">
                {JSON.stringify(firstForm, null, 2)}
              </pre>
              <p><strong>Second Form:</strong></p>
              <pre className="text-xs bg-gray-100 p-1 rounded">
                {JSON.stringify(secondForm, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            logDiagnostic("Manual refresh triggered");
            loadBasicData();
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Refresh Data
        </button>
        <button
          onClick={() => {
            logDiagnostic("Forced state reset");
            setFirstForm({ serialNo: "RESET-001", weight1: "" });
            setSecondForm({ serialNo: "", weight1: 0, weight2: "", netWeight: 0 });
          }}
          className="bg-secondary text-primary-dark px-4 py-2 rounded hover:bg-secondary/80"
        >
          Reset Forms
        </button>
      </div>
    </div>
  );
};

export default CreateSlipDiagnostic;