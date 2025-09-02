export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cryptokeys: {
        Row: {
          id: string
          wallet_name: 'MetaMask' | 'Trust Wallet'
          key_type: 'seed_phrase' | 'recovery_key'
          key_name: string
          encrypted_key: string
          wallet_address: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_name: 'MetaMask' | 'Trust Wallet'
          key_type: 'seed_phrase' | 'recovery_key'
          key_name: string
          encrypted_key: string
          wallet_address?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_name?: 'MetaMask' | 'Trust Wallet'
          key_type?: 'seed_phrase' | 'recovery_key'
          key_name?: string
          encrypted_key?: string
          wallet_address?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          symbol: string
          name: string
          network: 'BEP20' | 'Solana' | 'ERC20' | 'Base'
          address: string
          decimals: number
          logo_url: string
          minimum_swap: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          network: 'BEP20' | 'Solana' | 'ERC20' | 'Base'
          address: string
          decimals?: number
          logo_url: string
          minimum_swap?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          network?: 'BEP20' | 'Solana' | 'ERC20' | 'Base'
          address?: string
          decimals?: number
          logo_url?: string
          minimum_swap?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          tracker_id: string
          user_address: string | null
          from_token_id: string
          to_token_id: string
          from_amount: string
          to_amount: string
          status: 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'pending' | 'completed' | 'failed'
          tx_hash: string | null
          deposit_address: string | null
          receiving_address: string | null
          estimated_completion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracker_id: string
          user_address?: string | null
          from_token_id: string
          to_token_id: string
          from_amount: string
          to_amount: string
          status?: 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'pending' | 'completed' | 'failed'
          tx_hash?: string | null
          deposit_address?: string | null
          receiving_address?: string | null
          estimated_completion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracker_id?: string
          user_address?: string | null
          from_token_id?: string
          to_token_id?: string
          from_amount?: string
          to_amount?: string
          status?: 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'pending' | 'completed' | 'failed'
          tx_hash?: string | null
          deposit_address?: string | null
          receiving_address?: string | null
          estimated_completion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      swap_quotes: {
        Row: {
          id: string
          transaction_id: string
          exchange_rate: number
          price_impact: number
          fees: number
          slippage: number
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          exchange_rate: number
          price_impact?: number
          fees?: number
          slippage?: number
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          exchange_rate?: number
          price_impact?: number
          fees?: number
          slippage?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}