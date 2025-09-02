import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ArrowUpDown, Loader } from 'lucide-react';
import { Transaction } from '../types';

interface ExchangeProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onProcessingComplete: (transaction: Transaction) => void;
}

const PROCESSING_STEPS = [
  { id: 1, label: 'Payment Received', description: 'Your payment has been confirmed on the blockchain', duration: 45000 },
  { id: 2, label: 'Finding Best Route', description: 'Analyzing liquidity pools for optimal exchange rate', duration: 75000 },
  { id: 3, label: 'Executing Swap', description: 'Processing your token exchange across networks', duration: 120000 },
  { id: 4, label: 'Sending Tokens', description: 'Transferring tokens to your destination wallet', duration: 60000 }
];

export function ExchangeProcessingModal({ isOpen, onClose, transaction, onProcessingComplete }: ExchangeProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    if (!isOpen || !transaction) return;

    setCurrentStep(1);
    setIsCompleted(false);
    setTimeRemaining(300);

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Step progression based on realistic timing
    let stepTimeouts: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;

    PROCESSING_STEPS.forEach((step, index) => {
      cumulativeTime += step.duration;
      const timeout = setTimeout(() => {
        setCurrentStep(step.id);
        if (step.id === PROCESSING_STEPS.length) {
          setTimeout(() => {
            setIsCompleted(true);
            const completedTransaction = {
              ...transaction,
              status: 'completed' as const,
              txHash: '0x' + Math.random().toString(36).substr(2, 64)
            };
            onProcessingComplete(completedTransaction);
          }, 2000);
        }
      }, cumulativeTime);
      stepTimeouts.push(timeout);
    });

    return () => {
      clearInterval(timerInterval);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isOpen, transaction, onProcessingComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
            {isCompleted ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <ArrowUpDown className="w-8 h-8 text-white animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isCompleted ? 'Exchange Complete!' : 'Processing Exchange'}
          </h2>
          <p className="text-slate-400">
            {isCompleted 
              ? 'Your tokens have been successfully exchanged'
              : 'Please wait while we process your transaction. This can take up to 15 minutes.'
            }
          </p>
          {!isCompleted && (
            <div className="mt-3 text-lg font-semibold text-blue-400">
              Estimated time: {formatTime(timeRemaining)}
            </div>
          )}
          {!isCompleted && (
            <div className="mt-2 text-sm text-slate-500">
              Processing time may vary depending on network congestion
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="mb-6 p-4 bg-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <img src={transaction.fromToken.logoUrl} alt={transaction.fromToken.symbol} className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-white">
                {parseFloat(transaction.fromAmount).toLocaleString()} {transaction.fromToken.symbol}
              </span>
            </div>
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <div className="flex items-center space-x-2">
              <img src={transaction.toToken.logoUrl} alt={transaction.toToken.symbol} className="w-8 h-8 rounded-full" />
              <span className="font-semibold text-white">
                {parseFloat(transaction.toAmount).toLocaleString()} {transaction.toToken.symbol}
              </span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm text-slate-400">
              Transaction ID: {transaction.id}
            </div>
            <div className="text-lg font-semibold text-blue-400">
              Tracker ID: {transaction.trackerId}
            </div>
            <div className="text-xs text-slate-500">
              Save this ID to track your transaction
            </div>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-6">
          {PROCESSING_STEPS.map((step) => {
            const isActive = currentStep === step.id && !isCompleted;
            const isCompleted = currentStep > step.id || (step.id === PROCESSING_STEPS.length && isCompleted);
            const isPending = currentStep < step.id && !isCompleted;

            return (
              <div key={step.id} className="flex items-start space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                    ? 'bg-blue-500' 
                    : 'bg-slate-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : isActive ? (
                    <Loader className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-sm text-slate-500">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isCompleted ? (
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-green-500/25"
          >
            Continue Trading
          </button>
        ) : (
          <div className="text-center">
            <div className="text-slate-400 text-sm mb-2">
              Processing your exchange... This may take up to 15 minutes.
            </div>
            <div className="text-xs text-slate-500">
              You can safely close this window and track progress with your Tracker ID
            </div>
          </div>
        )}
      </div>
    </div>
  );
}