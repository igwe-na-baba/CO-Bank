import React, { useState } from 'react';
import { SpinnerIcon, getServiceIcon } from './Icons';

interface LinkServiceModalProps {
    serviceName: string;
    onClose: () => void;
    onLink: (serviceName: string, identifier: string) => void;
}

export const LinkServiceModal: React.FC<LinkServiceModalProps> = ({ serviceName, onClose, onLink }) => {
    const [identifier, setIdentifier] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const ServiceIcon = getServiceIcon(serviceName);
    const identifierType = serviceName === 'CashApp' ? '$Cashtag' : serviceName === 'Zelle' ? 'Email or Phone' : 'Email Address';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;

        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            onLink(serviceName, identifier);
            // The modal will be closed by the parent component upon successful linking
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-sm m-4 relative">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        {ServiceIcon && <ServiceIcon className="w-8 h-8" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Link {serviceName} Account</h2>
                    <p className="text-slate-500 text-sm">Enter your {serviceName} account details to connect.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">{identifierType}</label>
                        <input
                            type="text"
                            id="identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                            Cancel
                        </button>
                        <button type="submit" disabled={isProcessing || !identifier.trim()} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
                            {isProcessing ? 'Linking...' : 'Link Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};