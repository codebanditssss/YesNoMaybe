"use client"

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wallet as WalletIcon,
  Shield,
  TrendingUp
} from "lucide-react";

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'deposit_bonus' | 'referral_bonus';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  gateway?: string;
  description?: string;
  created_at: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number;
}

function DepositModal({ isOpen, onClose, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) {
      setError('Minimum deposit amount is ₹10');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          gateway
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate deposit');
      }

      // Handle payment gateway integration here
      if (gateway === 'razorpay') {
        await handleRazorpayPayment(data.paymentData, data.transactionId);
      } else {
        await handleStripePayment(data.paymentData, data.transactionId);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (paymentData: any, transactionId: string) => {
    // Initialize Razorpay checkout
    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.orderId,
      name: 'YesNoMaybe',
      description: 'Wallet Deposit',
      handler: async (response: any) => {
        // Complete deposit
        await completeDeposit(transactionId, {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
      },
      prefill: {
        email: 'user@example.com' // Get from auth context
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleStripePayment = async (paymentData: any, transactionId: string) => {
    // Initialize Stripe checkout
    // This would require Stripe Elements integration
    console.log('Stripe payment integration needed');
  };

  const completeDeposit = async (transactionId: string, paymentData: any) => {
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          paymentData
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setAmount('');
      }
    } catch (error) {
      setError('Failed to complete deposit');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Add Money</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              min="10"
              max="100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="₹ Enter amount"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Min: ₹10, Max: ₹1,00,000</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGateway('razorpay')}
                className={`p-3 border rounded-lg text-center ${
                  gateway === 'razorpay' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Razorpay</span>
              </button>
              <button
                type="button"
                onClick={() => setGateway('stripe')}
                className={`p-3 border rounded-lg text-center ${
                  gateway === 'stripe' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Stripe</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount}
              className="flex-1"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Add Money'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WithdrawalModal({ isOpen, onClose, onSuccess, availableBalance }: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank_account' | 'upi'>('upi');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    if (!amount || withdrawalAmount < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawalAmount,
          method,
          bankDetails: method === 'bank_account' ? bankDetails : undefined,
          upiId: method === 'upi' ? upiId : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request withdrawal');
      }

      onSuccess();
      onClose();
      // Reset form
      setAmount('');
      setBankDetails({ accountNumber: '', ifsc: '', accountHolderName: '' });
      setUpiId('');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Withdraw Money</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              min="100"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="₹ Enter amount"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: ₹{availableBalance.toLocaleString()}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 border rounded-lg text-center ${
                  method === 'upi' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300'
                }`}
              >
                <Banknote className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank_account')}
                className={`p-3 border rounded-lg text-center ${
                  method === 'bank_account' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300'
                }`}
              >
                <CreditCard className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Bank</span>
              </button>
            </div>
          </div>

          {method === 'upi' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="yourname@upi"
                required
              />
            </div>
          )}

          {method === 'bank_account' && (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, ifsc: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !amount}
              className="flex-1"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Withdraw'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState({ available: 0, total: 0, locked: 0 });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);

  const fetchWalletData = async () => {
    try {
      // Fetch balance from portfolio API
      const portfolioResponse = await fetch('/api/portfolio');
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setBalance({
          available: portfolioData.balance?.available_balance || 0,
          total: portfolioData.balance?.available_balance + portfolioData.balance?.locked_balance || 0,
          locked: portfolioData.balance?.locked_balance || 0
        });
      }

      // Fetch transactions
      const transactionsResponse = await fetch('/api/wallet/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const getTransactionIcon = (type: string, status: string) => {
    if (type === 'deposit') {
      return status === 'completed' ? (
        <ArrowDownLeft className="h-4 w-4 text-green-600" />
      ) : (
        <Clock className="h-4 w-4 text-yellow-600" />
      );
    }
    return status === 'completed' ? (
      <ArrowUpRight className="h-4 w-4 text-blue-600" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-600" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet</h1>
            <p className="text-gray-600">Manage your funds and transactions</p>
          </div>
          <Button onClick={fetchWalletData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">₹{balance.available.toLocaleString()}</p>
              </div>
              <WalletIcon className="h-8 w-8 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Locked in Orders</p>
                <p className="text-2xl font-bold text-gray-900">₹{balance.locked.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{balance.total.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <ArrowDownLeft className="h-4 w-4 mr-2" />
            Add Money
          </Button>
          <Button
            onClick={() => setShowWithdrawalModal(true)}
            variant="outline"
            className="flex-1"
            disabled={balance.available < 100}
          >
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Withdraw
          </Button>
        </div>

        {/* Transactions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <WalletIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type, transaction.status)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.type === 'deposit' ? 'Money Added' : 'Withdrawal'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Modals */}
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={fetchWalletData}
        />
        
        <WithdrawalModal
          isOpen={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={fetchWalletData}
          availableBalance={balance.available}
        />
      </div>
    </div>
  );
} 