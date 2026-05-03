import React from 'react';

const Help = () => {
    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto">
            <h1 className="text-2xl font-bold text-dark dark:text-white">Help Center</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Documentation Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-dark dark:text-white mb-4">Documentation</h3>
                    <div className="space-y-3">
                        {['Getting Started Guide', 'How to Connect Scale', 'Troubleshooting Connection', 'User Roles Explained', 'Exporting Reports', 'Managing Branches'].map((item, i) => (
                            <a key={i} href="#" className="block p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-between group">
                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-primary">{item}</span>
                                <span className="material-icons-outlined text-gray-400 group-hover:text-primary transition-colors">arrow_forward</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-dark dark:text-white mb-4">Contact Support</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Need immediate assistance? Our support team is available 24/7.</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                                <span className="material-icons-outlined">phone</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Phone Support</p>
                                <p className="font-bold text-dark dark:text-white">+92 300 1234567</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                                <span className="material-icons-outlined">email</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Email Support</p>
                                <p className="font-bold text-dark dark:text-white">support@scalemaster.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center">
                                <span className="material-icons-outlined">chat</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Live Chat</p>
                                <p className="font-bold text-dark dark:text-white">Available (Est wait: 2 mins)</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.href = '/live-chat'}
                        className="w-full mt-8 py-3 bg-dark dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-slate-600 transition-colors shadow-lg"
                    >
                        Start Live Chat
                    </button>
                </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 text-center">
                <h3 className="text-lg font-bold text-primary mb-2">Did you know?</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">You can use keyboard shortcuts to navigate faster. Press <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-600 font-mono text-xs">Ctrl + /</kbd> to view all shortcuts.</p>
            </div>
        </div>
    );
};

export default Help;
