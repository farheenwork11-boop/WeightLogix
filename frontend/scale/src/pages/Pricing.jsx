import React, { useState } from 'react';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <div className="bg-bg-light min-h-screen py-24 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-dark mb-4 tracking-tight">
                    Flexible Plans for <span className="text-primary">Every Business</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                    Simple pricing. No hidden fees. Cancel anytime.
                </p>

                {/* Toggle (Monthly/Annual) */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-medium ${!isAnnual ? 'text-dark' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-16 h-8 bg-gray-200 rounded-full p-1 relative transition-colors duration-300 focus:outline-none"
                    >
                        <div className={`w-6 h-6 bg-primary rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-8' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-medium ${isAnnual ? 'text-dark' : 'text-gray-400'}`}>
                        Annual <span className="text-xs text-green-500 font-bold ml-1">(Save 20%)</span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

                {/* Basic Plan */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-dark">Basic</h3>
                        <p className="text-sm text-gray-500 mt-1">For small startups</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-dark">${isAnnual ? 24 : 29}</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <button className="w-full py-3 px-6 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors mb-8">
                        Get Started
                    </button>
                    <div className="flex-1">
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> 1 Branch</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> 1 Device</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Basic Reports</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Email Support</li>
                        </ul>
                    </div>
                </div>

                {/* Standard Plan (Popular) */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-primary relative transform md:-translate-y-4 md:scale-105 z-10 flex flex-col">
                    <div className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wide">
                        Most Popular
                    </div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-dark">Standard</h3>
                        <p className="text-sm text-gray-500 mt-1">For growing businesses</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-5xl font-extrabold text-primary">${isAnnual ? 69 : 79}</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <button className="w-full py-4 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mb-8">
                        Try Free for 14 Days
                    </button>
                    <div className="flex-1">
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Multi-Branch (Up to 5)</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> 5 Devices</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> All Reports & Analytics</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Priority Email Support</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Digital Slips</li>
                        </ul>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-dark">Premium</h3>
                        <p className="text-sm text-gray-500 mt-1">For large enterprises</p>
                    </div>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-dark">${isAnnual ? 129 : 149}</span>
                        <span className="text-gray-400">/mo</span>
                    </div>
                    <button className="w-full py-3 px-6 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors mb-8">
                        Contact Sales
                    </button>
                    <div className="flex-1">
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Unlimited Branches</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Unlimited Devices</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> AI Assistant</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> 24/7 Phone Support</li>
                            <li className="flex items-center gap-3"><span className="text-green-500">✓</span> Dedicated Account Manager</li>
                        </ul>
                    </div>
                </div>

            </div>

            {/* Comparison Table */}
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gray-50 p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-center text-dark">Compare Features</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-gray-100 bg-white sticky left-0 z-10 w-1/4">Feature</th>
                                <th className="p-4 border-b border-gray-100 text-center w-1/4 font-semibold text-gray-700">Basic</th>
                                <th className="p-4 border-b border-gray-100 text-center w-1/4 font-semibold text-primary bg-primary/5">Standard</th>
                                <th className="p-4 border-b border-gray-100 text-center w-1/4 font-semibold text-gray-700">Premium</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600">
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 border-b border-gray-100 font-medium sticky left-0 bg-white">Branches</td>
                                <td className="p-4 border-b border-gray-100 text-center">1</td>
                                <td className="p-4 border-b border-gray-100 text-center bg-primary/5 font-semibold text-primary">Up to 5</td>
                                <td className="p-4 border-b border-gray-100 text-center">Unlimited</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 border-b border-gray-100 font-medium sticky left-0 bg-white">Users</td>
                                <td className="p-4 border-b border-gray-100 text-center">2</td>
                                <td className="p-4 border-b border-gray-100 text-center bg-primary/5 font-semibold text-primary">10</td>
                                <td className="p-4 border-b border-gray-100 text-center">Unlimited</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 border-b border-gray-100 font-medium sticky left-0 bg-white">Support</td>
                                <td className="p-4 border-b border-gray-100 text-center">Email</td>
                                <td className="p-4 border-b border-gray-100 text-center bg-primary/5 font-semibold text-primary">Priority Email</td>
                                <td className="p-4 border-b border-gray-100 text-center">24/7 Phone</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 border-b border-gray-100 font-medium sticky left-0 bg-white">API Access</td>
                                <td className="p-4 border-b border-gray-100 text-center text-gray-300">—</td>
                                <td className="p-4 border-b border-gray-100 text-center bg-primary/5 font-semibold text-primary">✓</td>
                                <td className="p-4 border-b border-gray-100 text-center">✓</td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                                <td className="p-4 border-b border-gray-100 font-medium sticky left-0 bg-white">AI Insights</td>
                                <td className="p-4 border-b border-gray-100 text-center text-gray-300">—</td>
                                <td className="p-4 border-b border-gray-100 text-center bg-primary/5 text-gray-400">—</td>
                                <td className="p-4 border-b border-gray-100 text-center">✓</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
