const PricingPreview = () => {

  const CheckIcon = () => (
    <svg className="w-5 h-5 mr-3 flex-shrink-0 text-[#27c93f]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="w-5 h-5 mr-3 flex-shrink-0 text-red-500 opacity-50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <section className="py-32 bg-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 text-dark animate-fade-in-up">Simple, Transparent Pricing</h2>
          <p className="text-medium text-lg animate-fade-in-up animation-delay-100">Choose the plan that fits your business needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <div className="p-12 rounded-xl border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-3 hover:shadow-xl relative bg-white animate-fade-in-up animation-delay-100">
            <h3 className="text-2xl mb-6 text-dark font-bold">Starter</h3>
            <div className="text-5xl font-bold text-primary mb-10 leading-none">$29<span className="text-base text-light font-normal">/mo</span></div>
            <ul className="mb-10 space-y-4 text-left">
              <li className="flex items-center text-medium text-lg"><CheckIcon /> 5 Users</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Basic Analytics</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Email Support</li>
              <li className="flex items-center text-medium text-lg"><CrossIcon /> API Access</li>
            </ul>
            <a href="/register?plan=starter" className="btn btn-outline w-full py-3">Get Starter</a>
          </div>

          {/* Pro Plan */}
          <div className="p-12 rounded-xl border-2 border-primary text-center transition-transform duration-300 hover:-translate-y-3 hover:shadow-xl relative bg-white scale-105 z-20 shadow-lg animate-fade-in-up animation-delay-200">
            <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-2 rounded-full text-sm font-bold tracking-wide shadow-md">Most Popular</div>
            <h3 className="text-2xl mb-6 text-dark font-bold">Professional</h3>
            <div className="text-5xl font-bold text-primary mb-10 leading-none">$99<span className="text-base text-light font-normal">/mo</span></div>
            <ul className="mb-10 space-y-4 text-left">
              <li className="flex items-center text-medium text-lg"><CheckIcon /> 25 Users</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Advanced Analytics</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Priority Support</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> API Access</li>
            </ul>
            <a href="/register?plan=pro" className="btn btn-primary w-full py-3 shadow-lg hover:shadow-xl">Get Pro</a>
          </div>

          {/* Enterprise Plan */}
          <div className="p-12 rounded-xl border border-gray-200 text-center transition-transform duration-300 hover:-translate-y-3 hover:shadow-xl relative bg-white animate-fade-in-up animation-delay-300">
            <h3 className="text-2xl mb-6 text-dark font-bold">Enterprise</h3>
            <div className="text-5xl font-bold text-primary mb-10 leading-none">Custom</div>
            <ul className="mb-10 space-y-4 text-left">
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Unlimited Users</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Custom Reports</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> Dedicated Manager</li>
              <li className="flex items-center text-medium text-lg"><CheckIcon /> SLA Agreement</li>
            </ul>
            <a href="/contact" className="btn btn-outline w-full py-3">Contact Sales</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
