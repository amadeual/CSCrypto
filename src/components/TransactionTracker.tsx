import React, { useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, ArrowUpDown } from 'lucide-react';
import { Transaction } from '../types';
import { databaseService } from '../services/databaseService';

interface TransactionTrackerProps {
  transactions: Transaction[];
}

export function TransactionTracker({ transactions }: TransactionTrackerProps) {
  const [trackerId, setTrackerId] = useState('');
  const [searchResult, setSearchResult] = useState<Transaction | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!trackerId.trim()) return;

    setSearching(true);
    setNotFound(false);
    setSearchResult(null);

    try {
      // First check local transactions
      const localFound = transactions.find(tx => 
        tx.trackerId.toLowerCase() === trackerId.toLowerCase().trim()
      );

      if (localFound) {
        setSearchResult(localFound);
        return;
      }

      // If not found locally, search in database
      const dbFound = await databaseService.getTransactionByTrackerId(trackerId.trim());
      
      if (dbFound) {
        setSearchResult(dbFound);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error searching for transaction:', error);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'awaiting_payment':
        return <Clock className="w-5 h-5 text-blue-400" />;
      case 'payment_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-amber-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'awaiting_payment':
        return 'text-blue-400';
      case 'payment_confirmed':
        return 'text-green-400';
      case 'processing':
        return 'text-amber-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusMessage = (status: Transaction['status']) => {
    switch (status) {
      case 'awaiting_payment':
        return 'Waiting for payment confirmation';
      case 'payment_confirmed':
        return 'Payment confirmed, processing exchange';
      case 'processing':
        return 'Exchange in progress';
      case 'completed':
        return 'Exchange completed successfully';
      case 'failed':
        return 'Exchange failed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Track Your Transaction</h3>
        
        {/* Search Input */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={trackerId}
                onChange={(e) => {
                  setTrackerId(e.target.value);
                  setNotFound(false);
                  setSearchResult(null);
                }}
                placeholder="Enter your Tracker ID (e.g., TXN-ABC123)"
                className="w-full p-4 bg-gray-800/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!trackerId.trim() || searching}
              className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 min-w-[100px] shadow-lg hover:shadow-indigo-500/25"
            >
              {searching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Track</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Transaction Found</h4>
              <div className={`flex items-center space-x-2 ${getStatusColor(searchResult.status)}`}>
                {getStatusIcon(searchResult.status)}
                <span className="font-medium capitalize">{searchResult.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Transaction Details */}
              <div className="flex items-center justify-between p-4 bg-gray-800/80 rounded-xl">
                <div className="flex items-center space-x-3">
                  <img src={searchResult.fromToken.logoUrl} alt={searchResult.fromToken.symbol} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-white">
                      {parseFloat(searchResult.fromAmount).toLocaleString()} {searchResult.fromToken.symbol}
                    </div>
                    <div className="text-sm text-gray-400">{searchResult.fromToken.network}</div>
                  </div>
                </div>
                <ArrowUpDown className="w-5 h-5 text-gray-400" />
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {parseFloat(searchResult.toAmount).toLocaleString()} {searchResult.toToken.symbol}
                    </div>
                    <div className="text-sm text-gray-400">{searchResult.toToken.network}</div>
                  </div>
                  <img src={searchResult.toToken.logoUrl} alt={searchResult.toToken.symbol} className="w-10 h-10 rounded-full" />
                </div>
              </div>

              {/* Status Message */}
              <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="text-sm text-gray-300 mb-2">Status</div>
                <div className={`font-medium ${getStatusColor(searchResult.status)}`}>
                  {getStatusMessage(searchResult.status)}
                </div>
              </div>

              {/* Transaction Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">Tracker ID</div>
                  <div className="font-mono text-white">{searchResult.trackerId}</div>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">Date</div>
                  <div className="text-white">{searchResult.timestamp.toLocaleString()}</div>
                </div>
              </div>

              {searchResult.txHash && (
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">Transaction Hash</div>
                  <div className="font-mono text-sm text-white break-all">{searchResult.txHash}</div>
                </div>
              )}

              {searchResult.estimatedCompletion && searchResult.status === 'processing' && (
                <div className="p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
                  <div className="text-sm text-amber-400 mb-1">Estimated Completion</div>
                  <div className="text-amber-300">{searchResult.estimatedCompletion.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {notFound && (
          <div className="p-6 bg-red-900/30 border border-red-700/50 rounded-xl text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-red-400 mb-2">Transaction Not Found</h4>
            <p className="text-red-300 text-sm">
              Please check your Tracker ID and try again. Make sure you've entered it correctly.
            </p>
          </div>
        )}

        {!searchResult && !notFound && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              Enter your Tracker ID above to check the status of your transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
}