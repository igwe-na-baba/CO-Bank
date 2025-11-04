import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus, AccountType, UserProfile } from './types';
import { STANDARD_FEE, EXPRESS_FEE, EXCHANGE_RATES, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from './constants';
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, KeypadIcon, FaceIdIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon, XIcon, XCircleIcon, NetworkIcon, GlobeAltIcon, UsersIcon, getBankIcon, ArrowRightIcon, ScaleIcon, SendIcon } from './Icons';
import { triggerHaptic } from './utils/haptics';
import { PaymentReceipt } from './components/PaymentReceipt';
import { CheckDepositFlow } from './components/CheckDepositFlow';
import { TransferConfirmationModal } from './components/TransferConfirmationModal';
import { RecipientSelector } from './components/RecipientSelector';


interface SendMoneyFlowProps {
  recipients: Recipient[];
  accounts: Account[];
  createTransaction: (transaction: Omit<Transaction, 'id' | 'status' | 'estimatedArrival' | 'statusTimestamps' | 'type'>) => Transaction | null;
  transactions: Transaction[];
  securitySettings: SecuritySettings;
  hapticsEnabled: boolean;
  onAuthorizeTransaction: (transactionId: string, method: 'code' | 'fee') => void;
  setActiveView: (view: View) => void;
  onClose: () => void;
  onLinkAccount: () => void;
  onDepositCheck: (details: { amount: number, accountId: string, images: { front: string, back: string } }) => void;
  onSplitTransaction: (details: { sourceAccountId: string; splits: { recipient: Recipient; amount: number }[]; totalAmount: number; purpose: string; }) => boolean;
  initialTab?: 'send' | 'split' | 'deposit';
  transactionToRepeat?: Transaction | null;
  userProfile: UserProfile;
  onContactSupport: () => void;
}

const securityCheckMessages = [
    'Verifying transaction details...',
    'Running fraud analysis...',
    'Performing compliance screening...',
    'Finalizing secure transfer...'
];

const TABS = [
    { id: 'send', label: 'Send', icon: <SendIcon className="w-5 h-5 mr-2" /> },
    { id: 'split', label: 'Split', icon: <UsersIcon className="w-5 h-5 mr-2" /> },
    { id: 'deposit', label: 'Deposit', icon: <CameraIcon className="w-5 h-5 mr-2" /> },
];


