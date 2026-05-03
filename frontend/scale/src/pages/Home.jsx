import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PremiumBarChart from '../components/home/PremiumBarChart';

// Animated Counter Component
const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
          
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}{suffix}
    </span>
  );
};

const Home = () => {
  // Static counter values
  const [counters] = useState({
    trucks: 10000,
    accuracy: 99.9,
    clients: 500
  });

  const features = [
    {
      title: "Real-time Weight Monitoring",
      description: "Live tracking of vehicle weights with instant alerts",
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Automated Reporting",
      description: "Generate comprehensive reports automatically",
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Data Security",
      description: "Enterprise-grade encryption and secure storage",
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: "Cloud Integration",
      description: "Seamless cloud sync across all devices",
      icon: (
        <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    }
  ];

  const industries = [
    { 
      name: "Logistics", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: "Fleet management & tracking" 
    },
    { 
      name: "Manufacturing", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      desc: "Production weight monitoring" 
    },
    { 
      name: "Mining", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      desc: "Resource extraction tracking" 
    },
    { 
      name: "Agriculture", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      desc: "Harvest and transport weighing" 
    },
    { 
      name: "Construction", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.548-.99 3.19-.99 4.732 0 1.547.99 1.547 2.613 0 3.603a1.724 1.724 0 00-1.065 2.572c.99 1.547.99 3.19 0 4.732-1.065 1.547-2.613 1.547-3.603 0a1.724 1.724 0 00-2.572 1.065c-.99-1.548-.99-3.19 0-4.732 1.065-1.547 2.613-1.547 3.603 0a1.724 1.724 0 002.572-1.065c.99-1.548.99-3.19 0-4.732-1.065-1.547-2.613-1.547-3.603 0a1.724 1.724 0 00-1.065-2.572c-.99-1.548-2.538-1.548-3.588 0a1.724 1.724 0 00-2.572 1.065c-.99 1.547-.99 3.19 0 4.732 1.065 1.547 2.613 1.547 3.603 0a1.724 1.724 0 001.065-2.572c-.99-1.548-.99-3.19 0-4.732 1.065-1.547-1.548-1.547-2.572-1.065z" />
        </svg>
      ),
      desc: "Material and equipment tracking" 
    },
    { 
      name: "Waste Management", 
      icon: (
        <svg className="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      desc: "Waste collection monitoring" 
    }
  ];

  const testimonials = [
    {
      name: "Robert Chen",
      company: "Global Logistics Inc",
      rating: 5,
      feedback: "This system reduced our weighing errors by 95% and saved us 10 hours daily."
    },
    {
      name: "Sarah Johnson",
      company: "Industrial Manufacturing",
      rating: 5,
      feedback: "The real-time monitoring has transformed our operational efficiency completely."
    },
    {
      name: "Michael Torres",
      company: "Mining Solutions Ltd",
      rating: 5,
      feedback: "Best investment we've made for our heavy machinery operations."
    }
  ];

  return (
    <div className="home-page overflow-x-hidden font-sans">
      {/* HERO SECTION WITH PREMIUM GRAPH */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary via-primary-light to-primary text-white overflow-hidden py-12">
        {/* Premium background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        </div>
        
        {/* Animated glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Side - Premium Content */}
            <div className="space-y-6 animate-fade-in-up flex flex-col justify-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold border border-white/30 shadow-xl w-fit">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="tracking-widest uppercase">INDUSTRIAL WEIGHING SOLUTIONS</span>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                  <span className="block">Advanced</span>
                  <span className="block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent drop-shadow-2xl">
                    Weighbridge
                  </span>
                  <span className="block">Technology</span>
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-white to-white/50 rounded-full"></div>
              </div>
              
              <p className="text-base text-white/90 leading-relaxed font-medium max-w-lg">
                Transform your operations with <span className="text-white font-bold">enterprise-grade</span> truck weighing systems. 
                Featuring <span className="text-white font-bold">AI-powered analytics</span>, real-time monitoring, and 
                <span className="text-white font-bold">99.9% accuracy</span> for industrial excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/auth" 
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-white text-primary font-black text-sm rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:scale-105 border-2 border-white"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Request Quote
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                <a 
                  href="#demo" 
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold text-sm rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white hover:text-primary hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] hover:-translate-y-1 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View Products
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>

              {/* Premium Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                <div>
                  <div className="text-2xl font-black text-white">10K+</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Trucks Daily</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">99.9%</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">500+</div>
                  <div className="text-xs text-white/70 font-medium mt-1">Clients</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Premium Enhanced Graph */}
            <div className="relative animate-fade-in-up flex items-center justify-center" style={{animationDelay: '0.3s'}}>
              <div className="w-full max-w-xl">
                <div className="absolute -inset-4 bg-gradient-to-r from-white/20 via-white/10 to-white/20 rounded-3xl blur-2xl"></div>
                <div className="relative">
                  <PremiumBarChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & STATS STRIP */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
              Numbers That Speak For Themselves
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              Trusted by industry leaders for precision weighing solutions
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Stat 1 */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 04.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                <AnimatedCounter target={10000} suffix="+" />
              </div>
              <div className="text-gray-700 font-semibold text-base">Trucks Managed</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                <AnimatedCounter target={99.9} suffix="%" decimals={1} />
              </div>
              <div className="text-gray-700 font-semibold text-base">Accuracy Rate</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                <AnimatedCounter target={24} suffix="/7" />
              </div>
              <div className="text-gray-700 font-semibold text-base">Monitoring</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                <AnimatedCounter target={500} suffix="+" />
              </div>
              <div className="text-gray-700 font-semibold text-base">Industrial Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES PREVIEW */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Precision-Driven Smart Features
            </h2>
            <p className="text-xl text-medium max-w-2xl mx-auto">
              Advanced technology for industrial weighing operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 card-hover text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-primary-hover transition-colors duration-300">{feature.title}</h3>
                <p className="text-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES SECTION */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Every Heavy Industry
            </h2>
            <p className="text-xl text-white/80">
              Trusted across multiple industrial sectors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="group bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2 card-hover text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-white/30 group-hover:to-white/20 transition-all duration-300">
                  {industry.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">{industry.name}</h3>
                <p className="text-white/70 text-sm">{industry.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white text-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,51,98,0.05)_0%,transparent_70%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-primary">
                Complete Control in One Unified Dashboard
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-medium">Live weighbridge monitoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-medium">Entry & exit logs with timestamps</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-medium">AI-powered analytics and insights</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <span className="text-medium">Secure cloud storage with backup</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-primary text-lg">Recent Weighings</h3>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="text-green-600 text-sm font-semibold">Online</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="flex justify-between">
                    <span className="font-semibold text-dark">Truck #ABC-123</span>
                    <span className="text-primary font-bold">45,200 kg</span>
                  </div>
                  <div className="text-sm text-medium mt-1">2 minutes ago</div>
                </div>
                
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="flex justify-between">
                    <span className="font-semibold text-dark">Truck #XYZ-789</span>
                    <span className="text-primary font-bold">38,750 kg</span>
                  </div>
                  <div className="text-sm text-medium mt-1">5 minutes ago</div>
                </div>
                
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4 border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="flex justify-between">
                    <span className="font-semibold text-dark">Truck #DEF-456</span>
                    <span className="text-primary font-bold">41,300 kg</span>
                  </div>
                  <div className="text-sm text-medium mt-1">12 minutes ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-medium">
              Simple 3-step process for automated truck weighing
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2"></div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                { step: 1, title: "Truck Entry Detection", desc: "Vehicle enters weighbridge zone" },
                { step: 2, title: "Automatic Weight Capture", desc: "System captures weight data instantly" },
                { step: 3, title: "Instant Report Generation", desc: "Digital reports created automatically" }
              ].map((item, index) => (
                <div key={index} className="text-center relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{item.title}</h3>
                  <p className="text-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gradient-to-br from-secondary to-secondary/90 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-white/80">
              Hear from our satisfied industrial clients
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-bg-card/10 backdrop-blur-sm p-8 text-center card-hover border border-white/20 rounded-2xl"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary text-xl">★</span>
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.feedback}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-white/80 text-sm">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-secondary to-secondary/90 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_0%,transparent_70%)]"></div>
        
        <div className="absolute top-16 left-12 w-40 h-40 bg-bg-card/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-12 w-52 h-52 bg-bg-card/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Ready to Modernize Your <span className="text-secondary">Truck Weighing</span> Operations?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of industrial companies transforming their operations with our smart weighing system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-secondary to-secondary/90 text-white font-bold rounded-xl text-lg overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-orange/30 hover:-translate-y-1 border border-orange/40 hover:border-orange/60">
              <span className="relative z-10">Start Free Consultation</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Link>
            <a href="#demo" className="relative inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-orange text-secondary font-bold rounded-xl text-lg overflow-hidden group transition-all duration-300 hover:bg-secondary hover:text-dark hover:shadow-orange/30 hover:-translate-y-1">
              <span className="relative z-10">Watch Product Demo</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;