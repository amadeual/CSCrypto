import React from 'react';
import { Clock, CheckCircle, XCircle, ExternalLink, ArrowUpDown, Wallet } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'awaiting_payment':
        return <Wallet className="w-4 h-4 text-blue-400" />;
      case 'payment_confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
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
      case 'pending':
        return 'text-amber-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl p-8 text-center">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Transactions Yet</h3>
          <p className="text-slate-400">Your swap history will appear here once you make your first trade. All transactions are securely stored and can be tracked anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
        
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img src={tx.fromToken.logoUrl} alt={tx.fromToken.symbol} className="w-8 h-8 rounded-full" />
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <img src={tx.toToken.logoUrl} alt={tx.toToken.symbol} className="w-8 h-8 rounded-full" />
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white">
                      {parseFloat(tx.fromAmount).toLocaleString()} {tx.fromToken.symbol} → {parseFloat(tx.toAmount).toLocaleString()} {tx.toToken.symbol}
                    </div>
                    <div className="text-sm text-slate-400">
                      {tx.timestamp.toLocaleString()} • ID: {tx.trackerId}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-2 ${getStatusColor(tx.status)}`}>
                    {getStatusIcon(tx.status)}
                    <span className="text-sm font-medium capitalize">{tx.status}</span>
                  </div>
                  
                  {tx.txHash && (
                    <button className="text-slate-400 hover:text-blue-400 transition-colors duration-200">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}