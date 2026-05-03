import React from 'react';

const Features = () => {
    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-6 tracking-tight">
                    Powerful Features for <span className="text-secondary bg-clip-text text-transparent bg-gradient-to-r from-secondary to-accent">Modern Weighing</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Everything you need to manage your weighbridge operations efficiently, securely, and from anywhere.
                </p>
            </div>

            {/* Feature 1: Digital Slips */}
            <div className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row items-center gap-12 group">
                <div className="w-full md:w-1/2 order-2 md:order-1 transition-transform duration-500 hover:scale-[1.02]">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        {/* Abstract Placeholder for Screenshot */}
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 aspect-video flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-primary/5"></div>
                            <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs w-full mx-auto relative z-10">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-5/6 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</div>
                                    <div className="h-2 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                    <div className="bg-white p-2 rounded-lg inline-block mb-4 shadow-sm">
                        <span className="text-2xl">📄</span>
                    </div>
                    <h2 className="text-3xl font-bold text-dark mb-4">Digital Slips</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        Create, manage, and share weight slips instantly. Say goodbye to paper clutter and lost records. Our digital slips are secure, searchable, and always accessible.
                    </p>
                    <ul className="space-y-3 mb-8 text-gray-600">
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Create in seconds
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> PDF export & email sharing
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> QR code verification
                        </li>
                    </ul>
                    <button className="text-primary font-bold hover:text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-2">
                        Try Digital Slips <span className="text-xl">→</span>
                    </button>
                </div>
            </div>

            {/* Feature 2: Multi-Branch (Reversed Layout) */}
            <div className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row items-center gap-12 group">
                <div className="w-full md:w-1/2">
                    <div className="bg-white p-2 rounded-lg inline-block mb-4 shadow-sm">
                        <span className="text-2xl">🏢</span>
                    </div>
                    <h2 className="text-3xl font-bold text-dark mb-4">Multi-Branch Management</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        Scale your business without the headache. Manage unlimited locations from a single dashboard. Real-time synchronization keeps everyone on the same page.
                    </p>
                    <ul className="space-y-3 mb-8 text-gray-600">
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Centralized dashboard
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Role-based access control
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Aggregate reporting
                        </li>
                    </ul>
                    <button className="text-primary font-bold hover:text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-2">
                        Explore Multi-Branch <span className="text-xl">→</span>
                    </button>
                </div>
                <div className="w-full md:w-1/2 transition-transform duration-500 hover:scale-[1.02]">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        {/* Abstract Placeholder for Screenshot */}
                        <div className="bg-gradient-to-bl from-primary/10 to-blue-50 aspect-video flex items-center justify-center relative">
                            {/* Dashboard Grid Representation */}
                            <div className="grid grid-cols-2 gap-4 w-3/4">
                                <div className="bg-white p-4 rounded shadow-md h-24 flex flex-col justify-between">
                                    <div className="w-8 h-8 rounded bg-blue-100"></div>
                                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                                </div>
                                <div className="bg-white p-4 rounded shadow-md h-24 flex flex-col justify-between">
                                    <div className="w-8 h-8 rounded bg-green-100"></div>
                                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                                </div>
                                <div className="bg-white p-4 rounded shadow-md h-24 col-span-2 flex items-center justify-center">
                                    <div className="w-full h-12 bg-gray-50 rounded opacity-50"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 3: Smart Reports */}
            <div className="max-w-7xl mx-auto mb-24 flex flex-col md:flex-row items-center gap-12 group">
                <div className="w-full md:w-1/2 order-2 md:order-1 transition-transform duration-500 hover:scale-[1.02]">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                        {/* Abstract Placeholder for Screenshot */}
                        <div className="bg-gradient-to-tr from-accent/10 to-purple-50 aspect-video flex items-center justify-center relative">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
                                {/* Chart Representation */}
                                <div className="flex items-end justify-between h-32 gap-2 mt-4 px-4 pb-2 border-b border-gray-200">
                                    <div className="w-8 bg-blue-400 h-[40%] rounded-t"></div>
                                    <div className="w-8 bg-primary h-[70%] rounded-t"></div>
                                    <div className="w-8 bg-primary h-[50%] rounded-t"></div>
                                    <div className="w-8 bg-secondary h-[90%] rounded-t"></div>
                                </div>
                                <div className="h-2 w-1/3 bg-gray-200 rounded mt-2 mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                    <div className="bg-white p-2 rounded-lg inline-block mb-4 shadow-sm">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h2 className="text-3xl font-bold text-dark mb-4">Smart Reports</h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        Make data-driven decisions with automatic daily and monthly reports. Visualize trends, track efficiency, and export everything to Excel or PDF.
                    </p>
                    <ul className="space-y-3 mb-8 text-gray-600">
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Automated scheduling
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Advanced filtering
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-green-500 font-bold">✓</span> Visual analytics
                        </li>
                    </ul>
                    <button className="text-primary font-bold hover:text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-2">
                        See Reports in Action <span className="text-xl">→</span>
                    </button>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary rounded-3xl p-12 text-center text-white max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>

                <h2 className="text-3xl sm:text-4xl font-bold mb-6 relative z-10">Ready to modernize your weighing?</h2>
                <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
                    Join hundreds of businesses trusting WEIGHTLOGIX. Start your free trial today.
                </p>
                <button className="bg-white text-primary font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all transform hover:-translate-y-1 relative z-10">
                    Start Free Trial
                </button>
            </div>
        </div>
    );
};

export default Features;
