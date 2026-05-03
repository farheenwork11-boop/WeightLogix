import React, { useState } from 'react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('General');

    // Form States
    const [companyInfo, setCompanyInfo] = useState({
        name: 'WEIGHTLOGIX Logistics',
        email: 'admin@scalemaster.com',
        phone: '+92 300 1234567',
        currency: 'PKR (Rs)',
        timezone: '(GMT+05:00) Islamabad, Karachi',
        unit: 'Kilograms (kg)'
    });

    const handleInfoChange = (e) => {
        setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        alert("Settings saved successfully!");
        // Logic to persist settings would go here
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <h1 className="text-2xl font-bold text-dark">System Settings</h1>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="flex border-b border-slate-200 overflow-x-auto">
                    {['General', 'Security', 'Notifications', 'Integrations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === tab
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-slate-500 hover:text-dark hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'General' && (
                        <div className="max-w-2xl space-y-6 animate-fade-in-up">
                            <h3 className="text-lg font-bold text-dark">Company Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500">Company Name</span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={companyInfo.name}
                                        onChange={handleInfoChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500">Contact Email</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={companyInfo.email}
                                        onChange={handleInfoChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500">Phone Number</span>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={companyInfo.phone}
                                        onChange={handleInfoChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500">Currency</span>
                                    <select
                                        name="currency"
                                        value={companyInfo.currency}
                                        onChange={handleInfoChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                    >
                                        <option>PKR (Rs)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                    </select>
                                </label>
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-bold text-dark mb-4">Regional Settings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="space-y-1">
                                        <span className="text-xs font-bold text-slate-500">Timezone</span>
                                        <select
                                            name="timezone"
                                            value={companyInfo.timezone}
                                            onChange={handleInfoChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                        >
                                            <option>(GMT+05:00) Islamabad, Karachi</option>
                                            <option>(GMT+00:00) UTC</option>
                                        </select>
                                    </label>
                                    <label className="space-y-1">
                                        <span className="text-xs font-bold text-slate-500">Weight Unit</span>
                                        <select
                                            name="unit"
                                            value={companyInfo.unit}
                                            onChange={handleInfoChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-dark"
                                        >
                                            <option>Kilograms (kg)</option>
                                            <option>Tons (t)</option>
                                            <option>Pounds (lb)</option>
                                        </select>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="max-w-xl space-y-6 animate-fade-in-up">
                            <h3 className="text-lg font-bold text-dark">Password & Auth</h3>
                            <button className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-dark hover:bg-slate-50 transition-colors">Change Password</button>

                            <hr className="border-slate-200" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-dark text-sm">Two-Factor Authentication</p>
                                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                                </div>
                                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
