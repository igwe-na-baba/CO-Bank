import React, { useState, useMemo, useEffect } from 'react';
import { CURRENCIES_LIST } from '../constants';
import { SearchIcon, XIcon } from './Icons';

interface CurrencySelectorProps {
    selectedCurrency: string;
    onSelect: (currency: string) => void;
    label: string;
    className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selectedCurrency, onSelect, label, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedCurrencyInfo = CURRENCIES_LIST.find(c => c.code === selectedCurrency);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const filteredCurrencies = useMemo(() => {
        return CURRENCIES_LIST.filter(c =>
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSelect = (currencyCode: string) => {
        onSelect(currencyCode);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={`h-full flex items-center space-x-3 bg-transparent p-3 border-r border-slate-600 ${className}`}
                aria-label={label}
            >
                {selectedCurrencyInfo ? (
                    <>
                        <img
                            src={`https://flagsapi.com/${selectedCurrencyInfo.countryCode}/shiny/32.png`}
                            alt={`${selectedCurrencyInfo.name} flag`}
                            className="w-6 h-auto rounded-sm shadow-sm animate-flag-pop"
                        />
                        <span className="font-semibold text-slate-100">{selectedCurrencyInfo.code}</span>
                        <span className="text-slate-400 text-sm">▼</span>
                    </>
                ) : (
                    <span>Select</span>
                )}
            </button>

            {isOpen && (
                 <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col m-4 animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Select a Currency</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                                <XIcon className="w-5 h-5"/>
                            </button>
                        </div>
                         <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 relative">
                            <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-7 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search currency or country..."
                                className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-3 pl-10 rounded-lg shadow-inner"
                                autoFocus
                            />
                        </div>
                        <ul className="flex-1 overflow-y-auto">
                            {filteredCurrencies.map(c => (
                                <li key={c.code}>
                                    <button
                                        onClick={() => handleSelect(c.code)}
                                        className="w-full flex items-center space-x-4 p-4 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-left"
                                    >
                                        <img src={`https://flagsapi.com/${c.countryCode}/shiny/32.png`} alt={c.name} className="w-8 rounded-md shadow-sm" />
                                        <div>
                                            <p className="font-semibold">{c.code} <span className="text-lg">{c.symbol}</span></p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.name}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};