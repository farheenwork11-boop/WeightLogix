import React from 'react';

const Roadmap = () => {
    const milestones = [
        {
            quarter: 'Q1 2026',
            title: 'AI Analytics Beta',
            description: 'Early access to our predictive maintenance AI models for premium users.',
            status: 'In Progress',
            statusColor: 'bg-blue-100 text-blue-800'
        },
        {
            quarter: 'Q2 2026',
            title: 'Mobile App Launch',
            description: 'Native iOS and Android applications for on-the-go weighbridge management.',
            status: 'Planned',
            statusColor: 'bg-gray-100 text-gray-800'
        },
        {
            quarter: 'Q3 2026',
            title: 'IoT Integration V2',
            description: 'Direct support for 50+ new indicators and deeper hardware integration.',
            status: 'Planned',
            statusColor: 'bg-gray-100 text-gray-800'
        },
        {
            quarter: 'Q4 2026',
            title: 'Enterprise API',
            description: 'Full REST API access for custom integrations with ERP systems like SAP and Oracle.',
            status: 'Future',
            statusColor: 'bg-purple-100 text-purple-800'
        }
    ];

    const completed = [
        {
            quarter: 'Q4 2025',
            title: 'Digital Slips Launch',
            description: 'Fully legally compliant digital weight slips with PDF export.',
            status: 'Completed',
            statusColor: 'bg-green-100 text-green-800'
        },
        {
            quarter: 'Q3 2025',
            title: 'Multi-Branch Support',
            description: 'Centralized dashboard for managing unlimited locations.',
            status: 'Completed',
            statusColor: 'bg-green-100 text-green-800'
        }
    ];

    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="text-center max-w-4xl mx-auto mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-dark mb-6 tracking-tight">
                    Product Roadmap
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    See where we're heading. We are constantly building to make WEIGHTLOGIX the operating system for the weighing industry.
                </p>
            </div>

            <div className="max-w-5xl mx-auto">

                {/* Upcoming Section */}
                <h2 className="text-2xl font-bold text-dark mb-8 pl-4 border-l-4 border-primary">Upcoming Milestones</h2>
                <div className="relative border-l-2 border-gray-200 ml-4 md:ml-8 mb-16 space-y-12">
                    {milestones.map((milestone, index) => (
                        <div key={index} className="relative pl-8 md:pl-12">
                            {/* Timeline Dot */}
                            <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white bg-primary shadow-sm"></div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{milestone.quarter}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${milestone.statusColor}`}>
                                        {milestone.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-2">{milestone.title}</h3>
                                <p className="text-gray-600">{milestone.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Completed Section */}
                <h2 className="text-2xl font-bold text-dark mb-8 pl-4 border-l-4 border-green-500">Recently Completed</h2>
                <div className="border-l-2 border-green-200 ml-4 md:ml-8 space-y-12 pb-12">
                    {completed.map((item, index) => (
                        <div key={index} className="relative pl-8 md:pl-12">
                            <div className="absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white bg-green-500 shadow-sm"></div>
                            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{item.quarter}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-dark mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* CTA */}
            <div className="max-w-4xl mx-auto text-center mt-16 p-12 bg-dark rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-4">Have a feature request?</h2>
                    <p className="mb-8 text-gray-300">We build for you. Let us know what would make your life easier.</p>
                    <button className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full transition-colors">
                        Submit Idea
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Roadmap;
