/*
  # Initial Database Schema for CoinSwap DEX

  1. New Tables
    - `tokens`
      - `id` (uuid, primary key)
      - `symbol` (text, unique)
      - `name` (text)
      - `network` (text)
      - `address` (text)
      - `decimals` (integer)
      - `logo_url` (text)
      - `minimum_swap` (numeric, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `tracker_id` (text, unique)
      - `user_address` (text)
      - `from_token_id` (uuid, foreign key)
      - `to_token_id` (uuid, foreign key)
      - `from_amount` (text)
      - `to_amount` (text)
      - `status` (text)
      - `tx_hash` (text, optional)
      - `deposit_address` (text, optional)
      - `receiving_address` (text, optional)
      - `estimated_completion` (timestamp, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `swap_quotes`
      - `id` (uuid, primary key)
      - `transaction_id` (uuid, foreign key)
      - `exchange_rate` (numeric)
      - `price_impact` (numeric)
      - `fees` (numeric)
      - `slippage` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to tokens
*/

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  network text NOT NULL CHECK (network IN ('BEP20', 'Solana', 'ERC20', 'Base')),
  address text NOT NULL,
  decimals integer NOT NULL DEFAULT 18,
  logo_url text NOT NULL,
  minimum_swap numeric DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(symbol, network)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_id text UNIQUE NOT NULL,
  user_address text,
  from_token_id uuid REFERENCES tokens(id) NOT NULL,
  to_token_id uuid REFERENCES tokens(id) NOT NULL,
  from_amount text NOT NULL,
  to_amount text NOT NULL,
  status text NOT NULL CHECK (status IN ('awaiting_payment', 'payment_confirmed', 'processing', 'pending', 'completed', 'failed')) DEFAULT 'awaiting_payment',
  tx_hash text,
  deposit_address text,
  receiving_address text,
  estimated_completion timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create swap_quotes table
CREATE TABLE IF NOT EXISTS swap_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) NOT NULL,
  exchange_rate numeric NOT NULL,
  price_impact numeric NOT NULL DEFAULT 0,
  fees numeric NOT NULL DEFAULT 0,
  slippage numeric NOT NULL DEFAULT 0.5,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_quotes ENABLE ROW LEVEL SECURITY;

-- Policies for tokens (public read, admin write)
CREATE POLICY "Anyone can read tokens"
  ON tokens
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert tokens"
  ON tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tokens"
  ON tokens
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for transactions (users can manage their own)
CREATE POLICY "Users can read their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_address = auth.jwt() ->> 'wallet_address' OR user_address IS NULL);

CREATE POLICY "Anyone can insert transactions"
  ON transactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_address = auth.jwt() ->> 'wallet_address' OR user_address IS NULL);

-- Policies for swap_quotes
CREATE POLICY "Users can read swap quotes for their transactions"
  ON swap_quotes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = swap_quotes.transaction_id 
      AND (transactions.user_address = auth.jwt() ->> 'wallet_address' OR transactions.user_address IS NULL)
    )
  );

CREATE POLICY "Anyone can insert swap quotes"
  ON swap_quotes
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tokens_symbol_network ON tokens(symbol, network);
CREATE INDEX IF NOT EXISTS idx_transactions_tracker_id ON transactions(tracker_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Insert initial token data
INSERT INTO tokens (symbol, name, network, address, decimals, logo_url, minimum_swap) VALUES
('LUIGI', 'Luigi Mangione', 'Solana', '0x123...', 18, 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', 100000),
('USDT.z', 'USDT.z', 'BEP20', '0x456...', 6, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', 12000),
('TETRA', 'Tetra USD', 'BEP20', '0x789...', 18, 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', NULL),
('USDT', 'Tether USD (BEP20)', 'BEP20', '0xabc...', 18, 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', NULL),
('USDT', 'Tether USD (Solana)', 'Solana', 'Es9v...', 6, 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', NULL),
('SOL', 'Solana', 'Solana', 'So11...', 9, 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', NULL),
('ETH', 'Ethereum', 'ERC20', '0x000...', 18, 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', 0.05),
('BNB', 'BNB Token', 'BEP20', '0xdef...', 18, 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', NULL),
('BTC', 'Bitcoin', 'ERC20', '0x2260...', 8, 'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop', 0.025)
ON CONFLICT (symbol, network) DO NOTHING;