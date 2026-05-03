import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md py-3">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="logo">
          <Link to="/" className="text-3xl font-black text-primary tracking-tight">WEIGHTLOGIX</Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-10 items-center">
          <Link to="/" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/about" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/features" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Features
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/pricing" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Pricing
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/blog" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/contact" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/dashboard" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Dashboard
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <Link to="/auth" className="text-dark font-semibold hover:text-primary transition-all duration-300 relative group px-1 py-2">
            Login
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
          </Link>
          <Link to="/auth" className="relative inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 border-2 border-primary">
            <span className="relative z-10">Sign Up</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3 text-primary focus:outline-none hover:bg-gray-100 transition-all duration-300 rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-7 h-6 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-3' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 shadow-2xl flex flex-col gap-2 md:hidden animate-fade-in-up">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">About</Link>
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">Features</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">Pricing</Link>
          <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">Blog</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 text-dark font-semibold hover:text-primary transition-all duration-300 border-b border-gray-200">Contact</Link>
          <hr className="border-gray-200 my-2" />
          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-center py-4 font-bold text-primary border-b border-gray-200">Dashboard</Link>
          <Link to="/auth" className="relative inline-flex items-center justify-center w-full py-4 mt-4 bg-primary text-white font-bold rounded-xl overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 border-2 border-primary" onClick={() => setMobileMenuOpen(false)}>
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
