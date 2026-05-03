import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
    const posts = [
        {
            id: 1,
            title: 'How to Improve Weighbridge Accuracy',
            excerpt: 'Accuracy is money. Learn the top 5 maintenance tips to ensure your weighbridge is always precise.',
            date: 'Dec 2, 2025',
            category: 'Maintenance',
            image: 'bg-blue-100', // Placeholder class
        },
        {
            id: 2,
            title: 'The Future of Scale Management is Cloud',
            excerpt: 'Why moving your data to the cloud is safer, faster, and more efficient than local storage.',
            date: 'Nov 28, 2025',
            category: 'Technology',
            image: 'bg-purple-100',
        },
        {
            id: 3,
            title: ' Understanding Digital Slips Compliance',
            excerpt: 'Are digital slips legal? A deep dive into the regulations and how WEIGHTLOGIX keeps you compliant.',
            date: 'Nov 15, 2025',
            category: 'Compliance',
            image: 'bg-green-100',
        },
        {
            id: 4,
            title: 'Optimizing Truck Flow in Busy Yards',
            excerpt: 'Reduce waiting times and improve throughput with these simple operational tweaks.',
            date: 'Nov 10, 2025',
            category: 'Operations',
            image: 'bg-orange-100',
        },
    ];

    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Header & Search */}
            <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2">Our Blog</h1>
                    <p className="text-gray-500">Latest insights, tips, and news from the industry.</p>
                </div>
                <div className="w-full md:w-auto relative group">
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full md:w-80 pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm group-hover:shadow-md"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                </div>
            </div>

            {/* Featured Post (First one) */}
            <div className="max-w-7xl mx-auto mb-16">
                <Link to={`/blog/${posts[0].id}`} className="group relative block rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                    <div className={`absolute inset-0 ${posts[0].image} bg-center bg-cover transition-transform duration-700 group-hover:scale-105`}>
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 text-white">
                        <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                            {posts[0].category}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                            {posts[0].title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                            <span>{posts[0].date}</span>
                            <span>•</span>
                            <span>5 min read</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Grid of Posts */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(1).map((post) => (
                    <Link key={post.id} to={`/blog/${post.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                        <div className={`h-48 ${post.image} relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold text-primary uppercase tracking-wide">{post.category}</span>
                                <span className="text-xs text-gray-400">{post.date}</span>
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                {post.excerpt}
                            </p>
                            <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                Read Article <span>→</span>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            <div className="max-w-7xl mx-auto mt-16 flex justify-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-lg">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 font-medium transition-colors">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 font-medium transition-colors">3</button>
                <span className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 font-medium transition-colors">→</button>
            </div>

        </div>
    );
};

export default Blog;
