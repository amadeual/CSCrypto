/*
  # Add PEPE token to database

  1. New Token
    - `PEPE` (Pepe)
      - Symbol: PEPE
      - Name: Pepe
      - Network: ERC20
      - Address: 0x6982508145454Ce325dDbE47a25d4ec3d2311933
      - Decimals: 18
      - Logo URL: CoinMarketCap image
      - Minimum swap: 1,000,000 PEPE

  2. Security
    - Uses existing RLS policies for tokens table
    - Public can read, authenticated users can insert/update
*/

-- Insert PEPE token if it doesn't already exist
INSERT INTO tokens (
  symbol,
  name,
  network,
  address,
  decimals,
  logo_url,
  minimum_swap
) 
SELECT 
  'PEPE',
  'Pepe',
  'ERC20',
  '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  18,
  'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
  1000000
WHERE NOT EXISTS (
  SELECT 1 FROM tokens 
  WHERE symbol = 'PEPE' AND network = 'ERC20'
);