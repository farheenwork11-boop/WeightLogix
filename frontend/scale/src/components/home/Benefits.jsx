const Benefits = () => {
  const benefits = [
    {
      title: "Digital Slips",
      description: "Create digital weight slips with QR codes in seconds. No more lost paper.",
      icon: "📄",
      delay: "0.1s"
    },
    {
      title: "Multi-Branch",
      description: "Manage all your weighing stations and branches from one central dashboard.",
      icon: "🏢",
      delay: "0.2s"
    },
    {
      title: "Smart Reports",
      description: "Automatic daily, weekly, and monthly reports to track cargo and efficiency.",
      icon: "📊",
      delay: "0.3s"
    },
    {
      title: "Secure Data",
      description: "Keep your customer and vehicle data safe and accessible anytime.",
      icon: "🔒",
      delay: "0.4s"
    }
  ];

  return (
    <section className="py-32 bg-white relative" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 text-dark animate-fade-in-up">All Features</h2>
          <p className="text-medium text-lg animate-fade-in-up animation-delay-100">
            Everything you need to digitize your weighing operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {benefits.map((benefit, index) => (
            <div
              className="p-10 rounded-xl bg-white border border-gray-100 transition-all duration-300 relative overflow-hidden z-10 hover:-translate-y-2 hover:shadow-xl hover:border-transparent group animate-fade-in-up"
              key={index}
              style={{ animationDelay: benefit.delay }}
            >
              {/* Hover Line Effect */}
              <div className="absolute top-0 left-0 w-1 h-0 bg-primary transition-[height] duration-300 group-hover:h-full"></div>

              <div className="text-4xl mb-6 bg-blue-50 w-[70px] h-[70px] flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white">
                {benefit.icon}
              </div>
              <h3 className="mb-4 text-xl font-bold text-dark">{benefit.title}</h3>
              <p className="text-medium leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
