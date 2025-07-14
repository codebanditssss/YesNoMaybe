import { motion } from 'framer-motion';
import React from 'react';

const faqData = [
  {
    question: 'What is YesNoMaybe?',
    answer: 'YesNoMaybe is a prediction market platform where you can trade on real-world events.'
  },
  {
    question: 'How do I get started?',
    answer: 'Sign up for an account, explore markets, and start trading predictions!'
  },
  {
    question: 'Is it free to use?',
    answer: 'Yes, you can sign up and explore the platform for free.'
  },
  {
    question: 'How are my funds secured?',
    answer: 'We use industry-standard security practices to keep your funds and data safe.'
  }
];

export function Footers() {
  return (
    <div className="relative z-10 flex flex-col items-center px-4 pt-8 pb-0 bg-transparent gap-20">
      {/* FAQ Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="w-full max-w-4xl mx-auto mb-8">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, idx) => (
              <details key={idx} className="group border-b border-gray-200 py-2">
                <summary className="flex items-center justify-between cursor-pointer text-lg font-medium text-gray-800 transition-colors"> {/* group-open:text-primary-600 */}
                  {faq.question}
                  <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform"> ? </span>
                </summary>
                <div className="mt-2 text-gray-600 text-base pl-2">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto mt-8 mb-4">
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="YesNoMaybe Logo" className="h-8 w-8" />
            <span className="font-semibold text-lg text-gray-900">YesNoMaybe</span>
          </div>
          <div className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} YesNoMaybe. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="relative transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">Privacy Policy</a>
            <a href="#" className="relative transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">Terms</a>
            <a href="#" className="relative transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 