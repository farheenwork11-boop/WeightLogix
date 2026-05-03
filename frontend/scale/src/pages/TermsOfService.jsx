import React from 'react';

const TermsOfService = () => {
    return (
        <div className="bg-bg-light min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16">
                <h1 className="text-4xl font-extrabold text-dark mb-2">Terms of Service</h1>
                <p className="text-gray-500 mb-12">Last updated: December 28, 2025</p>

                <div className="prose prose-blue max-w-none text-gray-700">
                    <p className="lead text-lg">
                        Please read these Terms of Service ("Terms") carefully before using the WEIGHTLOGIX platform operated by us.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">2. Subscriptions</h2>
                    <p>
                        Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis (such as monthly or annually).
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">3. Content</h2>
                    <p>
                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">4. Termination</h2>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>

                    <h2 className="text-2xl font-bold text-dark mt-10 mb-4">5. Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of New York, United States, without regard to its conflict of law provisions.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
