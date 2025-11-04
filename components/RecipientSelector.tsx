import React, { useState, useMemo, useEffect } from 'react';
import { Recipient } from '../types';
import { SearchIcon, XIcon, getBankIcon } from './Icons';

interface RecipientSelectorProps {
    recipients: Recipient[];
    onSelect: (recipient: Recipient) => void;
    onClose: () => void;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({ recipients, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const filteredRecipients = useMemo(() => {
        return recipients.filter(r =>
            r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (r.nickname && r.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
            r.bankName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, recipients]);

    const handleSelect = (recipient: Recipient) => {
        onSelect(recipient);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col m-4 animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Select a Recipient</h3>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-shrink-0 p-4 border-b border-slate-200 relative">
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-7 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, nickname, or bank..."
                        className="w-full bg-white text-slate-800 p-3 pl-10 rounded-lg shadow-inner"
                        autoFocus
                    />
                </div>
                <ul className="flex-1 overflow-y-auto">
                    {filteredRecipients.map(recipient => {
                        const BankLogo = getBankIcon(recipient.bankName);
                        return (
                            <li key={recipient.id}>
                                <button
                                    onClick={() => handleSelect(recipient)}
                                    className="w-full flex items-center space-x-4 p-4 text-slate-800 hover:bg-slate-200 text-left"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white flex-shrink-0 flex items-center justify-center p-1 shadow-md">
                                        <BankLogo className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{recipient.nickname || recipient.fullName}</p>
                                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                                            <img src={`https://flagcdn.com/w20/${recipient.country.code.toLowerCase()}.png`} alt={recipient.country.name} className="w-5 rounded-sm" />
                                            <span>{recipient.bankName} &bull; {recipient.accountNumber}</span>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
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
