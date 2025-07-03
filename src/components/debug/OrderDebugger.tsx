'use client';

import React, { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';

export function OrderDebugger() {
  const { user } = useAuth();
  const { orders, loading } = useOrders({ limit: 5 });
  const [side, setSide] = useState<'YES' | 'NO'>('YES');
  const [price, setPrice] = useState(1);
  const [quantity, setQuantity] = useState(100);

  // Calculate order cost using the same logic as trading engine
  const calculateOrderCost = (side: string, price: number, quantity: number): number => {
    const actualPrice = side === 'YES' ? price : (100 - price);
    return (actualPrice * quantity) / 100;
  };

  const estimatedCost = calculateOrderCost(side, price, quantity);

  if (!user) return <div>Please log in to debug orders</div>;

  return (
    <div className="p-6 bg-white border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Order Cost Calculator & Recent Orders</h2>
      
      {/* Cost Calculator */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-3">Calculate Order Cost:</h3>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Side:</label>
            <select 
              value={side} 
              onChange={(e) => setSide(e.target.value as 'YES' | 'NO')}
              className="w-full border rounded px-3 py-2"
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹):</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(Number(e.target.value))}
              min="1" 
              max="99"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity:</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <div className="p-3 bg-blue-100 rounded">
          <p className="font-semibold">
            Estimated Cost: ₹{estimatedCost.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Formula: {side === 'YES' 
              ? `(${price} × ${quantity}) ÷ 100` 
              : `((100 - ${price}) × ${quantity}) ÷ 100`
            }
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="font-semibold mb-3">Your Recent Orders:</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Time</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Side</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Price</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Quantity</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Total Cost</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.side === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.side}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">₹{order.price}</td>
                    <td className="border border-gray-300 px-3 py-2">{order.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2 font-semibold">
                      ₹{order.total_cost?.toFixed(2) || calculateOrderCost(order.side, order.price, order.quantity).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'filled' ? 'bg-green-100 text-green-800' :
                        order.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Troubleshooting Tips */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-semibold text-yellow-800 mb-2">Common Issues:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Large quantity entered by mistake</strong> - Check if you entered 18,200 instead of 100</li>
          <li>• <strong>NO orders cost more than expected</strong> - NO at ₹1 costs ₹99 per 100 shares</li>
          <li>• <strong>Price × Quantity confusion</strong> - The cost is calculated as (price × quantity) ÷ 100</li>
        </ul>
      </div>
    </div>
  );
} 