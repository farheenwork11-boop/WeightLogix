import React from 'react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-bg-light pt-24 pb-12 font-sans flex items-center justify-center px-4">
            <div className="max-w-7xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">

                {/* Left Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <h1 className="text-4xl font-extrabold text-dark mb-2">Get in Touch</h1>
                    <p className="text-gray-500 mb-10">We'd love to hear from you. Please fill out this form.</p>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    id="name"
                                    className="peer w-full border-b-2 border-gray-200 py-3 text-dark focus:outline-none focus:border-primary transition-colors bg-transparent pt-6"
                                    placeholder=" "
                                />
                                <label htmlFor="name" className="absolute left-0 top-2 text-xs text-gray-400 font-bold uppercase transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-bold">
                                    Full Name
                                </label>
                            </div>
                            <div className="relative group">
                                <input
                                    type="email"
                                    id="email"
                                    className="peer w-full border-b-2 border-gray-200 py-3 text-dark focus:outline-none focus:border-primary transition-colors bg-transparent pt-6"
                                    placeholder=" "
                                />
                                <label htmlFor="email" className="absolute left-0 top-2 text-xs text-gray-400 font-bold uppercase transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-bold">
                                    Email Address
                                </label>
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                id="subject"
                                className="peer w-full border-b-2 border-gray-200 py-3 text-dark focus:outline-none focus:border-primary transition-colors bg-transparent pt-6"
                                placeholder=" "
                            />
                            <label htmlFor="subject" className="absolute left-0 top-2 text-xs text-gray-400 font-bold uppercase transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-bold">
                                Subject
                            </label>
                        </div>

                        <div className="relative group">
                            <textarea
                                id="message"
                                rows="4"
                                className="peer w-full border-b-2 border-gray-200 py-3 text-dark focus:outline-none focus:border-primary transition-colors bg-transparent pt-6 resize-none"
                                placeholder=" "
                            ></textarea>
                            <label htmlFor="message" className="absolute left-0 top-2 text-xs text-gray-400 font-bold uppercase transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:font-bold">
                                Message
                            </label>
                        </div>

                        <button type="submit" className="mt-8 bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all w-full md:w-auto">
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Right Side: Contact Info & Map */}
                <div className="w-full md:w-1/2 bg-dark text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-1">Address</h3>
                                    <p>123 Weighbridge Lane,<br />Industrial District, NY 10001</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-1">Email</h3>
                                    <p className="text-blue-300 hover:text-white transition-colors cursor-pointer">support@scalemaster.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-1">Phone</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="relative mt-12 h-48 w-full rounded-2xl overflow-hidden bg-gray-800">
                        {/* This would be an iframe map in production */}
                        <div className="absolute inset-0 opacity-50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center grayscale invert"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-white text-dark font-bold text-xs py-2 px-4 rounded shadow-lg uppercase tracking-wider">
                                View Larger Map
                            </button>
                        </div>
                        {/* Pin */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full -mt-2">
                            <svg className="w-8 h-8 text-secondary drop-shadow-xl" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
