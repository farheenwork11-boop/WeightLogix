import { useEffect } from 'react';

const About = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const team = [
        {
            name: "Alex Morgan",
            role: "Founder & CEO",
            bio: "Visionary leader with 15+ years in industrial automation.",
            image: "AM"
        },
        {
            name: "Sarah Chen",
            role: "Co-Founder & CTO",
            bio: "Tech expert passionate about scalable software architectures.",
            image: "SC"
        },
        {
            name: "David Kim",
            role: "Head of Product",
            bio: "Focused on delivering intuitive and powerful user experiences.",
            image: "DK"
        },
        {
            name: "Jessica Lee",
            role: "Head of Growth",
            bio: "Driving customer success and market expansion globally.",
            image: "JL"
        }
    ];

    const timeline = [
        { year: "2020", title: "Inception", description: "WEIGHTLOGIX was born out of a need for better weighing systems." },
        { year: "2021", title: "First Launch", description: "Launched our MVP and onboarded our first 50 enterprise clients." },
        { year: "2023", title: "Global Expansion", description: "Expanded operations to 3 continents and reached 10k users." },
        { year: "2024", title: "Market Leader", description: "Recognized as the top Scale Management SaaS in the industry." }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="relative py-24 bg-primary text-white overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">Who We Are</h1>
                    <p className="text-xl max-w-2xl mx-auto text-blue-100 animate-fade-in-up animation-delay-100">
                        Pioneering the future of industrial weighing operations through innovation and trust.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-bg-light rounded-2xl p-12 border border-gray-100 relative shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div className="absolute -top-6 -left-6 text-6xl text-primary opacity-20">❝</div>
                        <h2 className="text-3xl font-bold text-dark mb-6 text-center">Our Mission</h2>
                        <p className="text-xl text-medium text-center leading-relaxed">
                            We help businesses digitize their weighing operations, ensuring accuracy, efficiency, and transparency in every transaction. We believe in building technology that empowers industries to scale without limits.
                        </p>
                        <div className="absolute -bottom-6 -right-6 text-6xl text-primary opacity-20 rotate-180">❝</div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-dark mb-4">Meet the Minds</h2>
                        <p className="text-medium text-lg">The passionate team behind WEIGHTLOGIX.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-xl p-8 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl border border-gray-100 group">
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-md group-hover:scale-110 transition-transform">
                                    {member.image}
                                </div>
                                <h3 className="text-xl font-bold text-dark text-center mb-2">{member.name}</h3>
                                <h4 className="text-primary text-sm font-semibold uppercase tracking-wide text-center mb-4">{member.role}</h4>
                                <p className="text-medium text-center text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History Section */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-dark mb-4">Our Journey</h2>
                        <p className="text-medium text-lg">From a simple idea to a global platform.</p>
                    </div>
                    <div className="relative max-w-4xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-100 hidden md:block"></div>

                        <div className="space-y-12">
                            {timeline.map((item, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center justify-between relative ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="w-full md:w-5/12"></div>
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full border-4 border-white shadow-md z-10 hidden md:block"></div>
                                    <div className="w-full md:w-5/12 bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <span className="text-accent font-bold text-xl block mb-2">{item.year}</span>
                                        <h3 className="text-lg font-bold text-dark mb-2">{item.title}</h3>
                                        <p className="text-medium text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 bg-primary text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                            <div className="text-3xl mb-4">📍</div>
                            <h3 className="font-bold mb-2">Visit Us</h3>
                            <p className="text-blue-100">123 Innovation Dr,<br />Tech City, TC 90210</p>
                        </div>
                        <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                            <div className="text-3xl mb-4">📧</div>
                            <h3 className="font-bold mb-2">Email Us</h3>
                            <p className="text-blue-100">hello@scalemaster.com<br />support@scalemaster.com</p>
                        </div>
                        <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                            <div className="text-3xl mb-4">📞</div>
                            <h3 className="font-bold mb-2">Call Us</h3>
                            <p className="text-blue-100">+1 (555) 123-4567<br />Mon-Fri, 9am-6pm EST</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
