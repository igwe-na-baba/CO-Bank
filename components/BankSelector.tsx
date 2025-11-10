import React, { useState, useMemo, useEffect } from 'react';
import { BANKS_BY_COUNTRY } from '../constants';
import { getBankIcon, SearchIcon, XIcon } from './Icons';

interface BankSelectorProps {
    countryCode: string;
    onSelect: (bankName: string) => void;
    onClose: () => void;
}

export const BankSelector: React.FC<BankSelectorProps> = ({ countryCode, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const banks = useMemo(() => {
        const countryBanks = BANKS_BY_COUNTRY[countryCode] || [];
        const otherBanks = (BANKS_BY_COUNTRY['US'] || []).filter(b => countryCode !== 'US'); 
        const all = [...countryBanks, ...otherBanks];
        const uniqueBanks = Array.from(new Map(all.map(b => [b.name, b])).values());
        
        return uniqueBanks.filter(b =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [countryCode, searchTerm]);

    const handleSelect = (bankName: string) => {
        onSelect(bankName);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-100">Select a Bank</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex-shrink-0 p-4 border-b border-slate-700 relative">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-7 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a bank..."
                        className="w-full bg-slate-900 text-white p-3 pl-10 rounded-lg shadow-inner"
                        autoFocus
                    />
                </div>
                <ul className="flex-1 overflow-y-auto">
                    {banks.map(bank => {
                        const BankLogo = getBankIcon(bank.name);
                        return (
                             <li key={bank.name}>
                                <button
                                    onClick={() => handleSelect(bank.name)}
                                    className="w-full flex items-center space-x-4 p-4 text-slate-100 hover:bg-slate-700 text-left"
                                >
                                    <BankLogo className="w-10 h-10 rounded-md bg-white p-1" />
                                    <p className="font-semibold">{bank.name}</p>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};