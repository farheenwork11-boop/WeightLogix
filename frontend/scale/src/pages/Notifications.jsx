import React, { useState } from 'react';

const Notifications = () => {
    const [filter, setFilter] = useState('All');

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'System Update Scheduled', message: 'Main server maintenance scheduled for tonight at 2:00 AM.', time: '2 hours ago', type: 'info', read: false },
        { id: 2, title: 'Device Disconnected', message: 'Scale #3 (North Warehouse) has lost connection.', time: '4 hours ago', type: 'alert', read: false },
        { id: 3, title: 'New User Registered', message: 'Bilal Khan (Manager) requested access approval.', time: '5 hours ago', type: 'success', read: true },
        { id: 4, title: 'Calibration Due', message: 'City Weighbridge scale calibration is due in 3 days.', time: '1 day ago', type: 'warning', read: true },
        { id: 5, title: 'Backup Completed', message: 'Daily database backup completed successfully.', time: '1 day ago', type: 'success', read: true },
    ]);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'All') return true;
        if (filter === 'Unread') return !n.read;
        if (filter === 'Archived') return false; // Mock archive
        return true;
    });

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-dark dark:text-white">Notifications</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with system alerts and activities.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                        Mark all as read
                    </button>
                    <button className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        Settings
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-1">
                {['All', 'Unread', 'Archived'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all relative ${filter === f
                                ? 'text-primary bg-primary/5 dark:bg-primary/20'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {f}
                        {f === 'Unread' && notifications.some(n => !n.read) && (
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        )}
                        {filter === f && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full translate-y-1"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? filteredNotifications.map((notif) => (
                    <div
                        key={notif.id}
                        className={`group p-4 rounded-xl border transition-all ${notif.read
                                ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 opacity-80 hover:opacity-100'
                                : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm'
                            }`}
                    >
                        <div className="flex gap-4">
                            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                    notif.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        notif.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                                }`}>
                                <span className="material-icons-outlined text-xl">
                                    {notif.type === 'alert' ? 'error_outline' :
                                        notif.type === 'warning' ? 'warning_amber' :
                                            notif.type === 'success' ? 'check_circle' : 'info'}
                                </span>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-sm ${!notif.read ? 'text-dark dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-2">{notif.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notif.read && (
                                    <button
                                        onClick={() => markAsRead(notif.id)}
                                        className="p-1.5 text-primary hover:bg-primary-light dark:hover:bg-primary/20 rounded-lg tooltip-trigger"
                                        title="Mark as read"
                                    >
                                        <span className="material-icons-outlined text-lg">drafts</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    title="Delete"
                                >
                                    <span className="material-icons-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-slate-600">
                            <span className="material-icons-outlined text-4xl">notifications_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2">You're all caught up! Check back later for new alerts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
