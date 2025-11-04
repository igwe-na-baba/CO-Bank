import React, { useState } from 'react';
import { UtilityBill, UtilityBiller, Account, View } from '../types';
import { SpinnerIcon, ShieldCheckIcon, QuestionMarkCircleIcon, InfoIcon } from './Icons';
import { USER_PIN } from '../constants';

interface UtilitiesProps {
    bills: UtilityBill[];
    billers: UtilityBiller[];
    onPayBill: (billId: string, sourceAccountId: string) => boolean;
    accounts: Account[];
    setActiveView: (view: View) => void;
}

const PaymentConfirmationModal: React.FC<{ bill: UtilityBill, biller: UtilityBiller, accounts: Account[], onConfirm: (sourceAccountId: string) => boolean, onClose: () => void }> = ({ bill, biller, accounts, onConfirm, onClose }) => {
    const [step, setStep] = useState<'pay' | 'processing' | 'success'>('pay');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [sourceAccountId, setSourceAccountId] = useState(accounts.find(a => a.balance > bill.amount)?.id || accounts[0]?.id || '');

    const handleConfirm = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }
        setStep('processing');
        setTimeout(() => {
            const success = onConfirm(sourceAccountId);
            if (success) {
                setStep('success');
            } else {
                setError('Payment failed. Please check your account balance.');
                setStep('pay');
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4">
                {step === 'pay' && <>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Confirm Payment</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset">
                          <p><strong>Biller:</strong> {biller.name}</p>
                          <p><strong>Amount:</strong> <span className="font-mono font-bold">{bill.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Pay From</label>
                            <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset">
                                {accounts.filter(a=>a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Enter PIN to Authorize</label>
                             <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset text-center tracking-[1em]" placeholder="----" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg shadow-digital">Cancel</button>
                        <button onClick={handleConfirm} disabled={pin.length !== 4} className="px-4 py-2 text-white bg-primary rounded-lg shadow-md disabled:bg-primary-300">Pay Now</button>
                    </div>
                </>}
                 {step === 'processing' && <div className="text-center p-8"><SpinnerIcon className="w-12 h-12 text-primary mx-auto" /><p className="mt-4 font-semibold">Processing your payment...</p></div>}
                {step === 'success' && <div className="text-center p-8"><h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2><p className="mt-2">Your bill has been paid.</p><button onClick={onClose} className="mt-4 px-6 py-2 text-white bg-primary rounded-lg shadow-md">Done</button></div>}
            </div>
        </div>
    );
};

const BillCard: React.FC<{ bill: UtilityBill; biller: UtilityBiller; onPay: () => void; }> = ({ bill, biller, onPay }) => {
    const isOverdue = !bill.isPaid && new Date() > bill.dueDate;
    const BillerIcon = biller.icon;

    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-md shadow-digital">
                        <BillerIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{biller.name}</p>
                        <p className="text-xs text-slate-500">Acct: {biller.accountNumber}</p>
                    </div>
                </div>
                <p className="font-bold text-lg text-slate-800 font-mono">
                    {bill.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
                <div>
                    <p className="text-xs font-semibold text-slate-500">
                        {bill.isPaid ? 'Paid on' : isOverdue ? 'Due Since' : 'Due Date'}
                    </p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                        {bill.dueDate.toLocaleDateString()}
                    </p>
                </div>
                {bill.isPaid ? (
                     <span className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-200 text-green-800">Paid</span>
                ) : (
                    <button onClick={onPay} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:shadow-lg">
                        Pay Now
                    </button>
                )}
            </div>
        </div>
    );
};

export const Utilities: React.FC<UtilitiesProps> = ({ bills, billers, onPayBill, accounts, setActiveView }) => {
    const [payingBill, setPayingBill] = useState<UtilityBill | null>(null);

    const upcomingBills = bills.filter(b => !b.isPaid).sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());
    const paidBills = bills.filter(b => b.isPaid).sort((a,b) => b.dueDate.getTime() - a.dueDate.getTime());
    
    const payingBiller = billers.find(b => b.id === payingBill?.billerId);

    return (
        <div className="space-y-8">
            {payingBill && payingBiller && <PaymentConfirmationModal bill={payingBill} biller={payingBiller} accounts={accounts} onConfirm={(accId) => onPayBill(payingBill.id, accId)} onClose={() => setPayingBill(null)} />}

            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pay Utilities</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage and pay your utility bills securely.</p>
                </div>
                 <button onClick={() => setActiveView('support')} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    <span>Need Help?</span>
                </button>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Upcoming Bills</h3>
                {upcomingBills.length > 0 ? (
                    <div className="space-y-4">
                        {upcomingBills.map(bill => {
                            const biller = billers.find(b => b.id === bill.billerId);
                            if (!biller) return null;
                            return <BillCard key={bill.id} bill={bill} biller={biller} onPay={() => setPayingBill(bill)} />;
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">No upcoming bills. You're all set!</p>
                )}
            </div>

             {paidBills.length > 0 && (
                <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                    <details>
                        <summary className="cursor-pointer text-xl font-bold text-slate-800">Payment History</summary>
                        <div className="space-y-4 mt-4">
                            {paidBills.map(bill => {
                                const biller = billers.find(b => b.id === bill.billerId);
                                if (!biller) return null;
                                return <BillCard key={bill.id} bill={bill} biller={biller} onPay={() => {}} />;
                            })}
                        </div>
                    </details>
                </div>
            )}

        </div>
    );
};
