import React from 'react';
import { X, Wallet } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: string) => void;
}

const WALLET_PROVIDERS = [
  {
    name: 'MetaMask',
    provider: 'metamask',
    icon: '🦊',
    description: 'Connect with MetaMask wallet'
  },
  {
    name: 'WalletConnect',
    provider: 'walletconnect',
    icon: '📱',
    description: 'Connect with mobile wallet'
  },
  {
    name: 'Phantom',
    provider: 'phantom',
    icon: '👻',
    description: 'Solana wallet'
  },
  {
    name: 'Trust Wallet',
    provider: 'trust',
    icon: '🛡️',
    description: 'Multi-chain wallet'
  }
];

const generateWalletAddress = (): string => {
  return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {WALLET_PROVIDERS.map((wallet) => (
            <button
              key={wallet.provider}
              onClick={() => {
                onConnect(wallet.provider);
                onClose();
              }}
              className="w-full flex items-center space-x-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="text-2xl">{wallet.icon}</div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-white">{wallet.name}</div>
                <div className="text-sm text-slate-400">{wallet.description}</div>
              </div>
              <Wallet className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}