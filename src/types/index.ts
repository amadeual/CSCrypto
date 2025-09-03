export interface Token {
  symbol: string;
  name: string;
  network: 'BEP20' | 'Solana' | 'ERC20' | 'Base' | 'TRC20' | 'BTC';
  address: string;
  decimals: number;
  logoUrl: string;
  minimumSwap?: number;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact: number;
  fees: number;
  slippage: number;
  receivingAddress?: string;
}

export interface Transaction {
  id: string;
  trackerId: string;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  status: 'awaiting_payment' | 'payment_confirmed' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  txHash?: string;
  depositAddress?: string;
  receivingAddress?: string;
  estimatedCompletion?: Date;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  network?: string;
  provider?: string;
}