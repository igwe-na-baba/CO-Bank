import React, { useState, useEffect } from 'react';
import { Transaction, Account, TransactionStatus } from '../types';
import { USER_PROFILE } from '../constants';
import { LiveTransactionView } from './LiveTransactionView';
import { 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    ArrowPathIcon,
    ArrowRightIcon,
    ClipboardDocumentIcon,
    SpinnerIcon,
    ICreditUnionLogo,
    ScaleIcon
} from './Icons';
import { AuthorizationWarningModal } from './AuthorizationWarningModal';
import { DownloadableReceipt } from './DownloadableReceipt';
import { timeSince } from '../utils/time';

declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptProps {
    transaction: Transaction;
    sourceAccount: Account;
    onStartOver: () => void;
    onViewActivity: () => void;
    onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
    phone?: string;
    onContactSupport: () => void;
    accounts: Account[];
}

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; isMono?: boolean; boldValue?: boolean }> = ({ label, value, isMono = false, boldValue = false }) => (
    <div className="flex justify-between items-start py-2">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-sm text-slate-200 text-right ${isMono ? 'font-mono' : 'font-semibold'} ${boldValue ? 'font-bold' : ''}`}>{value}</p>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700 pb-1 mb-3">{title}</h3>
        {children}
    </div>
);


export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ transaction, sourceAccount, onStartOver, onViewActivity, onAuthorizeTransaction, phone, onContactSupport, accounts }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
    const [showAuthWarning, setShowAuthWarning] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        if (transaction.status === TransactionStatus.IN_TRANSIT) {
             const timer = setTimeout(() => {
                setShowAuthWarning(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setShowAuthWarning(false);
        }
    }, [transaction.status]);

    const handleDownloadReceipt = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-modal-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement, { scale: 2 }).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [800, canvas.height * (800 / canvas.width)]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
                    pdf.save(`iCU_Receipt_${transaction.id}.pdf`);
                    setIsGeneratingPdf(false);
                });
            } else {
                console.error('Could not generate PDF. Required elements or libraries are missing.');
                alert('Could not generate PDF at this time.');
                setIsGeneratingPdf(false);
            }
        }, 100);
    };

    const submissionDate = transaction.statusTimestamps[TransactionStatus.SUBMITTED];
    const formattedDateTime = submissionDate.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short'
    });

    return (
        <>
            {showAuthWarning && (
                <AuthorizationWarningModal
                    transaction={transaction}
                    onAuthorize={onAuthorizeTransaction}
                    onClose={() => setShowAuthWarning(false)}
                    onContactSupport={onContactSupport}
                    accounts={accounts}
                />
            )}
            <div className="absolute inset-0 bg-slate-900 rounded-2xl overflow-hidden -m-6 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] animate-grid-pan"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,82,255,0.3),transparent_40%)]"></div>
            </div>
            <div className="relative z-10 text-left space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-700 pb-4">
                    <div className="flex items-center justify-center space-x-3">
                        <ICreditUnionLogo />
                        <h2 className="text-xl font-bold text-slate-100">International Wire Transfer Receipt</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Date & Time Issued: {formattedDateTime}</p>
                    <p className="text-xs text-slate-500 mt-1">Transaction ID: {transaction.id}</p>
                </div>

                {/* Live Tracker */}
                <LiveTransactionView transaction={transaction} phone={phone} />
                
                <div className="bg-black/20 rounded-xl shadow-inner p-6 space-y-6">
                    <Section title="Transfer Path">
                        <div className="flex items-center justify-between text-center">
                            <div className="w-2/5">
                                <img src={`https://flagsapi.com/US/shiny/64.png`} alt="USA Flag" className="w-8 mx-auto mb-1 rounded" />
                                <p className="font-semibold text-slate-200 truncate">New York, USA</p>
                                <p className="text-xs text-slate-400">Origin</p>
                            </div>
                            <div className="w-1/5 text-slate-500">
                                <ArrowRightIcon className="w-8 h-8" />
                            </div>
                            <div className="w-2/5">
                                <img src={`https://flagsapi.com/${transaction.recipient.country.code}/shiny/64.png`} alt={`${transaction.recipient.country.name} Flag`} className="w-8 mx-auto mb-1 rounded" />
                                <p className="font-semibold text-slate-200 truncate">{transaction.recipient.city}, {transaction.recipient.country.code}</p>
                                <p className="text-xs text-slate-400">Destination</p>
                            </div>
                        </div>
                    </Section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Sender Details">
                             <DetailRow label="Name" value={USER_PROFILE.name} />
                             <DetailRow label="Account" value={sourceAccount.nickname} />
                             <DetailRow label="Account Number" value={sourceAccount.fullAccountNumber} isMono />
                        </Section>

                        <Section title="Recipient Details">
                             <DetailRow label="Name" value={transaction.recipient.fullName} />
                             <DetailRow label="Bank" value={transaction.recipient.bankName} />
                             <DetailRow label="Account Number" value={transaction.recipient.realDetails.accountNumber} isMono />
                             <DetailRow label="SWIFT/BIC" value={transaction.recipient.realDetails.swiftBic} isMono />
                        </Section>
                    </div>

                     <Section title="Financial Summary">
                        <div className="divide-y divide-slate-700">
                            <DetailRow label="Amount Sent" value={transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                            <DetailRow label="Transfer Fee" value={transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono />
                             <DetailRow label="Exchange Rate" value={transaction.exchangeRate !== 1 ? `1 USD = ${transaction.exchangeRate.toFixed(4)} ${transaction.receiveCurrency}` : 'N/A'} isMono />
                            <DetailRow label="Total Debited" value={totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} isMono boldValue />
                            <DetailRow label="Recipient Gets" value={transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })} isMono boldValue />
                        </div>
                    </Section>
                    
                    <Section title="Authorization">
                         <div className="flex justify-between items-end">
                             <div className="text-left">
                                <img src={`https://quickchart.io/qr?text=iCU-Txn-${transaction.id}&size=100&ecLevel=H&margin=1`} alt="Transaction QR Code" className="w-24 h-24 rounded-lg bg-white p-1 border border-slate-700" />
                                <p className="text-xs text-slate-500 mt-1">Scan for details</p>
                             </div>
                             <div className="relative w-48 h-24 flex items-center justify-center">
                                {isCompleted && (
                                    <div className="stamp stamp-animated stamp-red" style={{width: 140, height: 140}}>
                                        <div className="stamp-inner">
                                            <div className="text-lg leading-tight">Verified</div>
                                            <div className="text-[10px] my-1">{submissionDate.toLocaleDateString()}</div>
                                            <div className="text-[10px] tracking-normal">iCredit Union®</div>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    </Section>

                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-semibold">
                    <button onClick={handleDownloadReceipt} disabled={isGeneratingPdf} className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
                        {isGeneratingPdf ? <SpinnerIcon className="w-5 h-5"/> : <ArrowDownTrayIcon className="w-5 h-5" />}
                        <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                    <button onClick={onStartOver} className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors">
                        <ArrowPathIcon className="w-5 h-5" />
                        <span>New Transfer</span>
                    </button>
                    <button onClick={onViewActivity} className="flex items-center justify-center space-x-2 py-3 bg-white/10 text-slate-200 hover:bg-white/20 rounded-lg transition-colors">
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        <span>View All Activity</span>
                    </button>
                </div>
            </div>

            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {isGeneratingPdf && (
                    <div id={`receipt-modal-${transaction.id}`}>
                        <DownloadableReceipt transaction={transaction} sourceAccount={sourceAccount} />
                    </div>
                )}
            </div>
        </>
    );
};