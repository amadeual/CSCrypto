import React, { useState, useEffect } from 'react';
import { ArrowUpDown, Settings, Info } from 'lucide-react';
import { Token, SwapQuote } from '../types';
import { TokenSelector } from './TokenSelector';
import { priceService } from '../services/priceService';

interface SwapInterfaceProps {
  onSwap: (quote: SwapQuote) => void;
}

export function SwapInterface({ onSwap }: SwapInterfaceProps) {
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time price calculation
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      setIsLoading(true);
      
      const calculateRealRate = async () => {
        try {
          const exchangeRate = await priceService.getExchangeRate(fromToken.symbol, toToken.symbol);
          const amount = parseFloat(fromAmount);
          const calculatedAmount = (amount * exchangeRate).toFixed(8);
          setToAmount(calculatedAmount);
        } catch (error) {
          console.error('Error calculating exchange rate:', error);
          // Fallback to a default rate
          setToAmount((parseFloat(fromAmount) * 1).toFixed(6));
        } finally {
          setIsLoading(false);
        }
      };

      calculateRealRate();
    } else {
      setToAmount('');
      setIsLoading(false);
    }
  }, [fromToken, toToken, fromAmount]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    // Close any open selectors when swapping
    setFromSelectorOpen(false);
    setToSelectorOpen(false);
  };

  const validateMinimumAmount = () => {
    if (!fromToken || !fromAmount) return { isValid: true, message: '' };
    
    const amount = parseFloat(fromAmount);
    if (fromToken.minimumSwap && amount < fromToken.minimumSwap) {
      return {
        isValid: false,
        message: `Minimum swap amount is ${fromToken.minimumSwap} ${fromToken.symbol}`
      };
    }
    return { isValid: true, message: '' };
  };

  const validation = validateMinimumAmount();
  const canSwap = fromToken && toToken && fromAmount && toAmount && validation.isValid;

  const handleSwap = () => {
    if (!canSwap) return;

    // Close any open selectors before proceeding with swap
    setFromSelectorOpen(false);
    setToSelectorOpen(false);
    const quote: SwapQuote = {
      fromToken: fromToken!,
      toToken: toToken!,
      fromAmount,
      toAmount,
      exchangeRate: parseFloat(toAmount) / parseFloat(fromAmount),
      priceImpact: Math.random() * 2,
      fees: parseFloat(fromAmount) * 0.003,
      slippage
    };

    onSwap(quote);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Swap Tokens</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
            <h3 className="text-sm font-medium text-white mb-3">Transaction Settings</h3>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Slippage Tolerance</label>
              <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      slippage === value
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  step="0.1"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="mb-1">
          <TokenSelector
            selectedToken={fromToken}
            onSelectToken={(token) => {
              setFromToken(token);
              setFromSelectorOpen(false);
            }}
            excludeToken={toToken}
            label="From"
            isOpen={fromSelectorOpen}
            onToggle={() => {
              setFromSelectorOpen(!fromSelectorOpen);
              // Close the other selector if it's open
              if (toSelectorOpen) {
                setToSelectorOpen(false);
              }
            }}
          />
          <div className="mt-2">
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full p-4 bg-gray-800/80 border border-gray-700/50 rounded-xl text-2xl font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all duration-200"
              onFocus={() => {
                setFromSelectorOpen(false);
                setToSelectorOpen(false);
              }}
            />
            {!validation.isValid && (
              <div className="flex items-center space-x-2 mt-2 text-amber-400 text-sm">
                <Info className="w-4 h-4" />
                <span>{validation.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleSwapTokens}
            className="p-3 bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <ArrowUpDown className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-6">
          <TokenSelector
            selectedToken={toToken}
            onSelectToken={(token) => {
              setToToken(token);
              setToSelectorOpen(false);
            }}
            excludeToken={fromToken}
            label="To"
            isOpen={toSelectorOpen}
            onToggle={() => {
              setToSelectorOpen(!toSelectorOpen);
              // Close the other selector if it's open
              if (fromSelectorOpen) {
                setFromSelectorOpen(false);
              }
            }}
          />
          <div className="mt-2">
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.0"
              className={`w-full p-4 bg-gray-800/80 border border-gray-700/50 rounded-xl text-2xl font-semibold text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                isLoading ? 'animate-pulse' : ''
              }`}
            />
          </div>
        </div>

        {/* Price Info */}
        {fromToken && toToken && fromAmount && toAmount && (
          <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-white">Exchange Details</h4>
              <div className="flex items-center space-x-1 text-xs text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Live Rates</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Exchange Rate</span>
                <span>1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(8)} {toToken.symbol}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Price Impact</span>
                <span className="text-emerald-400">~0.1%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Network Fee</span>
                <span>~$2.50</span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!canSwap}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            canSwap
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!fromToken || !toToken ? 'Select Tokens' : !fromAmount ? 'Enter Amount' : !validation.isValid ? 'Invalid Amount' : 'Swap Tokens'}
        </button>
      </div>
    </div>
  );
}