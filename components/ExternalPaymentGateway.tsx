import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, CreditCardIcon, VisaIcon, MastercardIcon, ICreditUnionLogo, ArrowLeftIcon } from './Icons';
import { luhnCheck, validateExpiryDate, validateCvc } from '../utils/validation';

interface ExternalPaymentGatewayProps {
    amount: number;
    onPaymentSuccess: () => void;
    onBack: () => void;
}

type CardNetwork = 'Visa' | 'Mastercard' | 'unknown';
type Status = 'form' | 'processing' | 'success';

export const ExternalPaymentGateway: React.FC<ExternalPaymentGatewayProps> = ({ amount, onPaymentSuccess, onBack }) => {
    const [status, setStatus] = useState<Status>('form');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: 'Randy M. Chitwood' });
    const [cardNetwork, setCardNetwork] = useState<CardNetwork>('unknown');
    const [error, setError] = useState('');

    useEffect(() => {
        if (cardData.number.startsWith('4')) {
            setCardNetwork('Visa');
        } else if (cardData.number.startsWith('5')) {
            setCardNetwork('Mastercard');
        } else {
            setCardNetwork('unknown');
        }
    }, [cardData.number]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }
        setCardData(prev => ({ ...prev, [name]: formattedValue }));
        if (error) setError('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const rawCardNumber = cardData.number.replace(/\s/g, '');
        if (!luhnCheck(rawCardNumber)) {
            return setError('Please enter a valid card number.');
        }
        const expiryError = validateExpiryDate(cardData.expiry);
        if (expiryError) {
            return setError(expiryError);
        }
        const cvcError = validateCvc(cardData.cvc);
        if (cvcError) {
            return setError(cvcError);
        }
        if (!cardData.name.trim()) {
            return setError('Please enter the cardholder name.');
        }

        setStatus('processing');
        setTimeout(() => {
            setStatus('success');
            setTimeout(onPaymentSuccess, 1500); // Trigger the final step after showing success
        }, 2000);
    };

    return (
        <div className="bg-slate-100 text-slate-800 rounded-2xl shadow-2xl w-full max-w-md m-4 animate-fade-in-up relative">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-primary">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <ICreditUnionLogo />
            </div>

            {status === 'form' && (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-slate-500">You are paying iCredit Union®</p>
                        <p className="text-4xl font-bold font-mono text-slate-800">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        <p className="text-xs text-slate-500 mt-1">for: IMF Clearance Fee</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Card Number</label>
                        <div className="mt-1 relative rounded-md shadow-digital-inset">
                            <input type="text" name="number" value={cardData.number} onChange={handleChange} className="w-full bg-transparent border-0 p-3" maxLength={19} required/>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {cardNetwork === 'Visa' && <VisaIcon className="w-8 h-auto" />}
                                {cardNetwork === 'Mastercard' && <MastercardIcon className="w-8 h-auto" />}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                            <input type="text" name="expiry" value={cardData.expiry} onChange={handleChange} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="MM/YY" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">CVC</label>
                            <input type="text" name="cvc" value={cardData.cvc} onChange={handleChange} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="123" required/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Cardholder Name</label>
                        <input type="text" name="name" value={cardData.name} onChange={handleChange} className="mt-1 w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" required/>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <button type="submit" className="w-full py-3 mt-4 text-white bg-primary rounded-lg font-semibold shadow-md">
                        Pay Securely
                    </button>
                </form>
            )}

            {status === 'processing' && (
                <div className="p-12 text-center">
                    <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                    <h3 className="mt-4 text-xl font-bold text-slate-800">Processing Payment...</h3>
                </div>
            )}
            
            {status === 'success' && (
                <div className="p-12 text-center animate-fade-in-up">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="mt-4 text-2xl font-bold text-slate-800">Payment Successful!</h3>
                    <p className="text-slate-600 mt-2">Your transaction will now be released.</p>
                </div>
            )}
        </div>
    );
};