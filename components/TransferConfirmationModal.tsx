import React from 'react';
import { ShieldCheckIcon } from './Icons';

interface TransferConfirmationModalProps {
    onClose: () => void;
    onConfirm: () => void;
    details: React.ReactNode;
}

export const TransferConfirmationModal: React.FC<TransferConfirmationModalProps> = ({ onClose, onConfirm, details }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
                <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        <ShieldCheckIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Confirm Transfer</h2>
                    <p className="text-slate-500 mt-2">Please review the details below. Transactions cannot be reversed once sent.</p>
                </div>

                <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset my-6">
                    {details}
                </div>
                
                <div className="flex gap-3">
                    <button onClick={onClose} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital active:shadow-digital-inset">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md hover:shadow-lg">
                        Confirm & Send
                    </button>
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
        </div>
    );
};
