import React, { useState, useEffect } from 'react';
import { SpinnerIcon, VisaIcon, MastercardIcon } from './Icons';
import { Card } from '../types';
import { luhnCheck, validateExpiryDate, validateCvc } from '../utils/validation';

interface AddCardModalProps {
    onClose: () => void;
    onAddCard: (cardData: Omit<Card, 'id' | 'controls'>) => void;
}

type CardNetwork = 'Visa' | 'Mastercard' | 'unknown';

export const AddCardModal: React.FC<AddCardModalProps> = ({ onClose, onAddCard }) => {
    const [cardData, setCardData] = useState({
        fullNumber: '',
        cardholderName: 'Eleanor Vance', // Pre-fill for demo
        expiryDate: '',
        cvc: '',
    });
    const [cardNetwork, setCardNetwork] = useState<CardNetwork>('unknown');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const num = cardData.fullNumber.replace(/\s/g, '');
        if (num.startsWith('4')) {
            setCardNetwork('Visa');
        } else if (num.startsWith('5')) {
            setCardNetwork('Mastercard');
        } else {
            setCardNetwork('unknown');
        }
    }, [cardData.fullNumber]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'fullNumber') {
            formattedValue = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length > 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
        } else if (name === 'cvc') {
            formattedValue = value.replace(/\D/g, '').slice(0, 4);
        }
        setCardData(prev => ({...prev, [name]: formattedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const rawCardNumber = cardData.fullNumber.replace(/\s/g, '');
        if (!luhnCheck(rawCardNumber)) {
            setError('Please enter a valid card number.');
            return;
        }
        if (!cardData.cardholderName.trim() || cardData.cardholderName.trim().length < 2) {
            setError('Please enter the full cardholder name.');
            return;
        }
        const expiryError = validateExpiryDate(cardData.expiryDate);
        if (expiryError) {
            setError(expiryError);
            return;
        }
        const cvcError = validateCvc(cardData.cvc);
        if (cvcError) {
            setError(cvcError);
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            const lastFour = cardData.fullNumber.slice(-4);
            // FIX: Added the required `cardType` property, defaulting to 'CREDIT'.
            onAddCard({ ...cardData, lastFour, network: cardNetwork as 'Visa' | 'Mastercard', cardType: 'CREDIT' });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Card</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="fullNumber" className="block text-sm font-medium text-slate-700">Card Number</label>
                        <div className="mt-1 relative rounded-md shadow-digital-inset">
                            <input type="text" id="fullNumber" name="fullNumber" value={cardData.fullNumber} onChange={handleChange} className="w-full bg-transparent border-0 p-3" maxLength={19} />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                {cardNetwork === 'Visa' && <VisaIcon className="w-8 h-auto" />}
                                {cardNetwork === 'Mastercard' && <MastercardIcon className="w-8 h-auto" />}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="cardholderName" className="block text-sm font-medium text-slate-700">Cardholder Name</label>
                        <input type="text" id="cardholderName" name="cardholderName" value={cardData.cardholderName} onChange={handleChange} className="mt-1 w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700">Expiry Date</label>
                            <input type="text" id="expiryDate" name="expiryDate" value={cardData.expiryDate} onChange={handleChange} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="MM/YY" />
                        </div>
                        <div>
                            <label htmlFor="cvc" className="block text-sm font-medium text-slate-700">CVC</label>
                            <input type="text" id="cvc" name="cvc" value={cardData.cvc} onChange={handleChange} className="mt-1 block w-full bg-slate-200 border-0 p-3 rounded-md shadow-digital-inset" placeholder="123" />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">Cancel</button>
                        <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                            {isProcessing ? 'Adding Card...' : 'Add Card'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};