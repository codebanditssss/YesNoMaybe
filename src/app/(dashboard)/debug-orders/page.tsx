'use client';

import { OrderDebugger } from '@/components/debug/OrderDebugger';
import RealtimeTestPanel from '@/components/realtime/RealtimeTestPanel';

export default function DebugOrdersPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Debug & Testing Tools</h1>
      
      {/* Realtime Connection Test */}
      <RealtimeTestPanel />
      
      {/* Order Debugging */}
      <OrderDebugger />
    </div>
  );
} 