// Main Component
export const SendMoneyFlow: React.FC<SendMoneyFlowProps> = ({ recipients, accounts, createTransaction, transactions, securitySettings, hapticsEnabled, onAuthorizeTransaction, setActiveView, onClose, onLinkAccount, onDepositCheck, onSplitTransaction, initialTab, transactionToRepeat, userProfile, onContactSupport }) => {
  const [activeTab, setActiveTab] = useState<'send' | 'split' | 'deposit'>(initialTab || 'send');
  const [step, setStep] = useState(0); // 0: Details, 1: Review, 2: Authorize, 3: SecurityCheck, 4: Complete
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isRecipientSelectorOpen, setIsRecipientSelectorOpen] = useState(false);

  // Calculate internal and external accounts before they are used in state initializers.
  const { internalAccounts, externalAccounts } = useMemo(() => {
    const internal = accounts.filter(acc => acc.type !== AccountType.EXTERNAL_LINKED);
    const external = accounts.filter(acc => acc.type === AccountType.EXTERNAL_LINKED);
    return { internalAccounts: internal, externalAccounts: external };
  }, [accounts]);
  
  // Form State (Single Send)
  const [sourceAccountId, setSourceAccountId] = useState<string>(() => (internalAccounts.length > 0 ? internalAccounts[0].id : ''));
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(recipients.length > 0 ? recipients[0] : null);
  const [sendAmount, setSendAmount] = useState('');
  const [purpose, setPurpose] = useState(TRANSFER_PURPOSES[0]);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express'>('Standard');
  const [receiveCurrency, setReceiveCurrency] = useState<string>(selectedRecipient?.country.currency || 'GBP');
  const [rateLockCountdown, setRateLockCountdown] = useState(60);

  // Form State (Split)
  const [splitRecipients, setSplitRecipients] = useState<Recipient[]>([]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitType, setSplitType] = useState<'even' | 'custom'>('even');
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const recipientInputRef = useRef<HTMLDivElement>(null);


  // Security State
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authAttempted = useRef(false);

  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  const [securityCheckMessageIndex, setSecurityCheckMessageIndex] = useState(0);
  
  const sourceAccount = accounts.find(acc => acc.id === sourceAccountId);

  // Single Send calculations
  const fee = deliverySpeed === 'Express' ? EXPRESS_FEE : STANDARD_FEE;
  const numericSendAmount = parseFloat(sendAmount) || 0;
  const exchangeRate = EXCHANGE_RATES[receiveCurrency] || 0;
  const receiveAmount = numericSendAmount * exchangeRate;
  const totalCost = numericSendAmount + fee;
  
  const amountError = useMemo(() => {
    if (numericSendAmount < 0) return "Amount cannot be negative.";
    if (numericSendAmount > 0 && !sourceAccount) return "Source account not found.";
    // Bypass balance check for external accounts
    if (sourceAccount && sourceAccount.type !== AccountType.EXTERNAL_LINKED) {
      if (numericSendAmount > 0 && totalCost > sourceAccount.balance) {
          return `Total cost of ${totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} exceeds your balance.`;
      }
    }
    return null;
  }, [numericSendAmount, totalCost, sourceAccount]);
  
  const isAmountInvalid = amountError !== null || numericSendAmount <= 0;

  const liveTransaction = useMemo(() => {
    if (!createdTransaction) return null;
    return transactions.find(t => t.id === createdTransaction.id) || createdTransaction;
  }, [transactions, createdTransaction]);

  const hapticTrigger = useCallback(() => {
    if(hapticsEnabled) triggerHaptic();
  }, [hapticsEnabled]);

  const handleNextStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev + 1);
  }, [hapticTrigger]);

  const handlePrevStep = useCallback(() => {
    hapticTrigger();
    setStep(prev => prev - 1);
  }, [hapticTrigger]);

  const handleSourceAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'link_new_account') {
      onLinkAccount();
    } else {
      setSourceAccountId(value);
    }
  };

  useEffect(() => {
    if (selectedRecipient) {
      setReceiveCurrency(selectedRecipient.country.currency);
    }
  }, [selectedRecipient]);

  // For auto-selecting new external account
  const prevAccountsLength = useRef(accounts.length);
  useEffect(() => {
    if (accounts.length > prevAccountsLength.current) {
        const newAccount = accounts[accounts.length - 1];
        if (newAccount.type === AccountType.EXTERNAL_LINKED) {
            setSourceAccountId(newAccount.id);
        }
    }
    prevAccountsLength.current = accounts.length;
  }, [accounts]);

  useEffect(() => {
    if (step === 1 && rateLockCountdown > 0) {
        const timer = setInterval(() => setRateLockCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    } else if (step !== 1) {
        setRateLockCountdown(60); // Reset timer when leaving review step
    }
  }, [step, rateLockCountdown]);

  useEffect(() => {
    if (step === 3) { // Security Check step
        const interval = setInterval(() => {
            setSecurityCheckMessageIndex(prev => {
                if (prev >= securityCheckMessages.length - 1) {
                    clearInterval(interval);
                    setTimeout(() => handleNextStep(), 500); // Move to success step
                    return prev;
                }
                return prev + 1;
            });
        }, 1200);
        return () => clearInterval(interval);
    }
  }, [step, handleNextStep]);

  useEffect(() => {
    if (transactionToRepeat) {
        const fullRecipient = recipients.find(r => r.id === transactionToRepeat.recipient.id);

        setActiveTab('send');
        setStep(0);
        setSourceAccountId(transactionToRepeat.accountId);
        setSelectedRecipient(fullRecipient || transactionToRepeat.recipient);
        setSendAmount(String(transactionToRepeat.sendAmount));
        setPurpose(transactionToRepeat.purpose || TRANSFER_PURPOSES[0]);
        setDeliverySpeed(transactionToRepeat.deliverySpeed || 'Standard');
        
        // Reset other state
        setPin('');
        setPinError('');
        setCreatedTransaction(null);
        setIsAuthenticating(false);
    }
  }, [transactionToRepeat, recipients]);
  
  const handleConfirmAndSend = useCallback(() => {
    if (!selectedRecipient || !sourceAccount) return;
    hapticTrigger();

    const newTransaction = createTransaction({
      accountId: sourceAccount.id,
      recipient: selectedRecipient,
      sendAmount: numericSendAmount,
      receiveAmount: receiveAmount,
      receiveCurrency: receiveCurrency,
      fee: fee,
      deliverySpeed: deliverySpeed,
      exchangeRate: exchangeRate,
      description: `Transfer to ${selectedRecipient.fullName}`,
      purpose
    });
    
    if(newTransaction) {
        setCreatedTransaction(newTransaction);
        handleNextStep(); // Move to Security Check
    }
  }, [createTransaction, deliverySpeed, exchangeRate, fee, hapticTrigger, handleNextStep, numericSendAmount, purpose, receiveAmount, receiveCurrency, selectedRecipient, sourceAccount]);

  const handlePinSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    setTimeout(() => { // Simulate API call
      if (pin === USER_PIN) {
        if(activeTab === 'send') handleConfirmAndSend();
        else if (activeTab === 'split') setIsConfirmationModalOpen(true);
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setIsAuthenticating(false);
      }
    }, 500);
  }, [hapticTrigger, pin, handleConfirmAndSend, activeTab]);

  const handleBiometricAuth = useCallback(async () => {
    hapticTrigger();
    setIsAuthenticating(true);
    setPinError('');
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        if(activeTab === 'send') handleConfirmAndSend();
        else if(activeTab === 'split') setIsConfirmationModalOpen(true);
    } catch (error) {
        console.error("Biometric auth failed", error);
        setPinError('Biometric authentication failed. Please use your PIN.');
        setIsAuthenticating(false);
    }
  }, [hapticTrigger, handleConfirmAndSend, activeTab]);
  
  useEffect(() => {
    if (step === 2 && securitySettings.biometricsEnabled && !authAttempted.current) {
      authAttempted.current = true;
      handleBiometricAuth();
    }
    if (step !== 2) authAttempted.current = false;
  }, [step, securitySettings.biometricsEnabled, handleBiometricAuth]);

  const handleStartOver = () => {
    hapticTrigger();
    setStep(0);
    setActiveTab('send');
    setSelectedRecipient(recipients.length > 0 ? recipients[0] : null);
    setSourceAccountId(internalAccounts.length > 0 ? internalAccounts[0].id : '');
    setSendAmount('');
    setPurpose(TRANSFER_PURPOSES[0]);
    setPin('');
    setPinError('');
    setCreatedTransaction(null);
  };
  
   const handleViewActivity = () => {
      onClose();
      setActiveView('history');
  };

  // ----- SPLIT PAYMENT LOGIC -----
    const availableRecipients = recipients.filter(r => !splitRecipients.some(sr => sr.id === r.id));
    const searchResults = availableRecipients.filter(r => r.fullName.toLowerCase().includes(recipientSearch.toLowerCase()) || r.nickname?.toLowerCase().includes(recipientSearch.toLowerCase()));

    const handleAddSplitRecipient = (recipient: Recipient) => {
        setSplitRecipients(prev => [...prev, recipient]);
        setRecipientSearch('');
        setShowRecipientDropdown(false);
    };

    const handleRemoveSplitRecipient = (id: string) => {
        setSplitRecipients(prev => prev.filter(r => r.id !== id));
        setCustomAmounts(prev => {
            const newAmounts = {...prev};
            delete newAmounts[id];
            return newAmounts;
        });
    };

    const handleCustomAmountChange = (id: string, value: string) => {
        setCustomAmounts(prev => ({...prev, [id]: value}));
    };

    const totalSplitAmount = parseFloat(splitAmount) || 0;
    const evenlySplitAmount = splitRecipients.length > 0 ? totalSplitAmount / splitRecipients.length : 0;
    const totalCustomAmount = Object.values(customAmounts).reduce((sum: number, val: string) => sum + (parseFloat(val) || 0), 0);
    const splitAmountError = splitType === 'custom' && totalCustomAmount !== totalSplitAmount ? `Custom amounts must add up to ${totalSplitAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.` : null;

    const handleSplitSubmit = () => {
        if(splitRecipients.length < 2 || totalSplitAmount <= 0) return;
        if(splitType === 'custom' && splitAmountError) return;

        handleNextStep(); // Move to authorize step
    };

    const handleConfirmSplit = () => {
        const splits = splitRecipients.map(r => ({
            recipient: r,
            amount: splitType === 'even' ? evenlySplitAmount : (parseFloat(customAmounts[r.id]) || 0)
        }));
        const success = onSplitTransaction({ sourceAccountId, splits, totalAmount: totalSplitAmount, purpose });
        if(success) {
            handleNextStep(); // Move to security check
        } else {
            setPinError('Transaction failed. Check balance.');
            setStep(0); // Go back to start on failure
        }
        setIsConfirmationModalOpen(false);
    };


  const renderStepContent = () => {
    switch(step) {
      case 0:
        // Tabbed view for Send, Split, Deposit
        return (
             <div className="animate-fade-in-up">
                 <div className="flex border-b border-slate-200 mb-4">
                     { TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center px-4 py-2 text-sm font-semibold capitalize transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>
                           {tab.icon}
                           {tab.label}
                        </button>
                     ))}
                 </div>
                 {activeTab === 'send' && (
                     <div className="space-y-4">
                        <div>
                         <label className="block text-sm font-medium text-slate-700">Send From</label>
                         <select value={sourceAccountId} onChange={handleSourceAccountChange} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                           {internalAccounts.map(acc => ( <option key={acc.id} value={acc.id}> {acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) </option> ))}
                           {externalAccounts.length > 0 && <optgroup label="External Accounts">{externalAccounts.map(acc => (<option key={acc.id} value={acc.id}>{acc.nickname}</option>))}</optgroup>}
                           <option value="link_new_account">-- Link a New Account --</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700">Recipient</label>
                         <button onClick={() => setIsRecipientSelectorOpen(true)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset text-left flex justify-between items-center">
                            {selectedRecipient ? <span>{selectedRecipient.nickname ? `${selectedRecipient.nickname} (${selectedRecipient.fullName})` : selectedRecipient.fullName}</span> : <span className="text-slate-500">Select a recipient...</span>}
                            <span>▼</span>
                         </button>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700">You Send</label>
                         <div className="mt-1 relative rounded-md shadow-digital-inset bg-slate-200 flex items-center">
                           <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full bg-transparent border-0 p-3 pr-4 text-lg font-mono text-slate-800 flex-grow" placeholder="0.00"/>
                           <div className="p-3 flex items-center space-x-2 border-l border-slate-300 pointer-events-none">
                              <img src={`https://flagcdn.com/w40/us.png`} alt="USD flag" className="w-5 h-auto" />
                             <span className="text-slate-500 font-semibold">USD</span>
                           </div>
                         </div>
                         {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Speed</label>
                         <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setDeliverySpeed('Standard')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Standard' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                 <p className="font-bold text-slate-800">Standard</p>
                                 <p className="text-xs text-slate-500">~2-3 business days</p>
                                 <p className="text-sm font-semibold text-primary mt-1">{STANDARD_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                             </button>
                              <button onClick={() => setDeliverySpeed('Express')} className={`p-3 rounded-lg text-left transition-all ${deliverySpeed === 'Express' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                                 <p className="font-bold text-slate-800">Express</p>
                                 <p className="text-xs text-slate-500">Within 24 hours</p>
                                 <p className="text-sm font-semibold text-primary mt-1">{EXPRESS_FEE.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} Fee</p>
                             </button>
                         </div>
                       </div>
                       <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 text-sm">
                         <div className="flex justify-between">
                             <span className="text-slate-600">Total Debited:</span>
                             <span className="font-mono text-slate-800 font-semibold">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                         </div>
                          <div className="flex justify-between font-bold text-base">
                             <span className="text-slate-600">Recipient Gets:</span>
                             <span className="text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</span>
                         </div>
                       </div>
                       <button onClick={handleNextStep} disabled={isAmountInvalid || !selectedRecipient} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">
                         Review Transfer
                       </button>
                     </div>
                 )}
                 {activeTab === 'split' && (
                    <div className="space-y-4">
                        <div>
                         <label className="block text-sm font-medium text-slate-700">Split Total Amount (USD)</label>
                         <input type="number" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" placeholder="0.00" />
                        </div>
                        <div ref={recipientInputRef}>
                            <label className="block text-sm font-medium text-slate-700">Add Recipients</label>
                            <input type="text" value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)} onFocus={() => setShowRecipientDropdown(true)} placeholder="Search for recipients..." className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                            {showRecipientDropdown && searchResults.length > 0 && (
                                <div className="absolute z-10 w-[calc(100%-3rem)] bg-white rounded-md shadow-lg max-h-40 overflow-y-auto">
                                   {searchResults.map(r => <button key={r.id} onClick={() => handleAddSplitRecipient(r)} className="block w-full text-left p-2 hover:bg-slate-100">{r.fullName}</button>)}
                                </div>
                            )}
                        </div>
                        {splitRecipients.length > 0 && (
                            <div className="p-2 bg-slate-200 rounded-lg shadow-inner">
                                {splitRecipients.map(r => (
                                    <div key={r.id} className="flex items-center justify-between p-2">
                                        <span>{r.fullName}</span>
                                        <button onClick={() => handleRemoveSplitRecipient(r.id)}><XCircleIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={handleSplitSubmit} disabled={splitRecipients.length < 2 || totalSplitAmount <= 0} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">
                          Review Split ({splitRecipients.length})
                        </button>
                    </div>
                 )}
                 {activeTab === 'deposit' && (
                    <CheckDepositFlow accounts={accounts} onDepositCheck={onDepositCheck} />
                 )}
             </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Review Your Transfer</h2>
            
            <div className="flex items-center justify-between p-4 bg-slate-200 rounded-lg shadow-digital-inset">
                <div className="text-left">
                    <p className="text-xs text-slate-500">From</p>
                    <p className="font-semibold text-slate-800">{sourceAccount?.nickname || sourceAccount?.type}</p>
                </div>
                <div className="flex-shrink-0 px-2">
                    <ArrowRightIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">To</p>
                    <p className="font-semibold text-slate-800">{selectedRecipient?.fullName}</p>
                </div>
            </div>

            <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2 divide-y divide-slate-300">
                <div className="flex justify-between items-center pt-1">
                    <span className="text-sm text-slate-600">You send</span>
                    <span className="font-mono text-slate-800">{numericSendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-slate-600">Transfer fee ({deliverySpeed})</span>
                    <span className="font-mono text-slate-800">+ {fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
                <div className="flex justify-between items-center pt-2 font-bold text-base">
                    <span className="text-slate-800">Total to be debited</span>
                    <span className="font-mono text-slate-900">{totalCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
            </div>
            
            <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="flex items-center text-sm text-slate-600"><ScaleIcon className="w-4 h-4 mr-1"/> Exchange rate (USD Base)</span>
                        <span className="font-mono text-lg font-bold text-slate-800">1 USD ≈ {exchangeRate.toFixed(4)} {selectedRecipient?.country.currency}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-sm text-slate-600">Rate locked for</span>
                        <div className={`text-lg font-bold font-mono p-2 rounded-lg transition-colors ${rateLockCountdown < 10 ? 'text-red-500 bg-red-100' : 'text-slate-800 bg-slate-300/50'}`}>
                            {Math.floor(rateLockCountdown / 60)}:{String(rateLockCountdown % 60).padStart(2, '0')}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-slate-300 pt-3 mt-2">
                    <span className="text-slate-800">Recipient gets</span>
                    <span className="font-mono text-primary">{receiveAmount.toLocaleString('en-US', { style: 'currency', currency: selectedRecipient?.country.currency })}</span>
                </div>
            </div>
            
             <div className="mt-6 flex space-x-3">
                <button onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                <button onClick={handleNextStep} disabled={rateLockCountdown <= 0} className="w-full py-3 text-white bg-green-500 rounded-lg font-semibold shadow-md disabled:bg-green-300"> Confirm & Authorize </button>
            </div>
          </div>
        );
      case 2:
          return (
              <div className="text-center p-4">
                  <h2 className="text-2xl font-bold text-slate-800">Authorize Payment</h2>
                  <form onSubmit={handlePinSubmit}>
                      <label className="text-slate-600 my-4 block">Please enter your 4-digit security PIN.</label>
                      <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-48 mx-auto bg-slate-200 border-0 p-3 text-center text-3xl tracking-[.75em] rounded-md shadow-digital-inset" maxLength={4} placeholder="----" autoFocus />
                      {pinError && <p className="mt-2 text-sm text-red-500">{pinError}</p>}
                       <div className="mt-6 flex space-x-3">
                          <button type="button" onClick={handlePrevStep} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital" disabled={isAuthenticating}>Back</button>
                          <button type="submit" disabled={pin.length !== 4 || isAuthenticating} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50"> Authorize & Send </button>
                      </div>
                  </form>
              </div>
          );
      case 3: // Security Check
        return (
            <div className="text-center p-8">
                <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
                <h3 className="mt-4 text-xl font-bold text-slate-800">{securityCheckMessages[securityCheckMessageIndex]}</h3>
                <p className="text-slate-600 mt-2">This is a standard security procedure to protect your account.</p>
            </div>
        );
      case 4:
        if (!liveTransaction || !sourceAccount) return <div className="text-center p-8"> <SpinnerIcon className="w-12 h-12 text-primary mx-auto"/> <p className="mt-4 text-slate-600">Finalizing transaction...</p> </div>;
        
        return (
            <PaymentReceipt 
                transaction={liveTransaction}
                sourceAccount={sourceAccount}
                onStartOver={handleStartOver}
                onViewActivity={handleViewActivity}
                onAuthorizeTransaction={onAuthorizeTransaction}
                phone={userProfile.phone}
                onContactSupport={onContactSupport}
                accounts={accounts}
            />
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        {isRecipientSelectorOpen && <RecipientSelector recipients={recipients} onClose={() => setIsRecipientSelectorOpen(false)} onSelect={(r) => { setSelectedRecipient(r); setIsRecipientSelectorOpen(false); }} />}
        {isConfirmationModalOpen && (
            <TransferConfirmationModal 
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handleConfirmSplit}
                details={
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between"><span>Total Amount:</span> <span className="font-bold">{totalSplitAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span></div>
                        <div className="flex justify-between"><span>Recipients:</span> <span className="font-bold">{splitRecipients.length}</span></div>
                        <div className="flex justify-between"><span>Split Type:</span> <span className="font-bold capitalize">{splitType}</span></div>
                    </div>
                }
            />
        )}
        <div className="bg-slate-100 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6"/></button>
            <div className="min-h-[500px]">
              {renderStepContent()}
            </div>
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
