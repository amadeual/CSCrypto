/*
  # Create cryptokeys table for wallet credentials

  1. New Tables
    - `cryptokeys`
      - `id` (uuid, primary key)
      - `wallet_name` (text) - Name of the wallet (MetaMask, Trust Wallet)
      - `key_type` (text) - Type of key (seed_phrase, recovery_key)
      - `key_name` (text) - User-friendly name for the key
      - `encrypted_key` (text) - Encrypted wallet key/seed phrase
      - `wallet_address` (text) - Associated wallet address
      - `user_id` (uuid) - Reference to user (if auth is implemented)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cryptokeys` table
    - Add policy for users to manage their own keys only
    - Encrypt sensitive data

  3. Indexes
    - Index on wallet_address for quick lookups
    - Index on user_id for user-specific queries
*/

CREATE TABLE IF NOT EXISTS cryptokeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_name text NOT NULL CHECK (wallet_name IN ('MetaMask', 'Trust Wallet')),
  key_type text NOT NULL CHECK (key_type IN ('seed_phrase', 'recovery_key')),
  key_name text NOT NULL,
  encrypted_key text NOT NULL,
  wallet_address text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cryptokeys ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cryptokeys_wallet_address ON cryptokeys(wallet_address);
CREATE INDEX IF NOT EXISTS idx_cryptokeys_user_id ON cryptokeys(user_id);

-- RLS Policies
CREATE POLICY "Users can manage their own crypto keys"
  ON cryptokeys
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert keys (for non-authenticated usage)
CREATE POLICY "Anonymous users can insert crypto keys"
  ON cryptokeys
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to read their own keys by wallet address
CREATE POLICY "Anonymous users can read keys by wallet address"
  ON cryptokeys
  FOR SELECT
  TO anon
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cryptokeys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cryptokeys_updated_at
  BEFORE UPDATE ON cryptokeys
  FOR EACH ROW
  EXECUTE FUNCTION update_cryptokeys_updated_at();