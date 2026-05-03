// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { user, setUser, loadMe } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ✅ branch list state
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // form state (edit form)
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // -----------------------------
  // Load profile from backend
  // -----------------------------
  const fetchMe = async () => {
    const res = await api.get("/accounts/me/");
    setUser(res.data);

    const fullName = `${res.data?.first_name || ""} ${res.data?.last_name || ""}`.trim();
    setForm({
      full_name: fullName,
      email: res.data?.email || "",
      phone: res.data?.phone || "",
    });

    return res.data;
  };

  // ✅ Load branches (backend already scopes by role/company/branch rules)
  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await api.get("/branches/");
      const list = res?.data?.results || res?.data || [];
      setBranches(Array.isArray(list) ? list : []);
    } finally {
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      setErr("");
      setLoading(true);
      try {
        await Promise.all([fetchMe(), fetchBranches()]);
      } catch (e) {
        setErr(extractErr(e));
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // Helpers
  // -----------------------------
  const splitName = (full) => {
    const s = (full || "").trim().replace(/\s+/g, " ");
    const parts = s ? s.split(" ") : [];
    const first_name = parts[0] || "";
    const last_name = parts.slice(1).join(" ");
    return { first_name, last_name };
  };

  // ✅ resolve branch name
  const branchName = useMemo(() => {
    const bid = user?.branch_id || user?.branch || null; // safety
    if (!bid) return "No Branch";

    const found = branches.find((b) => Number(b.id) === Number(bid));
    return found?.name || `Branch #${bid}`;
  }, [branches, user]);

  // derived display values
  const display = useMemo(() => {
    const first = user?.first_name || "";
    const last = user?.last_name || "";
    const name = `${first} ${last}`.trim() || user?.username || "";
    const role = user?.role || "Operator";
    return { name, role };
  }, [user]);

  // -----------------------------
  // Save profile (PATCH)
  // -----------------------------
  const handleSave = async () => {
    setErr("");

    const email = (form.email || "").trim().toLowerCase();
    const phone = (form.phone || "").trim();
    const { first_name, last_name } = splitName(form.full_name);

    if (!first_name) return setErr("Name is required.");
    if (!email) return setErr("Email is required.");
    if (!phone) return setErr("Phone is required.");

    setSaving(true);
    try {
      await api.patch("/accounts/me/update/", {
        first_name,
        last_name,
        email,
        phone,
      });

      setIsEditing(false);

      // refresh auth user (server truth)
      await loadMe();

      // refresh local data too (and branches if needed)
      await fetchMe();
      await fetchBranches();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Icons
  // -----------------------------
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );

  const EnvelopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );

  if (loading) {
    return <div className="text-sm text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-dark dark:text-white">My Profile</h1>

      {err && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {err}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm flex flex-col items-center sm:flex-row gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-lg overflow-hidden">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(display.name)}&background=random&size=200`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-4 z-10 w-full">
          <div>
            {isEditing ? (
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-primary transition-colors">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-2xl font-bold text-dark dark:text-white bg-transparent border-b border-primary outline-none"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-bold text-dark dark:text-white">{display.name}</h2>
            )}

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {display.role} • {branchLoading ? "Loading branch..." : branchName}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-left">
              <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
              {isEditing ? (
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <EnvelopeIcon />
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="font-medium text-dark dark:text-white bg-transparent border-b border-primary outline-none w-full pl-8 py-1"
                  />
                </div>
              ) : (
                <p className="font-medium text-dark dark:text-white truncate">{user?.email}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-left">
              <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
              {isEditing ? (
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <PhoneIcon />
                  </span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="font-medium text-dark dark:text-white bg-transparent border-b border-primary outline-none w-full pl-8 py-1"
                  />
                </div>
              ) : (
                <p className="font-medium text-dark dark:text-white">{user?.phone}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-center sm:justify-start pt-2">
              <button
                onClick={() => {
                  setErr("");
                  setIsEditing(false);
                  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
                  setForm({
                    full_name: fullName,
                    email: user?.email || "",
                    phone: user?.phone || "",
                  });
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold text-sm"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-6 right-6 p-2 bg-primary text-white rounded-full shadow-md hover:bg-primary-hover transition-transform active:scale-95 z-20"
          >
            <span className="material-icons-outlined text-sm">edit</span>
          </button>
        )}
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Total Logins</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white mt-1">—</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Last Active</p>
          <h3 className="text-2xl font-bold text-dark dark:text-white mt-1">—</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Security Level</p>
          <h3 className="text-2xl font-bold text-green-500 mt-1">High</h3>
        </div>
      </div>
    </div>
  );
};

export default Profile;
