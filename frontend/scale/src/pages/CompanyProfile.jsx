import React, { useEffect, useState } from "react";
import api, { extractErr } from "@/services/api";

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [savedProfile, setSavedProfile] = useState({
    name: "",
    address: "",
    contact_number: "",
  });
  const [form, setForm] = useState({
    name: "",
    address: "",
    contact_number: "",
  });

  const loadProfile = async () => {
    setErr("");
    setOk("");
    setLoading(true);
    try {
      const res = await api.get("/companies/me/");
      const data = res?.data || {};
      const normalized = {
        name: data.name || "",
        address: data.address || "",
        contact_number: data.contact_number || "",
      };
      setForm(normalized);
      setSavedProfile(normalized);
      setIsEditing(!normalized.name);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSave = async () => {
    setErr("");
    setOk("");
    if (!form.name.trim()) {
      setErr("Company name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        contact_number: form.contact_number.trim(),
      };
      const res = await api.patch("/companies/me/", payload);
      const data = res?.data || payload;
      const normalized = {
        name: data.name || "",
        address: data.address || "",
        contact_number: data.contact_number || "",
      };
      setForm(normalized);
      setSavedProfile(normalized);
      setIsEditing(false);
      setOk("Company profile updated successfully.");
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelClass =
    "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2";

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary to-primary-light text-white">
          <h1 className="text-xl font-extrabold tracking-wide">Company Print Profile</h1>
          <p className="text-xs mt-1 text-white/85">
            Yeh details print slip ke header me show hongi.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}
          {ok && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {ok}
            </div>
          )}

          {loading ? (
            <div className="text-sm text-slate-500">Loading company profile...</div>
          ) : (
            <div className="space-y-6">
              {!isEditing && savedProfile.name && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-5 relative">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute right-4 top-4 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:text-primary hover:border-primary/40 transition-colors"
                    title="Edit Company Profile"
                  >
                    <span className="material-icons-outlined text-base">edit</span>
                  </button>

                  <div className="pr-12">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {savedProfile.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">
                      {savedProfile.address || "Address not added yet."}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {savedProfile.contact_number || "Contact number not added yet."}
                    </p>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Company Name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className={inputClass}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Contact Number</label>
                    <input
                      name="contact_number"
                      value={form.contact_number}
                      onChange={onChange}
                      className={inputClass}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className={labelClass}>Company Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      rows={4}
                      className={inputClass}
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              )}

              {!savedProfile.name && !isEditing && (
                <div className="text-sm text-slate-500">
                  Profile not configured yet. Click edit icon to add details.
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onSave}
              disabled={loading || saving || !isEditing}
              className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
