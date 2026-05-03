import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-32 pb-24 bg-gradient-to-br from-bg-light to-white overflow-hidden">
      {/* Background Shape */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] bg-[radial-gradient(circle,rgba(30,58,138,0.1)_0%,rgba(255,255,255,0)_70%)] z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] grid-cols-1 gap-16 items-center relative z-10">
        <div className={`text-center lg:text-left transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-dark tracking-tight">
            Make Weighing <br />
            <span className="text-primary relative z-10">Simple & Digital</span>
          </h1>
          <p className="text-xl text-medium mb-10 max-w-[540px] leading-relaxed mx-auto lg:mx-0 delay-100">
            No more lost paper slips. The smart weighing system for factories, weighbridges, and logistics companies.
          </p>
          <div className="flex gap-4 mb-14 justify-center lg:justify-start flex-col sm:flex-row w-full sm:w-auto delay-200">
            <Link to="/auth" className="btn btn-primary px-8 py-4 text-lg w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-shadow">Start Free Trial</Link>
            <a href="#demo" className="btn btn-outline px-8 py-4 text-lg w-full sm:w-auto bg-white hover:bg-gray-50">Watch Demo</a>
          </div>
          <div className="text-sm text-light border-t border-gray-200 pt-8 mt-8 lg:mt-0 delay-300">
            <div className="flex gap-8 justify-center lg:justify-start font-medium text-medium">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span> Fast Slip Generation
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span> Multi-Branch
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span> Smart Reports
              </div>
            </div>
          </div>
        </div>

        <div className={`relative h-[400px] lg:h-[500px] flex items-center justify-center perspective-1000 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Wireframe-like Product Screenshot Placeholder */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden relative z-20 animate-[float_6s_ease-in-out_infinite]">
            <div className="bg-gray-50 border-b border-gray-200 p-3 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-8 w-24 bg-primary rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-full bg-gray-100 rounded border border-gray-200 flex items-center px-3 text-sm text-gray-400">Select Customer...</div>
                <div className="h-10 w-full bg-gray-100 rounded border border-gray-200 flex items-center px-3 text-sm text-gray-400">Select Vehicle...</div>
                <div className="flex gap-4">
                  <div className="h-20 w-1/2 bg-gray-100 rounded border border-gray-200 flex flex-col justify-center items-center">
                    <span className="text-xs text-gray-400">Gross Weight</span>
                    <span className="text-xl font-bold text-dark">45,000 kg</span>
                  </div>
                  <div className="h-20 w-1/2 bg-gray-100 rounded border border-gray-200 flex flex-col justify-center items-center">
                    <span className="text-xs text-gray-400">Net Weight</span>
                    <span className="text-xl font-bold text-green-600">--</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Decorations */}
          <div className="absolute w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(30,58,138,0.08)_0%,rgba(255,255,255,0)_70%)] -top-[15%] -right-[20%] rounded-full z-10"></div>
          <div className="hidden lg:flex bg-white px-5 py-3 rounded-lg shadow-xl absolute z-30 font-semibold text-dark items-center top-[30%] -left-[5%] animate-[float_5s_ease-in-out_infinite_0.5s] border border-gray-100">
            <span className="text-green-500 mr-2">✓</span> Slip #0045 Generated
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
