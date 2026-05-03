// src/pages/UsersRoles.jsx
import React, { useEffect, useMemo, useState } from "react";
import api, { extractErr } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const UsersRolesComponent = ({ canModifyUsers, role, myCompany }) => {
  // CRUD State
  const [showInlineForm, setShowInlineForm] = useState(false); // Track if inline form is visible
  const [editingId, setEditingId] = useState(null);

  // Server state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Branch dropdown (Admin only)
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Form State (match backend)
  const initialFormState = useMemo(
    () => ({
      name: "",
      email: "",
      role: canModifyUsers ? "Operator" : "Operator", // manager can only create operator
      status: "Active",
      phone: "",
      // ✅ auto-fill company from logged-in user
      company: myCompany,
      password: "", // optional (blank = keep on edit)
      branch_id: null, // optional (manager can assign to operator)
    }),
    [role, myCompany, canModifyUsers]
  );

  const [formData, setFormData] = useState(initialFormState);

  // ✅ if me() loads late, sync company into form (only when inline form closed)
  useEffect(() => {
    if (!showInlineForm) {
      setFormData((p) => ({ ...p, company: myCompany }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCompany]);

  // ✅ When inline form is shown & user is Manager, fetch branches for dropdown
  useEffect(() => {
    if (showInlineForm && role === "Manager") {
      loadBranches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInlineForm, role]);

  // ----------------------------
  // Load users list
  // ----------------------------
  const loadUsers = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/accounts/users/");
      const list = res?.data?.results || res?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------
  // Load branches (Manager only)
  // ----------------------------
  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const res = await api.get("/branches/");
      const list = res?.data?.results || res?.data || [];
      setBranches(Array.isArray(list) ? list : []);
    } catch (e) {
      // branches load fail should not block user create UI completely
      setBranches([]);
      setErr(extractErr(e));
    } finally {
      setLoadingBranches(false);
    }
  };

  // ----------------------------
  // Modal helpers
  // ----------------------------
  const resetForm = () => {
    setShowInlineForm(false);
    setEditingId(null);
    setFormData(initialFormState);
    setErr("");
  };

  const openAdd = () => {
    if (!canModifyUsers) return;
    setErr("");
    setFormData(initialFormState);
    setEditingId(null);
    setShowInlineForm(true);
  };

  const hideInlineForm = () => {
    setShowInlineForm(false);
    setErr("");
    setFormData(initialFormState);
  };

  const handleEdit = (u) => {
    if (!canModifyUsers) return;
    setErr("");

    setFormData({
      name: u?.name || "",
      email: u?.email || "",
      role: u?.role || "Operator",
      status: u?.status || (u?.is_active ? "Active" : "Inactive"),
      phone: u?.phone || "",
      // ✅ always show logged-in company (not editable)
      company: myCompany || (u?.company || ""),
      password: "",
      branch_id: u?.branch_id ?? null,
    });

    setEditingId(u.id);
    setShowInlineForm(true);
  };

  // ----------------------------
  // Save (Create / Update)
  // ----------------------------
  const handleSave = async () => {
    setErr("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setErr("Name and Email are required!");
      return;
    }
    if (!formData.phone.trim()) {
      setErr("Phone is required!");
      return;
    }

    // ✅ company must exist on signed-in user
    if (!myCompany) {
      setErr("Your account has no company set. Please update profile/company first.");
      return;
    }

    // Manager restriction (extra UI guard)
    if (role === "Manager" && formData.role !== "Operator") {
      setErr("Manager can only create/update Operator users.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        status: formData.status,
        phone: formData.phone.trim(),

        // ✅ always send logged-in company (backend should still override)
        company: myCompany,

        password: (formData.password || "").trim(), // optional
      };

      // Manager can send branch_id (assigned to the created operator)
      if (role === "Manager") {
        payload.branch_id = formData.branch_id ? Number(formData.branch_id) : null;
      }

      if (editingId) {
        await api.put(`/accounts/users/${editingId}/`, payload);
      } else {
        await api.post("/accounts/users/", payload);
      }

      await loadUsers();
      resetForm();
    } catch (e) {
      setErr(extractErr(e));
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------
  // Delete
  // ----------------------------
  const handleDelete = async (id) => {
    if (!canModifyUsers) return;
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setErr("");
    try {
      await api.delete(`/accounts/users/${id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setErr(extractErr(e));
    }
  };

  // Helper: get branch name (for optional display later)
  const branchNameById = (id) => {
    const b = branches.find((x) => Number(x.id) === Number(id));
    return b?.name || "";
  };

  return (
    <div className="flex flex-col h-full font-display text-gray-800 dark:text-gray-200 overflow-y-auto">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-icons-outlined text-xl">people_alt</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              User Management
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 ml-13">
            Manage user access, roles, and permissions across your organization.
          </p>
        </div>

        <button
          onClick={openAdd}
          disabled={!canModifyUsers}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-all shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
        >
          <span className="material-icons-outlined text-sm">add</span>
          <span>{showInlineForm ? "Cancel" : "Add User"}</span>
        </button>
      </div>

      {err && (
        <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {err}
        </div>
      )}

      {/* Inline Add User Form */}
      {showInlineForm && canModifyUsers && (
        <div className="mb-6 p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-dark dark:text-white flex items-center gap-2 mb-4">
            <span className="material-icons-outlined text-primary">person_add</span>
            Add New User
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="name">
                Full Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all dark:text-white"
                id="name"
                type="text"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="email">
                Email Address *
              </label>
              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all dark:text-white"
                id="email"
                type="email"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="phone">
                Phone *
              </label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all dark:text-white"
                id="phone"
                type="text"
                placeholder="03xx-xxxxxxx"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="company">
                Company
              </label>
              <input
                value={myCompany}
                readOnly
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-900/60 px-4 py-3 text-sm font-medium outline-none transition-all dark:text-white cursor-not-allowed"
                id="company"
                type="text"
                title="Company is auto-filled from signed-in user"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="role">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setFormData((p) => {
                    return { ...p, role: newRole };
                  });
                }}
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all cursor-pointer dark:text-white"
                id="role"
                disabled={!canModifyUsers} // only manager can choose roles
              >
                <option value="Operator">Operator</option>
              </select>

              {role === "Manager" && (
                <p className="text-[10px] text-primary dark:text-primary-light mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">info</span>
                  Manager can only create Operator users.
                </p>
              )}
              
              {!canModifyUsers && (
                <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">lock</span>
                  Your role cannot modify user roles.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="status">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all cursor-pointer dark:text-white"
                id="status"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Manager can assign branch when creating operator */}
          {role === "Manager" && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="branch_id">
                Assign Branch
              </label>

              <select
                id="branch_id"
                value={formData.branch_id ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    branch_id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all cursor-pointer dark:text-white"
                disabled={loadingBranches}
              >
                <option value="">— Select Branch —</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {loadingBranches && (
                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px] animate-spin">autorenew</span>
                  Loading branches...
                </p>
              )}

              {!!formData.branch_id && (
                <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">check_circle</span>
                  Selected: <span className="font-semibold">{branchNameById(formData.branch_id)}</span>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2" htmlFor="password">
              Password
            </label>
            <input
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full rounded-lg border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 px-4 py-3 text-sm font-medium focus:border-primary focus:ring-primary outline-none transition-all dark:text-white"
              id="password"
              type="password"
              placeholder="Enter password (optional)"
            />
            <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
              Enter a password or leave blank to use default
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={hideInlineForm}
              className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <span className="material-icons-outlined text-sm">cancel</span>
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-sm">add</span>
                  Create User
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="@container">
        <div className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">person</span>
                    <span>Name</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">email</span>
                    <span>Email</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">badge</span>
                    <span>Role</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-sm">toggle_on</span>
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span>Actions</span>
                    <span className="material-icons-outlined text-sm">build</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-icons-outlined text-4xl text-gray-300 animate-spin mb-3">autorenew</span>
                      <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center" colSpan={5}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-icons-outlined text-4xl text-gray-300 mb-3">person_outline</span>
                      <p className="text-gray-500 dark:text-gray-400">No users found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a new user to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="material-icons-outlined text-sm">mail</span>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${
                          u.role === "Manager"
                            ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900"
                            : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                        }`}
                      >
                        <span className="material-icons-outlined text-xs mr-1">
                          {u.role === "Manager" ? "admin_panel_settings" : "person"}
                        </span>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          u.status === "Active"
                            ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900"
                            : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900"
                        }`}
                      >
                        <span className="material-icons-outlined text-xs mr-1">
                          {u.status === "Active" ? "check_circle" : "cancel"}
                        </span>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      {canModifyUsers && (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit user"
                          >
                            <span className="material-icons-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete user"
                          >
                            <span className="material-icons-outlined text-sm">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UsersRoles = () => {
  const { user } = useAuth();

  // Roles
  const role = user?.role || "Operator";
  const canManage = ["Manager", "Operator"].includes(role); // Both manager and operator can access the page
  const canModifyUsers = ["Manager"].includes(role); // Only manager can create/edit/delete users

  // ✅ signed-in user's company (auto-fill)
  const myCompany = (user?.company || "").trim();

  // Show access denied message if user doesn't have permission
  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <UsersRolesComponent canModifyUsers={canModifyUsers} role={role} myCompany={myCompany} />;
};

export default UsersRoles;