'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useOrders";
import { usePortfolio } from "@/hooks/usePortfolio";
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  Info,
  Loader2,
  AlertCircle
} from "lucide-react";

interface OrderPlacementProps {
  market: {
    id: string;
    title: string;
    yesPrice: number;
    noPrice: number;
    availableQuantity: number;
    status?: string;
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
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market'); // Default to market for simplicity
  const [price, setPrice] = useState(initialSide === 'yes' ? market.yesPrice : market.noPrice);
  const [quantity, setQuantity] = useState(1);
  
  // Use the orders hook for placing orders
  const { placeOrder, placing, error: orderError } = useOrders();
  
  // Get user balance
  const { balance } = usePortfolio();

  // Update price when side changes or market prices change
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(selectedSide === 'yes' ? market.yesPrice : market.noPrice);
    }
  }, [selectedSide, market.yesPrice, market.noPrice, orderType]);

  // CORRECTED CALCULATION LOGIC:
  // Backend expects: price = what user sees and pays
  // For YES: user pays {price}¢ per share  
  // For NO: user pays {price}¢ per share (which is 100 - yesPrice)
  const userPayPrice = price; // User pays exactly what they see
  const totalCost = (userPayPrice * quantity) / 100;
  
  // If user wins: they get ₹1 per share
  // Profit = ₹1 - what they paid = ₹1 - (userPayPrice/100)
  const profitPerShare = 1 - (userPayPrice / 100);
  const totalProfit = profitPerShare * quantity;
  const totalPayout = quantity; // Always ₹1 per share if win
  const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  // Check if user has sufficient balance
  const hasInsufficientBalance = !!(balance && totalCost > balance.available_balance);
  
  // Check if market is active
  const isMarketInactive = market.status && !['active', 'open'].includes(market.status.toLowerCase());

  const handleSideChange = (side: 'yes' | 'no') => {
    setSelectedSide(side);
    // FIXED: Always update price when switching sides
    setPrice(side === 'yes' ? market.yesPrice : market.noPrice);
  };

  const handleOrderTypeChange = (type: 'market' | 'limit') => {
    setOrderType(type);
    if (type === 'market') {
      setPrice(selectedSide === 'yes' ? market.yesPrice : market.noPrice);
    }
  };

  const handlePriceChange = (newPrice: number) => {
    // For YES: price can be 1-99
    // For NO: price can be 1-99 (but represents 100-yesPrice range)
    if (newPrice >= 1 && newPrice <= 99) {
      setPrice(Number(newPrice.toFixed(1)));
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = Math.min(market.availableQuantity || 1000, 1000);
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    // Validation checks
    if (isMarketInactive) {
      return;
    }

    if (balance && totalCost > balance.available_balance) {
      return;
    }

    if (!balance) {
      return;
    }

    try {
      // FIXED: Send the correct price to backend
      const orderData = {
        marketId: market.id,
        side: selectedSide.toUpperCase() as 'YES' | 'NO',
        price: price, // This is what the user sees and pays
        quantity: quantity
      };

      const newOrder = await placeOrder(orderData);

      // Call callbacks
      if (onOrderPlace) {
        onOrderPlace({
          side: selectedSide,
          price,
          quantity,
          type: orderType
        });
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }

      // Reset form
      setQuantity(1);

    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <Card className="bg-white border-0 shadow-lg max-w-md mx-auto">
      {/* Header with Market Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
            {market.title}
          </h3>
          {isMarketInactive && (
            <Badge variant="destructive" className="text-xs">
              Closed
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Yes/No Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => handleSideChange('yes')}
            disabled={isMarketInactive}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSide === 'yes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${isMarketInactive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="font-semibold">Yes</div>
              <div className="text-xs opacity-90">{market.yesPrice.toFixed(1)}¢</div>
            </div>
          </button>
          <button
            onClick={() => handleSideChange('no')}
            disabled={isMarketInactive}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedSide === 'no'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${isMarketInactive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-center">
              <div className="font-semibold">No</div>
              <div className="text-xs opacity-90">{market.noPrice.toFixed(1)}¢</div>
            </div>
          </button>
        </div>

        {/* Price Display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900">
              Price per share
            </label>
            <div className="text-xs text-gray-500">
              {orderType === 'market' ? 'Market Price' : 'Custom Price'}
            </div>
          </div>
          
          {orderType === 'market' ? (
            // Market order - show fixed price
            <div className="flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{price.toFixed(1)}¢</div>
                <div className="text-xs text-gray-500 mt-1">Current market price</div>
              </div>
            </div>
          ) : (
            // Limit order - allow price adjustment  
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => handlePriceChange(price - 0.1)}
                disabled={price <= 1 || isMarketInactive}
                className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <div className="flex-1 text-center py-3 px-4 bg-white">
                <span className="text-lg font-semibold text-gray-900">{price.toFixed(1)}¢</span>
              </div>
              <button
                onClick={() => handlePriceChange(price + 0.1)}
                disabled={price >= 99 || isMarketInactive}
                className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Available: {market.availableQuantity || 0}</span>
            {balance && <span>Balance: ₹{balance.available_balance.toFixed(2)}</span>}
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900">Quantity</label>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isMarketInactive}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors"
            >
              <Minus className="h-4 w-4 text-gray-600" />
            </button>
            <div className="flex-1 text-center py-3 px-4 bg-white">
              <span className="text-lg font-semibold text-gray-900">{quantity}</span>
            </div>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= Math.min(market.availableQuantity || 1000, 1000) || isMarketInactive}
              className="p-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-3">
            <div>
              <p className="text-lg font-bold text-gray-900">₹{totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">You pay</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">₹{totalPayout.toFixed(2)}</p>
              <p className="text-xs text-gray-500">If you win</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">₹{totalProfit.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Profit</p>
            </div>
          </div>
          
          {totalProfit > 0 && (
            <div className="flex items-center justify-center text-sm border-t border-gray-200 pt-3">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {roi.toFixed(1)}% ROI if {selectedSide.toUpperCase()} wins
              </span>
            </div>
          )}
        </div>

        {/* Order Type Toggle (Simplified) */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => handleOrderTypeChange('market')}
              disabled={isMarketInactive}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                orderType === 'market'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${isMarketInactive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Market Order
            </button>
            <button
              onClick={() => handleOrderTypeChange('limit')}
              disabled={isMarketInactive}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                orderType === 'limit'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${isMarketInactive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Limit Order
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {orderType === 'market' 
              ? 'Execute immediately at current market price' 
              : 'Set your own price and wait for a match'
            }
          </p>
        </div>

        {/* Error Messages */}
        {(orderError || hasInsufficientBalance || isMarketInactive) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">
                {isMarketInactive 
                  ? 'This market is closed for trading.'
                  : hasInsufficientBalance 
                    ? `Insufficient balance. Need ₹${totalCost.toFixed(2)}, have ₹${balance?.available_balance.toFixed(2) || 0}.`
                    : orderError
                }
              </p>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={placing || hasInsufficientBalance || !balance || isMarketInactive}
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
              Loading...
            </>
          ) : isMarketInactive ? (
            'Market Closed'
          ) : (
            `Buy ${selectedSide.toUpperCase()} for ₹${totalCost.toFixed(2)}`
          )}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Prediction markets involve risk. You may lose your entire investment.
        </p>
      </div>
    </Card>
  );
} 