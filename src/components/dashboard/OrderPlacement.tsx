import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronDown
} from "lucide-react";

interface OrderPlacementProps {
  market: {
    id: string;
    title: string;
    yesPrice: number;
    noPrice: number;
    availableQuantity: number;
  };
  onOrderPlace?: (order: {
    side: 'yes' | 'no';
    price: number;
    quantity: number;
    type: 'market' | 'limit';
  }) => void;
}

export function OrderPlacement({ market, onOrderPlace }: OrderPlacementProps) {
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [price, setPrice] = useState(selectedSide === 'yes' ? market.yesPrice : market.noPrice);
  const [quantity, setQuantity] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totalCost = price * quantity;
  const potentialReturns = selectedSide === 'yes' 
    ? (10 - price) * quantity 
    : (10 - price) * quantity;

  const handleSideChange = (side: 'yes' | 'no') => {
    setSelectedSide(side);
    if (orderType === 'market') {
      setPrice(side === 'yes' ? market.yesPrice : market.noPrice);
    }
  };

  const handleOrderTypeChange = (type: 'market' | 'limit') => {
    setOrderType(type);
    if (type === 'market') {
      setPrice(selectedSide === 'yes' ? market.yesPrice : market.noPrice);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    if (newPrice >= 0.5 && newPrice <= 9.5) {
      setPrice(Number(newPrice.toFixed(1)));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= market.availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePlaceOrder = () => {
    if (onOrderPlace) {
      onOrderPlace({
        side: selectedSide,
        price,
        quantity,
        type: orderType
      });
    }
  };

  return (
    <Card className="bg-white border-0 shadow-lg max-w-md mx-auto">
      {/* Header with Market Info */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {market.title}
        </h3>
      </div>

      {/* Yes/No Toggle */}
      <div className="p-4">
        <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
          <button
            onClick={() => handleSideChange('yes')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSide === 'yes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yes ₹{market.yesPrice.toFixed(1)}
          </button>
          <button
            onClick={() => handleSideChange('no')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSide === 'no'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            No ₹{market.noPrice.toFixed(1)}
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => handleOrderTypeChange('limit')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              orderType === 'limit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Set price
          </button>
          <button
            onClick={() => handleOrderTypeChange('market')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              orderType === 'market'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Instant match
          </button>
        </div>

        {/* Price Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Price
          </label>
          <div className="flex items-center">
            <button
              onClick={() => handlePriceChange(price - 0.5)}
              disabled={price <= 0.5}
              className="p-2 rounded-l-lg border border-r-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center border-t border-b border-gray-300 py-2">
              <span className="text-lg font-semibold">₹{price.toFixed(1)}</span>
            </div>
            <button
              onClick={() => handlePriceChange(price + 0.5)}
              disabled={price >= 9.5}
              className="p-2 rounded-r-lg border border-l-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {market.availableQuantity} qty available
          </p>
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900">
              Quantity
            </label>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-2 rounded-l-lg border border-r-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center border-t border-b border-gray-300 py-2">
              <span className="text-lg font-semibold">{quantity}</span>
            </div>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= market.availableQuantity}
              className="p-2 rounded-r-lg border border-l-0 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{totalCost.toFixed(1)}</p>
              <p className="text-xs text-gray-500">You put</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{(totalCost + potentialReturns).toFixed(1)}</p>
              <p className="text-xs text-gray-500">You get</p>
            </div>
          </div>
          
          {potentialReturns > 0 && (
            <div className="flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                +₹{potentialReturns.toFixed(1)} potential profit
              </span>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <span>Advanced Options</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="9.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="9.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className={`w-full py-3 text-base font-semibold rounded-lg ${
            selectedSide === 'yes'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-900 hover:bg-gray-800 text-white'
          }`}
        >
          Place order
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By placing this order, you agree to our terms and conditions. 
          Market prices are subject to change.
        </p>
      </div>
    </Card>
  );
} 