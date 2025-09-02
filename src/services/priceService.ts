interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
  };
}

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
}

class PriceService {
  private cache: PriceCache = {};
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly API_BASE = 'https://api.coingecko.com/api/v3';

  // Map token symbols to CoinGecko IDs
  private readonly TOKEN_ID_MAP: { [symbol: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'BNB': 'binancecoin',
    'USDT': 'tether',
    'USDT.z': 'tether', // Assuming USDT.z tracks USDT price
    'TETRA': 'tether', // Assuming Tetra USD tracks USDT price
    'LUIGI': 'solana' // Placeholder - using SOL price as fallback
  };

  private isCacheValid(symbol: string): boolean {
    const cached = this.cache[symbol];
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  async getPrice(symbol: string): Promise<number> {
    // Check cache first
    if (this.isCacheValid(symbol)) {
      return this.cache[symbol].price;
    }

    try {
      const coinId = this.TOKEN_ID_MAP[symbol];
      if (!coinId) {
        console.warn(`No CoinGecko ID found for ${symbol}, using fallback price`);
        return this.getFallbackPrice(symbol);
      }

      const response = await fetch(
        `${this.API_BASE}/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinGeckoPrice = await response.json();
      const price = data[coinId]?.usd;

      if (typeof price !== 'number') {
        throw new Error(`Invalid price data for ${symbol}`);
      }

      // Cache the result
      this.cache[symbol] = {
        price,
        timestamp: Date.now()
      };

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return this.getFallbackPrice(symbol);
    }
  }

  private getFallbackPrice(symbol: string): number {
    // Fallback prices in case API fails
    const fallbackPrices: { [symbol: string]: number } = {
      'BTC': 45000,
      'ETH': 2500,
      'SOL': 100,
      'BNB': 300,
      'USDT': 1,
      'USDT.z': 1,
      'TETRA': 1,
      'LUIGI': 0.001
    };

    return fallbackPrices[symbol] || 1;
  }

  async getExchangeRate(fromSymbol: string, toSymbol: string): Promise<number> {
    try {
      const [fromPrice, toPrice] = await Promise.all([
        this.getPrice(fromSymbol),
        this.getPrice(toSymbol)
      ]);

      return fromPrice / toPrice;
    } catch (error) {
      console.error(`Error calculating exchange rate ${fromSymbol}/${toSymbol}:`, error);
      return 1;
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache = {};
  }
}

export const priceService = new PriceService();