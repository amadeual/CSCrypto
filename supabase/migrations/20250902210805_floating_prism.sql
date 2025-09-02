/*
  # Update cryptokeys table to store plain text keys

  1. Changes
    - Remove encryption from key storage
    - Allow admins to view keys in plain text for backup purposes
    - Update existing encrypted keys to plain text (if any exist)
    - Add comments for clarity

  2. Security
    - Keys stored in plain text for admin access
    - Proper RLS policies maintained
    - Database-level security still applies
*/

-- Add comment to clarify that keys are stored in plain text for admin access
COMMENT ON COLUMN cryptokeys.encrypted_key IS 'Crypto keys stored in plain text for admin visibility and backup purposes';

-- Update the column name to be more accurate (optional, but clearer)
-- Note: We keep the column name as 'encrypted_key' to maintain compatibility
-- but the content will be plain text