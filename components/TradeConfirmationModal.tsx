import React, { useState } from 'react';
import { CryptoAsset } from '../types';
import { SpinnerIcon, ShieldCheckIcon } from './Icons';
import { USER_PIN } from '../constants';

interface TradeConfirmationModalProps {
    asset: CryptoAsset;
    tradeType: 'buy' | 'sell';
    usdAmount: number;
    cryptoAmount: number;
    onClose: () => void;
    onConfirm: () => boolean;
}

export const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({ asset, tradeType, usdAmount, cryptoAmount, onClose, onConfirm }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            const success = onConfirm();
            if (!success) {
                // If the parent function reports an error (e.g., insufficient funds)
                setError('Transaction failed. Please check your balance.');
                setIsProcessing(false);
            }
            // On success, the parent will handle closing the modal after its own success state.
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-sm m-4 relative">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        <ShieldCheckIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Confirm Trade</h2>
                    <p className="text-slate-500 text-sm">Review the details and enter your PIN to authorize.</p>
                </div>

                <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Action:</span>
                        <span className={`font-bold ${tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}`}>{tradeType.toUpperCase()} {asset.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-bold font-mono">{cryptoAmount.toFixed(6)} {asset.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-bold font-mono">{asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-300 pt-2 mt-2">
                        <span>Total Cost:</span>
                        <span className="font-mono">{usdAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                     <div>
                        <label htmlFor="pin" className="block text-sm font-medium text-slate-700 sr-only">Security PIN</label>
                        <input 
                            type="password" 
                            id="pin"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-48 mx-auto bg-slate-200 border-0 p-3 text-center text-3xl tracking-[.75em] rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary-400"
                            maxLength={4}
                            placeholder="----"
                            autoFocus
                        />
                      </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex space-x-3">
                        <button type="button" onClick={onClose} disabled={isProcessing} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital active:shadow-digital-inset disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isProcessing || pin.length !== 4} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md hover:shadow-lg disabled:bg-primary-300 flex items-center justify-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Confirm & Execute'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
