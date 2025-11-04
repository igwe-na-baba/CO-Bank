import React, { useState } from 'react';
import { Recipient, Country } from '../types';
import { AddRecipientModal } from './AddRecipientModal';
import { ChevronDownIcon, ClipboardDocumentIcon, CheckCircleIcon, BankIcon, CreditCardIcon, WithdrawIcon, getBankIcon, PencilIcon, getServiceIcon } from './Icons';

interface RecipientsProps {
    recipients: Recipient[];
    addRecipient: (data: {
        fullName: string;
        nickname?: string;
        phone?: string;
        bankName: string;
        accountNumber: string;
        swiftBic: string;
        country: Country;
        cashPickupEnabled: boolean;
        streetAddress: string;
        city: string;
        stateProvince: string;
        postalCode: string;
    }) => void;
    onUpdateRecipient: (recipientId: string, data: any) => void;
}

const DeliveryMethod: React.FC<{ icon: React.ReactNode; label: string; enabled: boolean }> = ({ icon, label, enabled }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${enabled ? 'bg-white/50' : 'bg-white/30 opacity-60'}`}>
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${enabled ? 'bg-green-100 text-green-600' : 'bg-slate-300 text-slate-500'}`}>
            {icon}
        </div>
        <div>
            <p className={`font-semibold text-sm ${enabled ? 'text-slate-700' : 'text-slate-500'}`}>{label}</p>
            <p className={`text-xs ${enabled ? 'text-green-600' : 'text-slate-500'}`}>{enabled ? 'Enabled' : 'Not Available'}</p>
        </div>
    </div>
);

const AccountDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card from toggling
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center text-sm py-2">
            <span className="text-slate-500">{label}</span>
            <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-700">{value}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-primary">
                    {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};


const RecipientCard: React.FC<{ recipient: Recipient; onEdit: () => void }> = ({ recipient, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const BankLogo = recipient.recipientType === 'service' ? getServiceIcon(recipient.serviceName!) : getBankIcon(recipient.bankName);

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital transition-all duration-300">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
                            <BankLogo className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{recipient.nickname || recipient.fullName}</p>
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                                <img src={`https://flagcdn.com/w20/${recipient.country.code.toLowerCase()}.png`} alt={recipient.country.name} className="w-5 rounded-sm" />
                                <span>{recipient.recipientType === 'service' ? recipient.serviceName : recipient.bankName} &bull; {recipient.accountNumber}</span>
                            </div>
                        </div>
                    </div>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in-down">
                    <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                            <h4 className="font-bold text-slate-700">Recipient Details</h4>
                            <button onClick={onEdit} className="flex items-center space-x-1.5 text-sm font-semibold text-primary hover:underline">
                                <PencilIcon className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        </div>
                        <AccountDetail label="Full Name" value={recipient.fullName} />
                        {recipient.phone && <AccountDetail label="Phone" value={recipient.phone} />}
                        <AccountDetail label="Account Number" value={recipient.realDetails.accountNumber} />
                        <AccountDetail label="SWIFT/BIC" value={recipient.realDetails.swiftBic} />
                        <div>
                            <h5 className="font-bold text-slate-700 mt-4 mb-2">Delivery Methods</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-white">
                                <DeliveryMethod icon={<BankIcon className="w-5 h-5"/>} label="Bank Deposit" enabled={recipient.deliveryOptions.bankDeposit} />
                                <DeliveryMethod icon={<CreditCardIcon className="w-5 h-5"/>} label="Card Deposit" enabled={recipient.deliveryOptions.cardDeposit} />
                                <DeliveryMethod icon={<WithdrawIcon className="w-5 h-5"/>} label="Cash Pickup" enabled={recipient.deliveryOptions.cashPickup} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const Recipients: React.FC<RecipientsProps> = ({ recipients, addRecipient, onUpdateRecipient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipientToEdit, setRecipientToEdit] = useState<Recipient | null>(null);

    const handleOpenAddModal = () => {
        setRecipientToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (recipient: Recipient) => {
        setRecipientToEdit(recipient);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Recipients</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage your saved recipients for quick and easy transfers.</p>
                    </div>
                    <button onClick={handleOpenAddModal} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                        Add Recipient
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recipients.map(recipient => (
                        <RecipientCard key={recipient.id} recipient={recipient} onEdit={() => handleOpenEditModal(recipient)} />
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <AddRecipientModal
                    onClose={() => setIsModalOpen(false)}
                    onAddRecipient={addRecipient}
                    recipientToEdit={recipientToEdit}
                    onUpdateRecipient={onUpdateRecipient}
                />
            )}
        </>
    );
};
