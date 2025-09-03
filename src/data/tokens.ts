import { Token } from '../types';
import { databaseService } from '../services/databaseService';

// Fallback tokens for offline mode
const FALLBACK_TOKENS: Token[] = [
  {
    symbol: 'LUIGI',
    name: 'Luigi Mangione',
    network: 'Solana',
    address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/33830.png',
    minimumSwap: 100000
  },
  {
    symbol: 'USDT.z',
    name: 'USDT.z',
    network: 'BEP20',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 6,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    minimumSwap: 12000
  },
  {
    symbol: 'TETRA',
    name: 'Tetra USD',
    network: 'BEP20',
    address: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (BEP20)',
    network: 'BEP20',
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (Solana)',
    network: 'Solana',
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD (TRC20)',
    network: 'TRC20',
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    decimals: 6,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    network: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    network: 'ERC20',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    minimumSwap: 0.05
  },
  {
    symbol: 'BNB',
    name: 'BNB Token',
    network: 'BEP20',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin (Wrapped)',
    network: 'ERC20', 
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    minimumSwap: 0.025
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'BTC',
    address: 'bc1qx76p3qc6qsk236nrl7vg8vk2uy7drq9aawmwas',
    decimals: 8,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
    minimumSwap: 0.001
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    network: 'ERC20',
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    decimals: 18,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png',
    minimumSwap: 1000000
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    network: 'ERC20',
    address: '0xA0b86a33E6441c8C06DD2b7c94b7E0e8c07e8e8e',
    decimals: 6,
    logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
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
