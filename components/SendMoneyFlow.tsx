import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Recipient, Transaction, Account, SecuritySettings, View, TransactionStatus, AccountType, UserProfile } from '../types';
import { STANDARD_FEE, EXPRESS_FEE, EXCHANGE_RATES, TRANSFER_PURPOSES, USER_PIN, NETWORK_AUTH_CODE } from '../constants';
import { SpinnerIcon, CheckCircleIcon, ExclamationTriangleIcon, KeypadIcon, FaceIdIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon, XIcon, XCircleIcon, NetworkIcon, GlobeAltIcon, UsersIcon, getBankIcon, ArrowRightIcon, ScaleIcon, SendIcon, DevicePhoneMobileIcon, FingerprintIcon } from './Icons';
import { triggerHaptic } from '../utils/haptics';
import { PaymentReceipt } from './PaymentReceipt';
import { CheckDepositFlow } from './CheckDepositFlow';
import { TransferConfirmationModal } from './TransferConfirmationModal';
import { RecipientSelector } from './RecipientSelector';
import { sendSmsNotification, generateOtpSms } from '../services/notificationService';


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
  const [authStep, setAuthStep] = useState<'initial' | 'pin' | 'sms'>('initial');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Transaction State
  const [createdTransaction, setCreatedTransaction] = useState<Transaction | null>(null);
  
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

  // FIX: This effect handles the automatic progression from the "Security Check" step (3) to the "Complete" step (4).
  useEffect(() => {
    if (step === 3 && createdTransaction) {
      const securityCheckTimer = setTimeout(() => {
        handleNextStep(); // This will move from step 3 to step 4
      }, 1500); // Simulate a 1.5 second security check

      return () => clearTimeout(securityCheckTimer);
    }
  }, [step, createdTransaction, handleNextStep]);

  useEffect(() => {
    if (step === 2) {
      setAuthStep('initial');
    }
    if (step !== 2) {
        // Reset all auth state when leaving the authorization step
        setAuthStep('initial');
        setPin('');
        setPinError('');
        setOtp('');
        setOtpError('');
        setIsAuthenticating(false);
        setIsSendingOtp(false);
    }
  }, [step]);

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
        setCreatedTransaction(null);
    }
  }, [transactionToRepeat, recipients]);
  
  const handleConfirmAndSend = useCallback(() => {
    if (!selectedRecipient || !sourceAccount) return;
    hapticTrigger();

    const newTransaction = createTransaction({
      accountId: sourceAccount.id,
      recipient: selectedRecipient,
      sendAmount: numericSendAmount,
