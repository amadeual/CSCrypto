import React from 'react';
import { Wallet, Settings } from 'lucide-react';
import { WalletState } from '../types';

interface HeaderProps {
  walletState: WalletState;
  onConnectWallet: () => void;
  onSettings: () => void;
}

export function Header({ walletState, onConnectWallet, onSettings }: HeaderProps) {
  return (
    <header className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              {/* Outer ring with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-500 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/25"></div>
              
              {/* Inner content */}
              <div className="absolute inset-0.5 bg-gray-900 rounded-[10px] flex items-center justify-center">
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {/* Stylized swap arrows */}
                  <path d="M8 3L4 7L8 11" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 7H15A4 4 0 0 1 15 15H6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21L20 17L16 13" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 17H9A4 4 0 0 1 9 9H18" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Central connecting element */}
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-500/20 to-cyan-400/20 rounded-xl blur-sm"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">CoinSwap</h1>
              <p className="text-xs sm:text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:block font-medium">Cross-chain DEX</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSettings}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {walletState.isConnected ? (
              <div className="flex items-center space-x-3 bg-gray-800/80 border border-gray-700/50 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium text-white">
                  {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                </span>
                <span className="text-xs text-gray-400 bg-gray-700/80 px-2 py-1 rounded hidden sm:inline">
                  {walletState.network}
                </span>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}