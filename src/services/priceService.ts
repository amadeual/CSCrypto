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
    'USDT.z': 'tether',
    'TETRA': 'tether',
    'PEPE': 'pepe',
    'USDC': 'usd-coin'
    // LUIGI has custom pricing - see getPrice method
  };

  // Custom token prices that don't use CoinGecko
  private readonly CUSTOM_PRICES: { [symbol: string]: number } = {
    'LUIGI': 0.002017 // 1 LUIGI = 0.002017 USDT (updated daily)
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

    // Check for custom prices first
    if (this.CUSTOM_PRICES[symbol]) {
      const price = this.CUSTOM_PRICES[symbol];
      // Cache the custom price
      this.cache[symbol] = {
        price,
        timestamp: Date.now()
      };
      return price;
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
      'LUIGI': 0.002017,
      'PEPE': 0.000001,
      'USDC': 1
    };

    return fallbackPrices[symbol] || 1;
  }

  async getExchangeRate(fromSymbol: string, toSymbol: string): Promise<number> {
    try {
      // Special handling for LUIGI conversions to ensure accuracy
      if (fromSymbol === 'LUIGI' || toSymbol === 'LUIGI') {
        const luigiPrice = this.CUSTOM_PRICES['LUIGI'] || 0.002017;
        
        if (fromSymbol === 'LUIGI') {
          const toPrice = await this.getPrice(toSymbol);
          return luigiPrice / toPrice;
        } else {
          const fromPrice = await this.getPrice(fromSymbol);
          return fromPrice / luigiPrice;
        }
      }

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

  // Update LUIGI price (for admin use)
  updateLuigiPrice(newPrice: number): void {
    this.CUSTOM_PRICES['LUIGI'] = newPrice;
    // Clear LUIGI from cache to force refresh
    delete this.cache['LUIGI'];
    console.log(`LUIGI price updated to ${newPrice} USDT`);
  }
}

export const priceService = new PriceService();