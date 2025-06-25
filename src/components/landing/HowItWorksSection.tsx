export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Sign up and verify your identity for secure trading access."
    },
    {
      number: 2,
      title: "Fund Wallet",
      description: "Add funds to your wallet using secure payment methods."
    },
    {
      number: 3,
      title: "Start Trading",
      description: "Browse markets and place your first prediction trade."
    }
  ];

  return (
    <section className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-light text-black mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Three simple steps to start trading predictions
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center mx-auto text-2xl font-light">
                {step.number}
              </div>
              <h3 className="text-xl font-medium text-black">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 