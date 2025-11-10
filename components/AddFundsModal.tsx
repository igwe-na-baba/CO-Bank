import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, VisaIcon, MastercardIcon } from './Icons';
import { luhnCheck, validateExpiryDate, validateCvc } from '../utils/validation';

interface AddFundsModalProps {
    onClose: () => void;
    onAddFunds: (amount: number, cardLastFour: string, cardNetwork: 'Visa' | 'Mastercard') => Promise<void>;
}

type ModalStep = 'form' | 'processing' | 'success';
type CardNetwork = 'Visa' | 'Mastercard' | 'unknown';

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ onClose, onAddFunds }) => {
    const [step, setStep] = useState<ModalStep>('form');
    const [amount, setAmount] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardNetwork, setCardNetwork] = useState<CardNetwork>('unknown');
    const [error, setError] = useState('');

    useEffect(() => {
        if (cardNumber.startsWith('4')) {
            setCardNetwork('Visa');
        } else if (cardNumber.startsWith('5')) {
            setCardNetwork('Mastercard');
        } else {
            setCardNetwork('unknown');
        }
    }, [cardNumber]);

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        setExpiry(value);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        const rawCardNumber = cardNumber.replace(/\s/g, '');
        if (!luhnCheck(rawCardNumber)) {
            setError('Please enter a valid card number.');
            return;
        }
        const expiryError = validateExpiryDate(expiry);
        if (expiryError) {
            setError(expiryError);
            return;
        }
        const cvcError = validateCvc(cvc);
        if (cvcError) {
            setError(cvcError);
            return;
        }

        setStep('processing');
        setTimeout(async () => {
            await onAddFunds(numericAmount, cardNumber.slice(-4), cardNetwork as 'Visa' | 'Mastercard');
            setStep('success');
        }, 2000);
    };

    const renderContent = () => {
        switch (step) {
            case 'form':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Funds from Debit Card</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
                                <div className="mt-1 relative rounded-md shadow-digital-inset">
                                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-0 p-3 pr-16" placeholder="0.00" />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-semibold">USD</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700">Card Number</label>
                                <div className="mt-1 relative rounded-md shadow-digital-inset">
                                    <input type="text" id="cardNumber" value={cardNumber.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full bg-transparent border-0 p-3" maxLength={19} />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {cardNetwork === 'Visa' && <VisaIcon className="w-8 h-auto" />}
                                        {cardNetwork === 'Mastercard' && <MastercardIcon className="w-8 h-auto" />}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="expiry" className="block text-sm font-medium text-slate-700">Expiry Date</label>
                                    <input type="text" id="expiry" value={expiry} onChange={handleExpiryChange} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="MM/YY" />
                                </div>
                                <div>
                                    <label htmlFor="cvc" className="block text-sm font-medium text-slate-700">CVC</label>
                                    <input type="text" id="cvc" value={cvc} onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="123" />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">Add Funds</button>
                            </div>
                        </form>
                    </>
                );
            case 'processing':
                return (
                    <div className="text-center p-8">
                        <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                        <h3 className="mt-4 text-xl font-bold text-slate-800">Processing Deposit</h3>
                        <p className="text-slate-600 mt-2">Please wait while we securely process your transaction.</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center p-8">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">Deposit Successful!</h3>
                        <p className="text-slate-600 mt-2">
                           <strong>{parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> has been added to your account.
                        </p>
                        <button onClick={onClose} className="mt-6 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            Done
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4">
                {renderContent()}
            </div>
        </div>
    );
};