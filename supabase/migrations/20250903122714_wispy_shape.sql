/*
  # Update PEPE token restrictions

  1. Changes
    - Update PEPE minimum swap amount to 20,000,000
    - Ensure PEPE can only be swapped with USDT variants

  2. Security
    - Uses existing RLS policies
    - Safe update with WHERE clause
*/

UPDATE tokens 
SET minimum_swap = 20000000
WHERE symbol = 'PEPE' AND network = 'ERC20';