import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionStatus, Account } from '../types';
import { TRANSACTION_CATEGORIES } from '../constants';
import { 
    CheckCircleIcon, 
    ClockIcon, 
    SearchIcon, 
    XCircleIcon, 
    DepositIcon, 
    getBankIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ClipboardDocumentIcon,
    TagIcon,
    DocumentCheckIcon,
    SpinnerIcon,
    GlobeAmericasIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon
} from './Icons';
import { DownloadableReceipt } from './DownloadableReceipt';
import { AuthorizationWarningModal } from './AuthorizationWarningModal';
import { TransactionTracker } from './TransactionTracker';

declare const html2canvas: any;
declare const jspdf: any;

interface ActivityLogProps {
  transactions: Transaction[];
  onUpdateTransactions: (transactionIds: string[], updates: Partial<Transaction>) => void;
  onRepeatTransaction: (transaction: Transaction) => void;
  onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
  accounts: Account[];
  onContactSupport: (transactionId?: string) => void;
}

const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <>{text}</>;
    }
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-200/50 text-yellow-800 rounded px-1 py-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

const TransactionRow: React.FC<{ 
    transaction: Transaction; 
    searchTerm: string; 
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDownloadReceipt: (transaction: Transaction) => void;
    isGeneratingPdf: boolean;
    onRepeatTransaction: (transaction: Transaction) => void;
    onResolveHold: (transaction: Transaction) => void;
    onContactSupport: (transactionId: string) => void;
}> = ({ transaction, searchTerm, isSelected, onSelect, onDownloadReceipt, isGeneratingPdf, onRepeatTransaction, onResolveHold, onContactSupport }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedId, setCopiedId] = useState(false);

    const isCompleted = transaction.status === TransactionStatus.FUNDS_ARRIVED;
    const isFlagged = transaction.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE;
    const statusIcon = isCompleted ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <ClockIcon className="w-5 h-5 text-yellow-500" />;
    const statusColor = isCompleted ? 'text-green-700 bg-green-100' : isFlagged ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100';
    
    const isCredit = transaction.type === 'credit';
    const amount = isCredit ? transaction.sendAmount : transaction.sendAmount + transaction.fee;
    
    const getTransactionIcon = () => {
        if (isCredit) {
            return transaction.chequeDetails ? 
                <ClipboardDocumentIcon className="w-6 h-6 text-slate-500" /> : 
                <DepositIcon className="w-6 h-6 text-slate-500" />;
        }
        
        // Debit
        if (transaction.transferMethod === 'wire' || transaction.recipient.country.code !== 'US') {
            return <GlobeAmericasIcon className="w-6 h-6 text-slate-500" />;
        }
        
        const BankLogo = getBankIcon(transaction.recipient.bankName);
        return <BankLogo className="w-6 h-6" />;
    };

    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the row from toggling when copying
        navigator.clipboard.writeText(transaction.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };
    
    return (
        <>
            <tr
                className={`border-b border-slate-200 last:border-b-0 group transition-colors cursor-pointer ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-slate-50'
                }`}
                onClick={() => onSelect(transaction.id)}
            >
                <td className="py-4 px-6 w-12">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(transaction.id)}
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary focus:ring-primary"
                    />
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-inner">
                            {getTransactionIcon()}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">
                                <Highlight text={isCredit ? 'Deposit' : transaction.recipient.fullName} highlight={searchTerm} />
                            </p>
                            <p className="text-sm text-slate-500">
                                <Highlight text={transaction.description} highlight={searchTerm} />
                            </p>
                        </div>
                    </div>
                </td>
                <td className={`py-4 px-6 font-mono text-right ${isCredit ? 'text-green-600' : 'text-slate-800'}`}>
                    {isCredit ? '+' : '-'} {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </td>
                <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center space-x-1 ${statusColor}`}>
                        {statusIcon}
                        <span>{transaction.status}</span>
                    </span>
                </td>
                <td className="py-4 px-6 text-slate-600 text-sm text-right">
                    {transaction.statusTimestamps[TransactionStatus.SUBMITTED].toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="p-2 text-slate-400 hover:text-slate-800">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-slate-50">
                    <td colSpan={6} className="p-4">
                        <div className="animate-fade-in-down p-4 space-y-6">
                            <TransactionTracker transaction={transaction} theme="light" />
                            <div className="flex items-center justify-center gap-2 flex-wrap border-t border-slate-300 pt-4 text-sm font-semibold text-slate-700">
                                <button onClick={() => onDownloadReceipt(transaction)} disabled={isGeneratingPdf} className="flex items-center space-x-2 px-3 py-2 bg-slate-200 hover:bg-slate-300/50 rounded-lg transition-colors">
                                    {isGeneratingPdf ? <SpinnerIcon className="w-4 h-4" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                                    <span>{isGeneratingPdf ? 'Generating...' : 'Receipt'}</span>
                                </button>
                                {!isCredit && (
                                    <button onClick={() => onRepeatTransaction(transaction)} className="flex items-center space-x-2 px-3 py-2 bg-slate-200 hover:bg-slate-300/50 rounded-lg transition-colors">
                                        <ArrowPathIcon className="w-4 h-4" />
                                        <span>Repeat</span>
                                    </button>
                                )}
                                <button onClick={() => onContactSupport(transaction.id)} className="flex items-center space-x-2 px-3 py-2 bg-slate-200 hover:bg-slate-300/50 rounded-lg transition-colors">
                                    <QuestionMarkCircleIcon className="w-4 h-4" />
                                    <span>Get Help</span>
                                </button>
                                {isFlagged && (
                                    <button onClick={() => onResolveHold(transaction)} className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200/50 rounded-lg transition-colors">
                                        <ShieldCheckIcon className="w-4 h-4" />
                                        <span>Resolve Hold</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const ActivityLog: React.FC<ActivityLogProps> = ({ 
    transactions, 
    onUpdateTransactions, 
    onRepeatTransaction,
    onAuthorizeTransaction,
    accounts,
    onContactSupport
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
    const [transactionToResolve, setTransactionToResolve] = useState<Transaction | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfData, setPdfData] = useState<{ transaction: Transaction; account: Account } | null>(null);


    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => 
            t.recipient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    const handleSelect = (id: string) => {
        setSelectedTransactions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleDownloadReceipt = (transaction: Transaction) => {
        const sourceAccount = accounts.find(a => a.id === transaction.accountId);
        if (!sourceAccount) {
            alert("Source account for this transaction could not be found.");
            return;
        }
        setIsGeneratingPdf(true);
        setPdfData({ transaction, account: sourceAccount });
        
        setTimeout(() => {
            const receiptElement = document.getElementById(`receipt-for-pdf-${transaction.id}`);
            if (receiptElement && typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
                html2canvas(receiptElement, { scale: 2, backgroundColor: '#ffffff' }).then((canvas: any) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jspdf.jsPDF({
                        orientation: 'portrait',
                        unit: 'px',
                        format: [800, canvas.height * (800 / canvas.width)]
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 800, canvas.height * (800 / canvas.width));
                    pdf.save(`iCU_Receipt_${transaction.id}.pdf`);
                    setIsGeneratingPdf(false);
                    setPdfData(null);
                });
            } else {
                console.error('Could not generate PDF. Required elements or libraries are missing.');
                alert('Could not generate PDF at this time.');
                setIsGeneratingPdf(false);
                setPdfData(null);
            }
        }, 100);
    };
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
             <div className="relative">
                <input 
                  type="text"
                  placeholder="Search by recipient, description, or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 pr-10 bg-white text-slate-800 border border-slate-300 rounded-lg shadow-digital-inset focus:ring-2 focus:ring-primary"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800"
                        aria-label="Clear search"
                    >
                        <XCircleIcon className="w-5 h-5"/>
                    </button>
                )}
              </div>
            <div className="bg-white rounded-2xl shadow-digital overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 w-12"></th>
                                <th scope="col" className="px-6 py-3">Recipient / Details</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-right">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTransactions.map(tx => (
                                <TransactionRow 
                                    key={tx.id} 
                                    transaction={tx}
                                    searchTerm={searchTerm}
                                    isSelected={selectedTransactions.has(tx.id)}
                                    onSelect={handleSelect}
                                    onDownloadReceipt={handleDownloadReceipt}
                                    isGeneratingPdf={isGeneratingPdf && pdfData?.transaction.id === tx.id}
                                    onRepeatTransaction={onRepeatTransaction}
                                    onResolveHold={setTransactionToResolve}
                                    onContactSupport={onContactSupport}
                                />
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
             {transactionToResolve && (
                <AuthorizationWarningModal 
                    transaction={transactionToResolve} 
                    onAuthorize={onAuthorizeTransaction} 
                    onClose={() => setTransactionToResolve(null)}
                    onContactSupport={() => onContactSupport(transactionToResolve.id)}
                    accounts={accounts}
                />
            )}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                {isGeneratingPdf && pdfData && (
                    <div id={`receipt-for-pdf-${pdfData.transaction.id}`}>
                        <DownloadableReceipt transaction={pdfData.transaction} sourceAccount={pdfData.account} />
                    </div>
                )}
            </div>
        </div>
    );
};