import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { usePortfolio } from "@/hooks/usePortfolio";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronDown,
  Loader2
} from "lucide-react";

interface OrderPlacementProps {
  market: {
    id: string;
    title: string;
    yesPrice: number;
    noPrice: number;
    availableQuantity: number;
  };
  user_id?: string;
  initialSide?: 'yes' | 'no';
  onOrderPlace?: (order: {
    side: 'yes' | 'no';
    price: number;
    quantity: number;
    type: 'market' | 'limit';
  }) => void;
  onOrderSuccess?: () => void;
}

export function OrderPlacement({ market, user_id, initialSide = 'yes', onOrderPlace, onOrderSuccess }: OrderPlacementProps) {
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>(initialSide);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [price, setPrice] = useState(initialSide === 'yes' ? market.yesPrice : market.noPrice);
  const [quantity, setQuantity] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Use the orders hook for placing orders
  const { placeOrder, placing, error: orderError } = useOrders();
  
  // Get user balance
  const { balance } = usePortfolio();

  // Calculate cost: price is in 0-100 scale, so divide by 100 to get actual cost
  const actualPrice = selectedSide === 'yes' ? price : (100 - price); // NO side pays complement price
  const totalCost = (actualPrice * quantity) / 100;
  
  // Calculate potential returns for prediction markets  
  const potentialReturns = selectedSide === 'yes' 
    ? ((100 - price) / 100) * quantity     // YES: pay price%, get (100-price)% profit if wins
    : (price / 100) * quantity;            // NO: pay (100-price)%, get price% profit if NO wins

  // Check if user has sufficient balance
  const hasInsufficientBalance = !!(balance && totalCost > balance.available_balance);

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
    if (newPrice >= 1 && newPrice <= 99) {
      setPrice(Number(newPrice.toFixed(1)));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= market.availableQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('🚀 Place Order clicked!', { 
      balance, 
      totalCost, 
      hasInsufficientBalance,
      marketId: market.id,
      side: selectedSide,
      price: actualPrice,
      quantity
    });

    // Check if user has sufficient balance
    if (balance && totalCost > balance.available_balance) {
      console.log('❌ Insufficient balance, stopping order placement');
      return; // Error will be shown in UI
    }

    // Check if balance is still loading
    if (!balance) {
      console.log('⏳ Balance not loaded yet, cannot place order');
      return;
    }

    try {
      const orderData = {
        marketId: market.id,
        side: selectedSide.toUpperCase() as 'YES' | 'NO',
        price: actualPrice, // Use the actual price user is paying (complement for NO)
        quantity: quantity
      };

      console.log('📤 Sending order to API...', orderData);
      const newOrder = await placeOrder(orderData);

      // Call the legacy callback for backward compatibility
    if (onOrderPlace) {
      onOrderPlace({
        side: selectedSide,
        price,
        quantity,
        type: orderType
      });
      }

      // Call success callback
      if (onOrderSuccess) {
        onOrderSuccess();
      }

      // Reset form
      setQuantity(1);

    } catch (error) {
      // Error is already handled by the useOrders hook
      console.error('Error placing order:', error);
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
            Yes {market.yesPrice.toFixed(1)}¢
          </button>
          <button
            onClick={() => handleSideChange('no')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSide === 'no'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            No {market.noPrice.toFixed(1)}¢
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
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => handlePriceChange(price - 1)}
              disabled={price <= 1}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center py-3 px-4 bg-white">
              <span className="text-lg font-semibold text-gray-900">{actualPrice.toFixed(1)}¢</span>
            </div>
            <button
              onClick={() => handlePriceChange(price + 1)}
              disabled={price >= 99}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{market.availableQuantity} qty available</span>
            {balance && <span>Balance: ₹{balance.available_balance.toFixed(2)}</span>}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900">
              Quantity
            </label>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center py-3 px-4 bg-white">
              <span className="text-lg font-semibold text-gray-900">{quantity}</span>
            </div>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= market.availableQuantity}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">You pay</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{quantity}</p>
              <p className="text-xs text-gray-500">You get if wins</p>
            </div>
          </div>
          
          {potentialReturns > 0 && (
            <div className="flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                +₹{potentialReturns.toFixed(2)} potential profit
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
                step="1"
                min="1"
                max="99"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional (in cents)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="99"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional (in cents)"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {(orderError || hasInsufficientBalance) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 font-medium">
              {hasInsufficientBalance 
                ? `Insufficient balance. You need ₹${totalCost.toFixed(2)} but only have ₹${balance?.available_balance.toFixed(2) || 0}.`
                : orderError === 'Market is not active' 
                  ? 'This market is closed for trading. It may be resolved or expired.'
                  : orderError
              }
            </p>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={placing || hasInsufficientBalance || !balance}
          className={`w-full py-3 text-base font-semibold rounded-lg ${
            selectedSide === 'yes'
              ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
              : 'bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-600'
          }`}
        >
          {placing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Placing order...
            </>
          ) : !balance ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading balance...
            </>
          ) : (
            'Place order'
          )}
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