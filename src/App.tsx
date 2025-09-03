import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SwapInterface } from './components/SwapInterface';
import { TransactionHistory } from './components/TransactionHistory';
import { TransactionTracker } from './components/TransactionTracker';
import { NetworkStatus } from './components/NetworkStatus';
import { WalletModal } from './components/WalletModal';
import { PaymentModal } from './components/PaymentModal';
import { TransactionSummary } from './components/TransactionSummary';
import { ExchangeProcessingModal } from './components/ExchangeProcessingModal';
import { Transaction, SwapQuote, WalletState } from './types';
import { databaseService } from './services/databaseService';
import { refreshTokens } from './data/tokens';
import { statisticsService } from './utils/statistics';

// Generate unique tracker ID
const generateTrackerId = (): string => {
  const prefix = 'TXN';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
};

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<SwapQuote | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [statistics, setStatistics] = useState(statisticsService.getStatistics());

  // Load transactions on component mount
  useEffect(() => {
    // Clear token cache on app start to ensure fresh data
    refreshTokens();
    
    const loadTransactions = async () => {
      try {
        const txs = await databaseService.getTransactions(walletState.address);
        setTransactions(txs);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [walletState.address]);

  // Update statistics periodically
  useEffect(() => {
    const updateStats = () => {
      setStatistics(statisticsService.getStatistics());
    };

    // Update immediately
    updateStats();

    // Set up interval to check for updates every minute
    const interval = setInterval(updateStats, 60000);

    return () => clearInterval(interval);
  }, []);

  const networkStatus = [
    { name: 'Ethereum', status: 'online' as const, blockHeight: 18750234 },
    { name: 'BSC', status: 'online' as const, blockHeight: 32874563 },
    { name: 'Solana', status: 'online' as const, blockHeight: 231456789 },
    { name: 'Base', status: 'degraded' as const, blockHeight: 8234567 }
  ];

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleWalletConnect = (provider: string) => {
    // Mock wallet connection
    setTimeout(() => {
      setWalletState({
        isConnected: true,
        address: '0x742d35Cc6635C0532925a3b8D8620077de63CB4B',
        network: 'Ethereum',
        provider
      });
    }, 1000);
  };

  const handleSwap = (quote: SwapQuote) => {
    setPendingQuote(quote);
    setShowPaymentModal(true);
  };

  const generateDepositAddress = (token: Token): string => {
    // Use specific deposit addresses based on network
    const addresses = {
      'Solana': '5RhcvXC4ewE4tUYyQYaauYkof4mwz1Qx9At9pgEAq9d9',
      'BEP20': '0xd780270A1487d3Cb23821f0FE18dd8Fc064200CA',
      'ERC20': '0xd780270A1487d3Cb23821f0FE18dd8Fc064200CA',
      'Base': '0xd780270A1487d3Cb23821f0FE18dd8Fc064200CA',
      'TRC20': 'TSWCuNsDPAji1efEXraxgpyynU6DUad5aa',
      'BTC': 'bc1qx76p3qc6qsk236nrl7vg8vk2uy7drq9aawmwas'
    };
    
    // Handle special cases for specific tokens
    if (token.symbol === 'BTC') {
      return addresses['BTC'];
    }
    if (token.symbol === 'USDT' && token.network === 'TRC20') {
      return addresses['TRC20'];
    }
    
    return addresses[token.network] || addresses['ERC20'];
  };

  const handlePaymentConfirmed = async () => {
    if (!pendingQuote) return;

    const depositAddress = generateDepositAddress(pendingQuote.fromToken);

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      trackerId: generateTrackerId(),
      fromToken: pendingQuote.fromToken,
      toToken: pendingQuote.toToken,
      fromAmount: pendingQuote.fromAmount,
      toAmount: pendingQuote.toAmount,
      status: 'payment_confirmed',
      timestamp: new Date(),
      depositAddress,
      receivingAddress: pendingQuote.receivingAddress,
      estimatedCompletion: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    };

    // Save to database
    try {
      const savedTransaction = await databaseService.createTransaction(newTransaction, pendingQuote);
      if (savedTransaction) {
        setTransactions(prev => [savedTransaction, ...prev]);
        setCurrentTransaction(savedTransaction);
      } else {
        // Fallback to local state if database save fails
        setTransactions(prev => [newTransaction, ...prev]);
        setCurrentTransaction(newTransaction);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Fallback to local state
      setTransactions(prev => [newTransaction, ...prev]);
      setCurrentTransaction(newTransaction);
    }

    setShowPaymentModal(false);
    setShowSummaryModal(true);
    setPendingQuote(null);
  };

  const handleStartProcessing = async () => {
    if (currentTransaction) {
      // Update transaction status to processing
      const updatedTransaction = {
        ...currentTransaction,
        status: 'processing' as const
      };
      
      // Update in database
      try {
        const savedTransaction = await databaseService.updateTransaction(
          updatedTransaction.id, 
          updatedTransaction
        );
        if (savedTransaction) {
          setTransactions(prev => 
            prev.map(tx => 
              tx.id === savedTransaction.id ? savedTransaction : tx
            )
          );
          setCurrentTransaction(savedTransaction);
        }
      } catch (error) {
        console.error('Error updating transaction:', error);
        // Fallback to local state update
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === updatedTransaction.id ? updatedTransaction : tx
          )
        );
        setCurrentTransaction(updatedTransaction);
      }
    }
    setShowSummaryModal(false);
    setShowProcessingModal(true);
  };

  const handleProcessingComplete = async (completedTransaction: Transaction) => {
    // Update in database
    try {
      const savedTransaction = await databaseService.updateTransaction(
        completedTransaction.id,
        completedTransaction
      );
      if (savedTransaction) {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === savedTransaction.id ? savedTransaction : tx
          )
        );
      }
    } catch (error) {
      console.error('Error updating completed transaction:', error);
      // Fallback to local state update
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === completedTransaction.id ? completedTransaction : tx
        )
      );
    }

    setShowProcessingModal(false);
    setCurrentTransaction(null);
  };

  const handleSettings = () => {
    // Settings implementation would go here
    console.log('Settings clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%236366f1%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <Header 
          walletState={walletState}
          onConnectWallet={handleConnectWallet}
          onSettings={handleSettings}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Trade Across All{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Blockchains
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Seamlessly swap tokens across Ethereum, BSC, Solana, and Base networks without registration
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Swap Interface */}
            <div className="flex-1 flex justify-center">
              <SwapInterface onSwap={handleSwap} />
            </div>

            {/* Side Panel */}
            <div className="w-full lg:w-96 space-y-6">
              <NetworkStatus networks={networkStatus} />
              
              {/* Quick Stats */}
              <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">24h Volume</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Volume</span>
                    <span className="text-white font-semibold">{statisticsService.formatVolume(statistics.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Swaps</span>
                    <span className="text-white font-semibold">{statisticsService.formatNumber(statistics.totalSwaps)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg. Swap Size</span>
                    <span className="text-white font-semibold">{statisticsService.formatCurrency(statistics.avgSwapSize)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <TransactionTracker transactions={transactions} />

          {/* Why Choose Our DEX Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our DEX?</h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
              Experience the future of decentralized trading
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Lightning Fast */}
              <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Lightning Fast</h3>
                <p className="text-gray-300 leading-relaxed">
                  Execute swaps in seconds across multiple networks with our optimized routing algorithm. No more waiting for slow confirmations.
                </p>
              </div>

              {/* Secure & Trustless */}
              <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Secure & Trustless</h3>
                <p className="text-gray-300 leading-relaxed">
                  Your funds never leave your wallet. Trade directly from your own custody with smart contract security and zero counterparty risk.
                </p>
              </div>

              {/* Best Rates */}
              <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Best Rates</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our smart routing finds the best prices across multiple liquidity sources, ensuring you get maximum value for every trade.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={handleWalletConnect}
        />

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentConfirmed={handlePaymentConfirmed}
          quote={pendingQuote}
          depositAddress={pendingQuote ? generateDepositAddress(pendingQuote.fromToken) : ''}
        />

        <TransactionSummary
          isOpen={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          onStartProcessing={handleStartProcessing}
          transaction={currentTransaction}
        />

        <ExchangeProcessingModal
          isOpen={showProcessingModal}
          onClose={() => setShowProcessingModal(false)}
          transaction={currentTransaction}
          onProcessingComplete={handleProcessingComplete}
        />
      </div>
    </div>
  );
}

export default App;