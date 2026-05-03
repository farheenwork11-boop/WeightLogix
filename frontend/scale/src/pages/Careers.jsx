import React from 'react';

const Careers = () => {
    const jobs = [
        {
            title: 'Senior Full Stack Engineer',
            department: 'Engineering',
            location: 'Remote / NY',
            type: 'Full-time'
        },
        {
            title: 'Customer Success Manager',
            department: 'Sales',
            location: 'Remote',
            type: 'Full-time'
        },
        {
            title: 'Product Designer',
            department: 'Product',
            location: 'New York, NY',
            type: 'Full-time'
        }
    ];

    return (
        <div className="bg-bg-light min-h-screen font-sans">

            {/* Hero Section */}
            <div className="bg-dark text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight">
                        Build the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">Industry 4.0</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-10">
                        Join a passionate team dedicated to modernizing the world's weighing infrastructure. We're growing fast and looking for brilliant minds.
                    </p>
                    <button className="bg-white text-dark font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:-translate-y-1">
                        View Open Roles
                    </button>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-dark mb-16">Why Join WEIGHTLOGIX?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-blue-100 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                                🚀
                            </div>
                            <h3 className="text-xl font-bold mb-3">High Growth</h3>
                            <p className="text-gray-600">We're scaling (pun intended) rapidly. Lots of opportunity for ownership and career advancement.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                                🌍
                            </div>
                            <h3 className="text-xl font-bold mb-3">Remote First</h3>
                            <p className="text-gray-600">Work from anywhere. We care about output, not hours in a chair. We offer co-working stipends.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                                ❤️
                            </div>
                            <h3 className="text-xl font-bold mb-3">Great Benefits</h3>
                            <p className="text-gray-600">Competitive salary, equity, full health coverage, and a generous learning budget.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Open Roles */}
            <div className="bg-white py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-dark mb-12">Open Positions</h2>
                    <div className="space-y-4">
                        {jobs.map((job, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group bg-gray-50 hover:bg-white">
                                <div>
                                    <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors">{job.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{job.department} • {job.location}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex items-center gap-4">
                                    <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                                        {job.type}
                                    </span>
                                    <span className="text-primary opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                        Apply →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Careers;
