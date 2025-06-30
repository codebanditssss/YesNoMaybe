"use client";

export default function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl border border-blue-100">
        <div className="relative mb-4">
          <span className="block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400 opacity-60 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H8" />
            </svg>
          </span>
        </div>
        <div className="text-lg font-semibold text-blue-700 mb-1">Loading...</div>
        <div className="text-sm text-gray-500">Please wait while we prepare your experience</div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease;
        }
      `}</style>
    </div>
  );
} 