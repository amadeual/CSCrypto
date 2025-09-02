import { supabase } from '../lib/supabase';
import { Token, Transaction, SwapQuote } from '../types';
import { Database } from '../lib/database.types';

type DbToken = Database['public']['Tables']['tokens']['Row'];
type DbTransaction = Database['public']['Tables']['transactions']['Row'];
type DbSwapQuote = Database['public']['Tables']['swap_quotes']['Row'];

class DatabaseService {
  // Token operations
  async getTokens(): Promise<Token[]> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('symbol');

      if (error) throw error;

      return data.map(this.mapDbTokenToToken);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      // Return fallback data if database fails
      return this.getFallbackTokens();
    }
  }

  async getTokenById(id: string): Promise<Token | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapDbTokenToToken(data) : null;
    } catch (error) {
      console.error('Error fetching token by ID:', error);
      return null;
    }
  }

  async createToken(token: Omit<Token, 'id'>): Promise<Token | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .insert({
          symbol: token.symbol,
          name: token.name,
          network: token.network,
          address: token.address,
          decimals: token.decimals,
          logo_url: token.logoUrl,
          minimum_swap: token.minimumSwap || null
        })
        .select()
        .single();

      if (error) throw error;
      return data ? this.mapDbTokenToToken(data) : null;
    } catch (error) {
      console.error('Error creating token:', error);
      return null;
    }
  }

  // Transaction operations
  async getTransactions(userAddress?: string): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          from_token:from_token_id(*),
          to_token:to_token_id(*)
        `)
        .order('created_at', { ascending: false });

      if (userAddress) {
        query = query.eq('user_address', userAddress);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.mapDbTransactionToTransaction);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getTransactionByTrackerId(trackerId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          from_token:from_token_id(*),
          to_token:to_token_id(*)
        `)
        .eq('tracker_id', trackerId)
        .single();

      if (error) throw error;
      return data ? this.mapDbTransactionToTransaction(data) : null;
    } catch (error) {
      console.error('Error fetching transaction by tracker ID:', error);
      return null;
    }
  }

  async createTransaction(
    transaction: Omit<Transaction, 'id'>,
    quote: SwapQuote
  ): Promise<Transaction | null> {
    try {
      // First, get token IDs
      const fromToken = await this.getTokenBySymbolAndNetwork(
        transaction.fromToken.symbol,
        transaction.fromToken.network
      );
      const toToken = await this.getTokenBySymbolAndNetwork(
        transaction.toToken.symbol,
        transaction.toToken.network
      );

      if (!fromToken || !toToken) {
        throw new Error('Tokens not found in database');
      }

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          tracker_id: transaction.trackerId,
          user_address: transaction.receivingAddress || null,
          from_token_id: fromToken.id,
          to_token_id: toToken.id,
          from_amount: transaction.fromAmount,
          to_amount: transaction.toAmount,
          status: transaction.status,
          tx_hash: transaction.txHash || null,
          deposit_address: transaction.depositAddress || null,
          receiving_address: transaction.receivingAddress || null,
          estimated_completion: transaction.estimatedCompletion?.toISOString() || null
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create swap quote record
      await supabase
        .from('swap_quotes')
        .insert({
          transaction_id: txData.id,
          exchange_rate: quote.exchangeRate,
          price_impact: quote.priceImpact,
          fees: quote.fees,
          slippage: quote.slippage
        });

      // Return the created transaction with token data
      return {
        ...transaction,
        id: txData.id
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          status: updates.status,
          tx_hash: updates.txHash || null,
          estimated_completion: updates.estimatedCompletion?.toISOString() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          from_token:from_token_id(*),
          to_token:to_token_id(*)
        `)
        .single();

      if (error) throw error;
      return data ? this.mapDbTransactionToTransaction(data) : null;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  // Helper methods
  private async getTokenBySymbolAndNetwork(symbol: string, network: string): Promise<{ id: string } | null> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('id')
        .eq('symbol', symbol)
        .eq('network', network)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching token by symbol and network:', error);
      return null;
    }
  }

  // Health check method
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }

  private mapDbTokenToToken(dbToken: DbToken): Token {
    return {
      symbol: dbToken.symbol,
      name: dbToken.name,
      network: dbToken.network,
      address: dbToken.address,
      decimals: dbToken.decimals,
      logoUrl: dbToken.logo_url,
      minimumSwap: dbToken.minimum_swap || undefined
    };
  }

  private mapDbTransactionToTransaction(dbTransaction: any): Transaction {
    return {
      id: dbTransaction.id,
      trackerId: dbTransaction.tracker_id,
      fromToken: this.mapDbTokenToToken(dbTransaction.from_token),
      toToken: this.mapDbTokenToToken(dbTransaction.to_token),
      fromAmount: dbTransaction.from_amount,
      toAmount: dbTransaction.to_amount,
      status: dbTransaction.status,
      timestamp: new Date(dbTransaction.created_at),
      txHash: dbTransaction.tx_hash || undefined,
      depositAddress: dbTransaction.deposit_address || undefined,
      receivingAddress: dbTransaction.receiving_address || undefined,
      estimatedCompletion: dbTransaction.estimated_completion 
        ? new Date(dbTransaction.estimated_completion) 
        : undefined
    };
  }

  private getFallbackTokens(): Token[] {
    // Fallback token data in case database is unavailable
    return [
      {
        symbol: 'LUIGI',
        name: 'Luigi Mangione',
        network: 'Solana',
        address: '0x123...',
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
        minimumSwap: 100000
      },
      {
        symbol: 'USDT.z',
        name: 'USDT.z',
        network: 'BEP20',
        address: '0x456...',
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
        minimumSwap: 12000
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        network: 'ERC20',
        address: '0x000...',
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        minimumSwap: 0.05
      }
    ];
  }
}

export const databaseService = new DatabaseService();