import React, { useState, useRef, useEffect } from 'react';

const LiveChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I help you today?", sender: 'support', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = {
            id: messages.length + 1,
            text: newMessage,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setNewMessage("");

        // Simulate support response
        setTimeout(() => {
            const supportMsg = {
                id: messages.length + 2,
                text: "Thank you for your message. A support agent will be with you shortly.",
                sender: 'support',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, supportMsg]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h1 className="text-2xl font-bold text-dark dark:text-white mb-6">Live Support</h1>

            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-icons-outlined">support_agent</span>
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-dark dark:text-white">Support Team</h3>
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-gray-400">
                        <span className="material-icons-outlined">more_vert</span>
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-slate-900/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] lg:max-w-[60%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.sender === 'user'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300'
                                    }`}>
                                    {msg.sender === 'user' ? 'ME' : 'S'}
                                </div>
                                <div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <span className="material-icons-outlined">attach_file</span>
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-50 dark:bg-slate-900 border-none rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary text-sm text-dark dark:text-white placeholder:text-gray-400 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
                        >
                            <span className="material-icons-outlined text-lg">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LiveChat;
