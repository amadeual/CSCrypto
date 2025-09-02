import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, Wallet, AlertCircle } from 'lucide-react';
import { SwapQuote } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  quote: SwapQuote | null;
  depositAddress: string;
}

export function PaymentModal({ isOpen, onClose, onPaymentConfirmed, quote, depositAddress }: PaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [receivingAddress, setReceivingAddress] = useState('');
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPaymentConfirmed(false);
      setTimeRemaining(15 * 60);
      setReceivingAddress('');
      setAddressError('');
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const validateAddress = (address: string, network: string): boolean => {
    if (!address.trim()) return false;
    
    switch (network) {
      case 'Solana':
        // Solana addresses are base58 encoded, typically 32-44 characters
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      case 'BEP20':
      case 'ERC20':
      case 'Base':
        // Ethereum-style addresses
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      default:
        return false;
    }
  };

  const handleAddressChange = (address: string) => {
    setReceivingAddress(address);
    if (address && quote) {
      if (!validateAddress(address, quote.toToken.network)) {
        setAddressError(`Invalid ${quote.toToken.network} address format`);
      } else {
        setAddressError('');
      }
    } else {
      setAddressError('');
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirmPayment = () => {
    if (!receivingAddress.trim()) {
      setAddressError('Please enter your receiving wallet address');
      return;
    }
    
    if (quote && !validateAddress(receivingAddress, quote.toToken.network)) {
      setAddressError(`Invalid ${quote.toToken.network} address format`);
      return;
    }

    // Update quote with receiving address
    if (quote) {
      quote.receivingAddress = receivingAddress;
    }

    setPaymentConfirmed(true);
    // Show immediate confirmation, then proceed to processing
    setTimeout(() => {
      onPaymentConfirmed();
    }, 1500);
  };

  const canConfirmPayment = receivingAddress.trim() && !addressError && !paymentConfirmed && timeRemaining > 0;
  if (!isOpen || !quote) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Send Payment</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timer */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm sm:text-base font-medium">Payment Window</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-300">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-xs sm:text-sm text-amber-300 mt-1">
            Complete your payment within this time to secure the current rate
          </p>
        </div>

        {/* Payment Instructions */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Payment Instructions</h3>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Amount to Send */}
            <div className="p-3 sm:p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm sm:text-base text-slate-400">Send exactly</span>
                <div className="flex items-center space-x-2">
                  <img src={quote.fromToken.logoUrl} alt={quote.fromToken.symbol} className="w-6 h-6 rounded-full" />
                  <span className="text-sm sm:text-base font-semibold text-white">
                    {parseFloat(quote.fromAmount).toLocaleString()} {quote.fromToken.symbol}
                  </span>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-slate-400">
                Network: {quote.fromToken.network}
              </div>
            </div>

            {/* Deposit Address */}
            <div className="p-3 sm:p-4 bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm sm:text-base text-slate-400">To this address</span>
                <button
                  onClick={() => copyToClipboard(depositAddress)}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs sm:text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs sm:text-sm text-white bg-slate-900 p-2 sm:p-3 rounded-lg break-all">
                {depositAddress}
              </div>
            </div>

            {/* Receiving Address Input */}
            <div className="p-3 sm:p-4 bg-slate-800 rounded-xl">
              <div className="mb-2">
                <span className="text-sm sm:text-base text-slate-400">Your receiving wallet address</span>
                <span className="text-red-400 ml-1">*</span>
              </div>
              <input
                type="text"
                value={receivingAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={`Enter your ${quote.toToken.network} wallet address`}
                className={`w-full p-2 sm:p-3 bg-slate-900 border rounded-lg text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none transition-all duration-200 ${
                  addressError ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {addressError && (
                <div className="flex items-center space-x-2 mt-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{addressError}</span>
                </div>
              )}
              <div className="text-xs sm:text-sm text-slate-400 mt-2">
                Network: {quote.toToken.network} • You will receive {parseFloat(quote.toAmount).toLocaleString()} {quote.toToken.symbol}
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm sm:text-base font-medium">Important</span>
          </div>
          <ul className="text-xs sm:text-sm text-red-300 space-y-1">
            <li>• Send only {quote.fromToken.symbol} to this address</li>
            <li>• Send the exact amount shown above</li>
            <li>• Do not send from an exchange wallet</li>
            <li>• Ensure you're on the correct network ({quote.fromToken.network})</li>
            <li>• Double-check your receiving wallet address</li>
          </ul>
        </div>

        {/* Confirm Payment Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={!canConfirmPayment}
          className={`w-full py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 ${
            paymentConfirmed
              ? 'bg-green-600 text-white'
              : !canConfirmPayment
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          {paymentConfirmed ? (
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Payment Confirmed</span>
            </div>
          ) : timeRemaining === 0 ? (
            'Payment Window Expired'
          ) : !receivingAddress.trim() ? (
            'Enter Receiving Address'
          ) : addressError ? (
            'Invalid Address Format'
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>I Have Sent the Payment</span>
            </div>
          )}
        </button>

        {paymentConfirmed && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-green-400">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm">Processing your exchange...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}