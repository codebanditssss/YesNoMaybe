-- Wallet Transactions Table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'deposit_bonus', 'referral_bonus')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Payment Gateway Details
  gateway VARCHAR(20) CHECK (gateway IN ('razorpay', 'stripe', 'paytm', 'upi')),
  gateway_transaction_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  
  -- Bank/UPI Details for withdrawals
  withdrawal_method VARCHAR(20) CHECK (withdrawal_method IN ('bank_account', 'upi', 'wallet')),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  upi_id VARCHAR(100),
  
  -- Metadata
  description TEXT,
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User KYC Table
CREATE TABLE user_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Personal Details
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  
  -- Identity Documents
  pan_number VARCHAR(20) UNIQUE,
  pan_document_url VARCHAR(500),
  aadhaar_number VARCHAR(20) UNIQUE,
  aadhaar_document_url VARCHAR(500),
  
  -- Bank Details
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_account_holder_name VARCHAR(255),
  bank_document_url VARCHAR(500),
  
  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Limits
  daily_deposit_limit DECIMAL(15,2) DEFAULT 50000,
  daily_withdrawal_limit DECIMAL(15,2) DEFAULT 25000,
  monthly_limit DECIMAL(15,2) DEFAULT 1000000,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Withdrawal Requests Table  
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  
  -- Withdrawal Details
  withdrawal_method VARCHAR(20) NOT NULL CHECK (withdrawal_method IN ('bank_account', 'upi')),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  upi_id VARCHAR(100),
  
  -- Processing
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'processing', 'completed', 'rejected')),
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Gateway Response
  gateway_reference VARCHAR(255),
  gateway_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);

CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions" ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own KYC" ON user_kyc
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own withdrawal requests" ON withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Add real-time triggers
CREATE TRIGGER wallet_transactions_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes(); 