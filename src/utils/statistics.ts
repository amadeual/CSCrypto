// Dynamic statistics that update twice daily with realistic growth
interface StatisticsData {
  totalVolume: number;
  totalSwaps: number;
  avgSwapSize: number;
  lastUpdate: string;
}

class StatisticsService {
  private readonly STORAGE_KEY = 'dex_statistics';
  private readonly UPDATE_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  // Base values (starting point)
  private readonly BASE_STATS = {
    totalVolume: 24800000, // $24.8M
    totalSwaps: 12847,
    avgSwapSize: 1928,
    lastUpdate: '2025-01-01T00:00:00.000Z'
  };

  // Daily growth ranges (realistic for a growing DEX)
  private readonly GROWTH_RANGES = {
    volumeMin: 0.02, // 2% minimum daily growth
    volumeMax: 0.08, // 8% maximum daily growth
    swapsMin: 0.015, // 1.5% minimum daily growth
    swapsMax: 0.06, // 6% maximum daily growth
  };

  private getStoredStats(): StatisticsData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveStats(stats: StatisticsData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  }

  private generateGrowthFactor(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private shouldUpdate(lastUpdate: string): boolean {
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    return (now - lastUpdateTime) >= this.UPDATE_INTERVAL;
  }

  private calculateDaysSinceBase(lastUpdate: string): number {
    const baseTime = new Date(this.BASE_STATS.lastUpdate).getTime();
    const updateTime = new Date(lastUpdate).getTime();
    return Math.floor((updateTime - baseTime) / (24 * 60 * 60 * 1000));
  }

  private updateStatistics(currentStats: StatisticsData): StatisticsData {
    const now = new Date().toISOString();
    
    // Calculate growth factors for this update
    const volumeGrowth = this.generateGrowthFactor(
      this.GROWTH_RANGES.volumeMin / 2, // Divide by 2 since we update twice daily
      this.GROWTH_RANGES.volumeMax / 2
    );
    
    const swapsGrowth = this.generateGrowthFactor(
      this.GROWTH_RANGES.swapsMin / 2,
      this.GROWTH_RANGES.swapsMax / 2
    );

    // Apply growth
    const newVolume = Math.floor(currentStats.totalVolume * (1 + volumeGrowth));
    const newSwaps = Math.floor(currentStats.totalSwaps * (1 + swapsGrowth));
    const newAvgSwapSize = Math.floor(newVolume / newSwaps);

    return {
      totalVolume: newVolume,
      totalSwaps: newSwaps,
      avgSwapSize: newAvgSwapSize,
      lastUpdate: now
    };
  }

  public getStatistics(): StatisticsData {
    let currentStats = this.getStoredStats();
    
    // Initialize with base stats if no stored data
    if (!currentStats) {
      currentStats = { ...this.BASE_STATS };
      this.saveStats(currentStats);
    }

    // Check if we need to update
    if (this.shouldUpdate(currentStats.lastUpdate)) {
      currentStats = this.updateStatistics(currentStats);
      this.saveStats(currentStats);
    }

    return currentStats;
  }

  public forceUpdate(): StatisticsData {
    const currentStats = this.getStoredStats() || { ...this.BASE_STATS };
    const updatedStats = this.updateStatistics(currentStats);
    this.saveStats(updatedStats);
    return updatedStats;
  }

  public formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toLocaleString()}`;
  }

  public formatNumber(num: number): string {
    return num.toLocaleString();
  }

  public formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  // Get growth percentage since yesterday (for display purposes)
  public getGrowthPercentage(): { volume: number; swaps: number } {
    const stats = this.getStatistics();
    const days = this.calculateDaysSinceBase(stats.lastUpdate);
    
    if (days === 0) {
      return { volume: 0, swaps: 0 };
    }

    // Calculate approximate daily growth based on total growth
    const totalVolumeGrowth = (stats.totalVolume - this.BASE_STATS.totalVolume) / this.BASE_STATS.totalVolume;
    const totalSwapsGrowth = (stats.totalSwaps - this.BASE_STATS.totalSwaps) / this.BASE_STATS.totalSwaps;
    
    const dailyVolumeGrowth = (totalVolumeGrowth / days) * 100;
    const dailySwapsGrowth = (totalSwapsGrowth / days) * 100;

    return {
      volume: Math.round(dailyVolumeGrowth * 100) / 100,
      swaps: Math.round(dailySwapsGrowth * 100) / 100
    };
  }
}

export const statisticsService = new StatisticsService();