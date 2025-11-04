import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon } from './Icons';

interface ContactSupportModalProps {
    onClose: () => void;
    onSubmit: (data: { topic: string; transactionId?: string; message: string }) => Promise<void>;
    transactions: { id: string }[];
    initialTransactionId?: string;
}

const supportTopics = [
    "General Inquiry",
    "Transaction Issue",
    "Security Concern",
    "Card Management",
    "Account Help",
    "Technical Issue"
];

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ onClose, onSubmit, transactions, initialTransactionId }) => {
    const [topic, setTopic] = useState(supportTopics[0]);
    const [transactionId, setTransactionId] = useState('');
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if(initialTransactionId) {
            setTopic("Transaction Issue");
            setTransactionId(initialTransactionId);
        }
    }, [initialTransactionId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!message.trim()) {
            setError('Please provide a detailed message.');
            return;
        }

        setIsProcessing(true);
        await onSubmit({ topic, transactionId, message });
        setIsProcessing(false);
        setIsSuccess(true);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-digital w-full max-w-lg m-4 border border-white/10 animate-fade-in-up">
                {isSuccess ? (
                    <div className="p-8 text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-100">Thank You!</h2>
                        <p className="text-slate-300 mt-2">Your support request has been submitted. You will receive an email and SMS confirmation shortly. Our team will get back to you as soon as possible.</p>
                        <button onClick={onClose} className="mt-6 w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-slate-100 mb-4">Contact Support</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Topic</label>
                                    <select value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 p-3 rounded-md">
                                        {supportTopics.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                {topic === "Transaction Issue" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300">Transaction ID (Optional)</label>
                                        <input list="transaction-ids" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 p-3 rounded-md" />
                                        <datalist id="transaction-ids">
                                            {transactions.map(t => <option key={t.id} value={t.id} />)}
                                        </datalist>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300">Message</label>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 p-3 rounded-md" placeholder="Please describe your issue in detail..."></textarea>
                                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-900/50 rounded-b-2xl flex justify-end space-x-3">
                            <button type="button" onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg">Cancel</button>
                            <button type="submit" disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md flex items-center">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5 mr-2"/> : null}
                                {isProcessing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};