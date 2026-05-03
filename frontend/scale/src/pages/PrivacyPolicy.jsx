import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16">
                <h1 className="text-4xl font-extrabold text-dark mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-12">Last updated: December 28, 2025</p>

                <div className="prose prose-blue max-w-none text-gray-700">
                    <p className="lead text-lg">
                        At WEIGHTLOGIX, we take your privacy seriously. This Privacy Policy describes how we collect, use, and protect your personal information when you use our SaaS platform.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account, update your profile, or use the interactive features of our Service. This may include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Name, email address, and contact details.</li>
                        <li>Company information and weighing data.</li>
                        <li>Payment information (processed securely by our third-party payment providers).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services, including to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Process transactions and send related information.</li>
                        <li>Send you technical notices, updates, and support messages.</li>
                        <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">3. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect specific data from unauthorized access, accidental loss, or destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">4. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@scalemaster.com" className="text-primary hover:underline">privacy@scalemaster.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
