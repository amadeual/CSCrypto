import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  networks: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded';
    blockHeight?: number;
  }>;
}

export function NetworkStatus({ networks }: NetworkStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'degraded':
        return 'text-amber-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'offline' ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {networks.map((network) => (
            <div
              key={network.name}
              className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{network.name}</span>
                <div className={`flex items-center space-x-2 ${getStatusColor(network.status)}`}>
                  {getStatusIcon(network.status)}
                  <span className="text-sm capitalize">{network.status}</span>
                </div>
              </div>
              
              {network.blockHeight && (
                <div className="text-sm text-gray-400">
                  Block: {network.blockHeight.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}