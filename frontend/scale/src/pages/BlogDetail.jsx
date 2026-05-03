import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BlogDetail = () => {
    const { id } = useParams();

    // In a real app, you'd fetch data based on ID. 
    // For now, we'll static render a generic detailed view.

    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 font-sans">

            {/* Article Header */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <span className="inline-block bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
                    Maintenance
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-8 leading-tight">
                    How to Improve Weighbridge Accuracy
                </h1>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                        <span className="font-medium text-dark">John Doe</span>
                    </div>
                    <span>•</span>
                    <span>Dec 2, 2025</span>
                    <span>•</span>
                    <span>5 min read</span>
                </div>
            </div>

            {/* Featured Image */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="w-full h-[400px] md:h-[500px] rounded-3xl bg-gray-200 overflow-hidden shadow-xl">
                    {/* Placeholder for real image */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🖼️ Article Image</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg prose-blue text-gray-700 leading-relaxed mb-16">
                <p className="lead text-xl text-gray-500 font-light mb-8">
                    Accuracy isn't just about compliance; it's about profitability. Even a small error margin can translate to significant losses over thousands of transactions. Here is how you can ensure your equipment stays precise.
                </p>

                <h2 className="text-2xl font-bold text-dark mt-12 mb-4">1. Regular Calibration</h2>
                <p className="mb-6">
                    Calibration should not be a once-a-year event just for the inspector. Regular self-checks with known weights can spot drift early. We recommend a monthly checking schedule for high-volume bridges.
                </p>

                <h2 className="text-2xl font-bold text-dark mt-12 mb-4">2. Cleanliness is Key</h2>
                <p className="mb-6">
                    Debris, mud, and water accumulation can affect the load cells. Ensure the pit is clean and drainage is working correctly. A simple daily visual inspection can save thousands in repairs.
                </p>

                <div className="bg-blue-50 border-l-4 border-primary p-6 my-8 rounded-r-lg">
                    <p className="font-medium text-blue-900 italic">
                        "Preventative maintenance is 10x cheaper than reactive repairs."
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-dark mt-12 mb-4">3. Check Load Cells</h2>
                <p className="mb-6">
                    Modern digital load cells, like the ones WEIGHTLOGIX integrates with, provide diagnostics. Monitor these for error codes or inconsistent readings between cells.
                </p>

                <h2 className="text-2xl font-bold text-dark mt-12 mb-4">Conclusion</h2>
                <p className="mb-6">
                    Maintaining your weighbridge is maintaining your bottom line. With digital tools like WEIGHTLOGIX, you can track maintenance schedules and spot anomalies before they become problems.
                </p>
            </article>

            {/* Share & Tags */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 border-t border-gray-200 pt-8 flex justify-between items-center">
                <div className="flex gap-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">#Maintenance</span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">#Weighbridge</span>
                </div>
                <div className="flex gap-4">
                    <button className="text-gray-400 hover:text-primary transition-colors">Share</button>
                    <button className="text-gray-400 hover:text-primary transition-colors">Tweet</button>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-white py-16 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-dark mb-8">Related Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="h-48 rounded-xl bg-gray-100 mb-4 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                                </div>
                                <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Another Great Article Title {i}</h4>
                                <p className="text-sm text-gray-500">Nov {10 + i}, 2025</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BlogDetail;
