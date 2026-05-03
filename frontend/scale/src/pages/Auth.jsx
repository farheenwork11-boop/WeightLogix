// src/pages/Auth.jsx
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api, { extractErr, setTokens } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { loadMe, login } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);

  // -----------------------
  // Form state
  // -----------------------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // redirect after auth
  const from = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setPassword("");
  };

  // -----------------------
  // Submit handler
  // -----------------------
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // basic validation
    if (!cleanEmail) return setErr("Email is required.");
    if (!cleanPassword) return setErr("Password is required.");

    if (isSignUp) {
      if (!(fullName || "").trim()) return setErr("Full name is required.");
      if (!(phone || "").trim()) return setErr("Phone is required.");
      if (!(company || "").trim()) return setErr("Company is required.");
    }

    setSubmitting(true);

    try {
      if (isSignUp) {
        // ✅ REGISTER
        const res = await api.post("/accounts/register/", {
          full_name: fullName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          company: company.trim(),
          password: cleanPassword,
        });

        // backend returns { user: {...}, access, refresh }
        const { access, refresh } = res.data || {};
        if (!access) throw new Error("Register failed: no token returned.");

        setTokens({ access, refresh });

        const me = await loadMe();
        if (!me) throw new Error("Register ok, but profile load failed.");

        resetForm();
        navigate(from, { replace: true });
        return;
      }

      // ✅ LOGIN
      // Important: stop navigate if login fails / returns null
      const me = await login({ email: cleanEmail, password: cleanPassword });

      if (!me) {
        setErr("Invalid email/password or session could not be created.");
        return;
      }

      resetForm();
      navigate(from, { replace: true });
    } catch (e2) {
      setErr(extractErr(e2));
    } finally {
      setSubmitting(false);
    }
  };

  // Icons as Components
  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );

  const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
      <path
        fill="#1877F2"
        d="M24,4C12.954,4,4,12.954,4,24c0,9.961,7.262,18.239,16.75,19.728V29.77h-5.042v-5.77h5.042v-4.376c0-4.97,2.958-7.72,7.495-7.72c2.173,0,4.453,0.388,4.453,0.388v4.882h-2.508c-2.464,0-3.232,1.529-3.232,3.097v3.729h5.5l-0.879,5.77h-4.621v13.958C36.738,42.239,44,33.961,44,24C44,12.954,35.046,4,24,4z"
      />
    </svg>
  );

  const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
      <path
        fill="#0A66C2"
        d="M41,4H7C5.343,4,4,5.343,4,7v34c0,1.657,1.343,3,3,3h34c1.657,0,3-1.343,3-3V7C44,5.343,42.657,4,41,4z M17,20v19h-6V20H17z M11,14.471c-1.999,0-3.611-1.612-3.611-3.611s1.612-3.611,3.611-3.611c1.999,0,3.611,1.612,3.611,3.611S12.999,14.471,11,14.471z M39,39h-6c0,0,0-9.26,0-10c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56c3.97,0,7.19,2.73,7.19,8.26V39z"
      />
    </svg>
  );

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

  const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
    </svg>
  );

  const CompanyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M10 2L3 7v15h18V7l-7-5zm5 16H9v-2h6v2zm3-4H6v-2h12v2zm0-4H6v-2h12v2z"/>
    </svg>
  );

  const ScaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H9v1h6v-1z"/>
    </svg>
  );

  const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </svg>
  );

  const SecurityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  );

  const TrackingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  );

  const LockOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  );

  const socialBtnClass =
    "flex items-center justify-center w-10 h-10 border border-gray-100 rounded-full bg-bg-card shadow-sm hover:shadow-md transition-all transform hover:scale-110";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6 bg-gradient-to-br from-white via-gray-50 to-white font-sans relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-5xl min-h-[600px] flex bg-white rounded-3xl shadow-2xl z-10 overflow-hidden border-2 border-gray-100">
        {/* Left Side - Premium Branding */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary via-primary-light to-primary text-white flex-col justify-center items-center p-12 relative overflow-hidden order-1">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

          <div className="relative z-10 text-center max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border-2 border-white/30 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H9v1h6v-1z"/>
                </svg>
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">WEIGHTLOGIX</h2>
              <p className="text-white/80 text-base mb-10 leading-relaxed">
                The intelligent weighing management solution for modern industries. Accurate, reliable, and secure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H9v1h6v-1z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-white">Precise Weighing</h3>
                <p className="text-xs text-white/60 mt-1">99.9% accuracy</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-white">Smart Reports</h3>
                <p className="text-xs text-white/60 mt-1">AI-powered</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-white">Secure Data</h3>
                <p className="text-xs text-white/60 mt-1">Enterprise-grade</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-white">Real-time Tracking</h3>
                <p className="text-xs text-white/60 mt-1">24/7 monitoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all bg-white relative z-20 order-2">
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>

              <h1 className="text-3xl font-black text-primary mb-2">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-medium text-sm">
                {isSignUp ? "Join us to get started" : "Sign in to your account"}
              </p>
            </div>

            {/* Social Login */}
            <div className="flex gap-3 mb-6 justify-center">
              <button type="button" className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-primary/30 hover:bg-primary/5 transition-all transform hover:scale-105 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </button>
              <button type="button" className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-primary/30 hover:bg-primary/5 transition-all transform hover:scale-105 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#1877F2" d="M24,4C12.954,4,4,12.954,4,24c0,9.961,7.262,18.239,16.75,19.728V29.77h-5.042v-5.77h5.042v-4.376c0-4.97,2.958-7.72,7.495-7.72c2.173,0,4.453,0.388,4.453,0.388v4.882h-2.508c-2.464,0-3.232,1.529-3.232,3.097v3.729h5.5l-0.879,5.77h-4.621v13.958C36.738,42.239,44,33.961,44,24C44,12.954,35.046,4,24,4z" />
                </svg>
              </button>
              <button type="button" className="flex items-center justify-center w-12 h-12 border-2 border-gray-200 rounded-xl bg-white hover:border-primary/30 hover:bg-primary/5 transition-all transform hover:scale-105 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#0A66C2" d="M41,4H7C5.343,4,4,5.343,4,7v34c0,1.657,1.343,3,3,3h34c1.657,0,3-1.343,3-3V7C44,5.343,42.657,4,41,4z M17,20v19h-6V20H17z M11,14.471c-1.999,0-3.611-1.612-3.611-3.611s1.612-3.611,3.611-3.611c1.999,0,3.611,1.612,3.611,3.611S12.999,14.471,11,14.471z M39,39h-6c0,0,0-9.26,0-10c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56c3.97,0,7.19,2.73,7.19,8.26V39z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-gray-200 flex-1"></div>
              <span className="text-[10px] text-medium font-semibold uppercase tracking-wider">
                {isSignUp ? "or register with email" : "or login with email"}
              </span>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* FORM */}
            <form className="space-y-4" onSubmit={onSubmit}>
              {err && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                  {err}
                </div>
              )}

              {isSignUp && (
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-medium group-focus-within:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-dark placeholder-medium outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-medium group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-dark placeholder-medium outline-none transition-all"
                  required
                />
              </div>

              {isSignUp && (
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-medium group-focus-within:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-dark placeholder-medium outline-none transition-all"
                    required
                  />
                </div>
              )}

              {isSignUp && (
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-medium group-focus-within:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M10 2L3 7v15h18V7l-7-5zm5 16H9v-2h6v2zm3-4H6v-2h12v2zm0-4H6v-2h12v2z"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-dark placeholder-medium outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-medium group-focus-within:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 text-dark placeholder-medium outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 px-6 py-4 text-sm font-bold text-white uppercase tracking-wider transition-all transform rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10">{submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </button>
            </form>

            {/* TOGGLE LINK */}
            <div className="mt-6 text-center text-sm">
              <span className="text-medium">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setErr("");
                  setIsSignUp(!isSignUp);
                  resetForm();
                }}
                className="font-bold text-primary hover:text-primary-hover hover:underline focus:outline-none transition-colors duration-300"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/"
        className="mt-6 z-10 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-gray-200 text-sm font-semibold text-dark hover:border-primary hover:text-primary hover:bg-primary/5 shadow-sm transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
    </div>
  );
};

export default Auth;
