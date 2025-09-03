import React from 'react';
import { X, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { SwapQuote } from '../types';

interface SwapConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quote: SwapQuote | null;
}

export function SwapConfirmModal({ isOpen, onClose, onConfirm, quote }: SwapConfirmModalProps) {
  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Confirm Swap</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Swap Details */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl mb-3">
            <div className="flex items-center space-x-3">
              <img src={quote.fromToken.logoUrl} alt={quote.fromToken.symbol} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold text-white">{parseFloat(quote.fromAmount).toLocaleString()} {quote.fromToken.symbol}</div>
                <div className="text-sm text-slate-400">{quote.fromToken.network}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <ArrowUpDown className="w-6 h-6 text-slate-400" />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <img src={quote.toToken.logoUrl} alt={quote.toToken.symbol} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-semibold text-white">{parseFloat(quote.toAmount).toLocaleString()} {quote.toToken.symbol}</div>
                <div className="text-sm text-slate-400">{quote.toToken.network}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h4 className="font-medium text-white mb-3">Transaction Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Exchange Rate</span>
              <span className="text-white">1 {quote.fromToken.symbol} = {quote.exchangeRate.toFixed(8)} {quote.toToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Price Impact</span>
              <span className="text-green-400">
                0.1%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Service Fee</span>
              <span className="text-white">$2.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Slippage Tolerance</span>
              <span className="text-white">{quote.slippage}%</span>
            </div>
          </div>
        </div>

        {/* Price Impact Warning */}
        {false && (
          <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Low Liquidity Warning</span>
            </div>
            <p className="text-sm text-amber-300 mt-1">
              This token pair has lower liquidity. Consider smaller amounts for better rates.
            </p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
        >
          Confirm Swap
        </button>
      </div>
    </div>
  );
}