import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Token } from '../types';
import { getTokens } from '../data/tokens';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  excludeToken?: Token | null;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function TokenSelector({ selectedToken, onSelectToken, excludeToken, label, isOpen, onToggle }: TokenSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.token-selector-container')) {
        onToggle();
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onToggle]);
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // Force refresh tokens to clear any cached data
        const { refreshTokens } = await import('../data/tokens');
        refreshTokens();
        const tokenList = await getTokens();
        setTokens(tokenList);
      } catch (error) {
        console.error('Error loading tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);
  
  const filteredTokens = tokens.filter(token => 
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(token => excludeToken?.symbol !== token.symbol);

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    onToggle();
    setSearchTerm('');
  };

  return (
    <div className="relative token-selector-container">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      
      {/* Selected Token Display */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all duration-200"
      >
        {selectedToken ? (
          <div className="flex items-center space-x-3">
            <img src={selectedToken.logoUrl} alt={selectedToken.symbol} className="w-8 h-8 rounded-full" />
            <div className="text-left">
              <div className="font-semibold text-white">{selectedToken.symbol}</div>
              <div className="text-sm text-gray-400">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Select a token</span>
        )}
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Token Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl z-[99999] max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading tokens...
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No tokens found
              </div>
            ) : (
              <>
                {filteredTokens.map((token) => (
                  <button
                    key={`${token.symbol}-${token.network}`}
                    onClick={() => handleSelectToken(token)}
                    className="w-full flex items-center space-x-3 p-4 hover:bg-gray-700/80 transition-colors duration-150"
                  >
                    <img src={token.logoUrl} alt={token.symbol} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 bg-gray-700/80 px-2 py-1 rounded">
                        {token.network}
                      </div>
                      {token.minimumSwap && (
                        <div className="text-xs text-amber-400 mt-1">
                          Min: {token.minimumSwap.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}
                  </div>
        </div>
      )}
    </div>
  );
}