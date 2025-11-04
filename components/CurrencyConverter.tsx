import React, { useState, useMemo, useEffect } from 'react';
import { EXCHANGE_RATES } from '../constants';
import { ArrowsRightLeftIcon, SpinnerIcon } from './Icons';
import { CurrencySelector } from './CurrencySelector';

export const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GBP');
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
        setRefreshCountdown(prev => {
            if (prev <= 1) {
                // In a real app, you would re-fetch rates here.
                // For this demo, we just reset the timer.
                return 30;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { convertedAmount, exchangeRate } = useMemo(() => {
    const numericAmount = parseFloat(amount) || 0;
    const fromRate = EXCHANGE_RATES[fromCurrency];
    const toRate = EXCHANGE_RATES[toCurrency];

    if (!fromRate || !toRate) {
      return { convertedAmount: 0, exchangeRate: 0 };
    }

    // Convert the amount to the base currency (USD) first, then to the target currency.
    const amountInBase = numericAmount / fromRate;
    const finalAmount = amountInBase * toRate;
    
    // Calculate the direct exchange rate for 1 unit of the 'from' currency
    const directRate = (1 / fromRate) * toRate;

    return { convertedAmount: finalAmount, exchangeRate: directRate };
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-slate-700/50 rounded-2xl shadow-digital">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-100">Quick Currency Converter</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 items-end gap-4">
            {/* From Input */}
            <div className="md:col-span-2">
                <label htmlFor="from-amount" className="block text-sm font-medium text-slate-300 mb-1">From</label>
                <div className="flex items-stretch rounded-md shadow-inner bg-slate-800/50 border border-slate-600">
                    <CurrencySelector
                        label="From currency"
                        selectedCurrency={fromCurrency}
                        onSelect={setFromCurrency}
                    />
                    <input 
                        type="number" 
                        id="from-amount" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        className="block w-full border-0 p-3 rounded-r-md bg-transparent text-right font-mono text-lg text-slate-100"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
                <button 
                    onClick={handleSwapCurrencies}
                    className="p-3 rounded-full text-slate-300 transition-shadow bg-slate-800/60 shadow-digital active:shadow-digital-inset"
                    aria-label="Swap currencies"
                >
                    <ArrowsRightLeftIcon className="w-5 h-5" />
                </button>
            </div>

            {/* To Input (Result) */}
            <div className="md:col-span-2">
                <label htmlFor="to-amount" className="block text-sm font-medium text-slate-300 mb-1">To</label>
                 <div className="flex items-stretch rounded-md shadow-inner bg-slate-800/50 border border-slate-600">
                    <CurrencySelector
                        label="To currency"
                        selectedCurrency={toCurrency}
                        onSelect={setToCurrency}
                    />
                    <input 
                        type="text" 
                        id="to-amount" 
                        value={convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        readOnly
                        className="block w-full p-3 border-0 rounded-r-md bg-transparent text-right font-mono text-lg text-slate-100 font-semibold focus:outline-none"
                        aria-label="Converted amount"
                    />
                </div>
            </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
             <p className="text-sm font-semibold text-slate-200">
                1 {fromCurrency} = {exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {toCurrency}
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mt-2">
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                <span>Live rate refreshes in {refreshCountdown}s</span>
            </div>
        </div>
      </div>
    </div>
  );
};