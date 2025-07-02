import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="text-center max-w-md w-full p-10 bg-slate-900 border border-slate-800 shadow-lg">
        <h1 className="text-7xl font-extrabold text-slate-100 mb-4 tracking-tight font-mono">404</h1>
        <p className="text-2xl font-semibold text-slate-200 mb-2">Page Not Found</p>
        <p className="mb-8 text-slate-400">Sorry, this page does not exist or has been moved.</p>
        <Link href="/">
          <span className="inline-block px-6 py-3 bg-slate-800 text-slate-100 font-semibold border border-slate-700 hover:bg-slate-700 transition-colors">Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}