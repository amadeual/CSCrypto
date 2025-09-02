import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, ArrowUpDown, AlertCircle, ExternalLink } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProcessing: () => void;
  transaction: Transaction | null;
}

export function TransactionSummary({ isOpen, onClose, onStartProcessing, transaction }: TransactionSummaryProps) {
  const [copied, setCopied] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen || !transaction) {
      setTimeElapsed(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, transaction]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Transaction Summary</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-xl">
          <div className="flex items-center space-x-2 text-blue-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Payment Confirmed</span>
          </div>
          <p className="text-sm text-blue-300">
            Your payment has been received and your transaction is being processed.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Exchange Details</h3>
          
          <div className="space-y-4">
            {/* From Token */}
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">You're sending</span>
                <div className="flex items-center space-x-2">
                  <img src={transaction.fromToken.logoUrl} alt={transaction.fromToken.symbol} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold text-white">
                    {parseFloat(transaction.fromAmount).toLocaleString()} {transaction.fromToken.symbol}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Network: {transaction.fromToken.network}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowUpDown className="w-5 h-5 text-slate-400" />
            </div>

            {/* To Token */}
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">You'll receive</span>
                <div className="flex items-center space-x-2">
                  <img src={transaction.toToken.logoUrl} alt={transaction.toToken.symbol} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold text-white">
                    {parseFloat(transaction.toAmount).toLocaleString()} {transaction.toToken.symbol}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400">
                Network: {transaction.toToken.network}
              </div>
            </div>
          </div>
        </div>

        {/* Tracker Information */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Transaction Tracker</h4>
            <button
              onClick={() => copyToClipboard(transaction.trackerId)}
              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="font-mono text-lg text-blue-300 bg-slate-900/50 p-3 rounded-lg text-center">
            {transaction.trackerId}
          </div>
          <p className="text-xs text-blue-200 mt-2 text-center">
            Save this ID to track your transaction status anytime
          </p>
        </div>

        {/* Transaction Info Grid */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Transaction ID</div>
            <div className="font-mono text-sm text-white">{transaction.id}</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Time Elapsed</div>
            <div className="text-white font-semibold">{formatTime(timeElapsed)}</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Status</div>
            <div className="text-blue-400 font-medium">Processing</div>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-xl">
            <div className="text-sm text-slate-400 mb-1">Est. Completion</div>
            <div className="text-white">~15 minutes</div>
          </div>
        </div>

        {/* Receiving Address */}
        {transaction.receivingAddress && (
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
            <div className="text-sm text-slate-400 mb-2">Receiving Address</div>
            <div className="font-mono text-sm text-white bg-slate-900/50 p-3 rounded-lg break-all">
              {transaction.receivingAddress}
            </div>
          </div>
        )}

        {/* Processing Timeline */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-xl">
          <h4 className="font-medium text-white mb-3">Processing Steps</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Payment Received</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-amber-400">Finding Best Route</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400">Executing Swap</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400">Sending Tokens</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Important Information</span>
          </div>
          <ul className="text-sm text-amber-300 space-y-1">
            <li>• Processing can take up to 15 minutes depending on network congestion</li>
            <li>• You can safely close this window and track progress with your Tracker ID</li>
            <li>• Do not send additional payments for this transaction</li>
            <li>• Contact support if processing takes longer than 30 minutes</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onStartProcessing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25"
          >
            View Processing Details
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200"
          >
            Continue Trading
          </button>
        </div>

        {/* Track Later Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            Want to track later? Use the{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              Transaction Tracker
            </button>{' '}
            with your Tracker ID
          </p>
        </div>
      </div>
    </div>
  );
}