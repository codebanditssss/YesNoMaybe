import { OrderDebugger } from '@/components/debug/OrderDebugger';

export default function DebugOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Debug Tool</h1>
      <OrderDebugger />
    </div>
  );
} 