import React from 'react';
import { WalletDetails, WalletTransaction } from '../types';
import { INITIAL_WALLET_TRANSACTIONS } from '../constants';
import { ICreditUnionLogo, CreditCardIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from './Icons';
import { timeSince } from '../utils/time';

interface DigitalWalletProps {
    wallet: WalletDetails;
}

const TransactionRow: React.FC<{ transaction: WalletTransaction }> = ({ transaction }) => {
    const isCredit = transaction.type === 'credit';
    const amountColor = isCredit ? 'text-green-500' : 'text-slate-800';
    const sign = isCredit ? '+' : '-';

    return (
        <li className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-digital-inset ${isCredit ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-600'}`}>
                    {isCredit ? <ArrowDownCircleIcon className="w-6 h-6" /> : <ArrowUpCircleIcon className="w-6 h-6" />}
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-500">{timeSince(transaction.date)}</p>
                </div>
            </div>
            <p className={`font-semibold font-mono ${amountColor}`}>
                {sign}{transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
        </li>
    );
};

export const DigitalWallet: React.FC<DigitalWalletProps> = ({ wallet }) => {
    // For the demo, we'll use the static transactions from constants
    const transactions = INITIAL_WALLET_TRANSACTIONS;

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Digital Wallet</h2>
                <p className="text-sm text-slate-500 mt-1">Instant P2P payments and online spending, all in one place.</p>
            </div>

            {/* Wallet Card and Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div 
                    className="relative w-full max-w-md mx-auto rounded-2xl text-white shadow-lg bg-cover bg-center animate-card-zoom"
                    style={{ 
                        backgroundImage: `url('https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=2940&auto=format&fit=crop')`,
                        height: '224px',
                        animationDuration: '20s',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-blue-800 to-slate-900 opacity-90 rounded-2xl"></div>
                    <div className="relative z-10 p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start">
                            <ICreditUnionLogo />
                            <CreditCardIcon className="w-8 h-8" />
                        </div>
                        <div className="mt-auto">
                            <span className="block text-sm opacity-80">Wallet Balance</span>
                            <span className="block font-mono text-4xl tracking-wider">{wallet.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            <span className="block font-mono text-lg opacity-80 mt-2">•••• •••• •••• {wallet.cardLastFour}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <button className="w-full flex items-center justify-center space-x-3 py-4 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <ArrowUpCircleIcon className="w-6 h-6"/>
                        <span className="font-semibold">Send Money</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-3 py-4 bg-slate-200 text-slate-800 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                        <ArrowDownCircleIcon className="w-6 h-6"/>
                        <span className="font-semibold">Top Up Wallet</span>
                    </button>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">Recent Wallet Activity</h3>
                {transactions.length > 0 ? (
                    <ul className="divide-y divide-slate-300 px-6">
                        {transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-slate-500 p-6">No wallet transactions yet.</p>
                )}
            </div>
        </div>
    );
};
