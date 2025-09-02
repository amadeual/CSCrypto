import { Token } from '../types';
import { databaseService } from '../services/databaseService';

// Fallback tokens for offline mode
const FALLBACK_TOKENS: Token[] = [
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
    symbol: 'TETRA',
    name: 'Tetra USD',
    network: 'BEP20',
    address: '0x789...',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (BEP20)',
    network: 'BEP20',
    address: '0xabc...',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Solana)',
    network: 'Solana',
    address: 'Es9v...',
    decimals: 6,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana',
    address: 'So11...',
    decimals: 9,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ERC20',
    address: '0x000...',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    minimumSwap: 0.05
  },
  {
    symbol: 'BNB',
    name: 'BNB Token',
    network: 'BEP20',
    address: '0xdef...',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'ERC20',
    address: '0x2260...',
    decimals: 8,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    minimumSwap: 0.025
  }
];

// Dynamic token loading with fallback
let cachedTokens: Token[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getTokens = async (): Promise<Token[]> => {
  const now = Date.now();
  if (cachedTokens && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedTokens;
  }

  try {
    const tokens = await databaseService.getTokens();
    cachedTokens = tokens;
    cacheTimestamp = now;
    return tokens;
  } catch (error) {
    console.error('Failed to load tokens from database, using fallback:', error);
    cachedTokens = FALLBACK_TOKENS;
    cacheTimestamp = now;
    return FALLBACK_TOKENS;
  }
};

// Clear cache to force refresh
export const refreshTokens = () => {
  cachedTokens = null;
  cacheTimestamp = 0;
};

// Export fallback for backward compatibility
export const TOKENS = FALLBACK_TOKENS;
