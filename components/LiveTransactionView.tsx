

import React, { useMemo } from 'react';
import { Transaction, TransactionStatus } from '../types';
import { CheckCircleIcon, SendIcon, ArrowsRightLeftIcon, GlobeAltIcon, BankIcon, CurrencyDollarIcon, ShieldCheckIcon, ScaleIcon } from './Icons';
import { SmsConfirmation } from './SmsConfirmation';

interface LiveTransactionViewProps {
  transaction: Transaction;
  phone?: string;
}

export const LiveTransactionView: React.FC<LiveTransactionViewProps> = ({ transaction, phone }) => {
    const steps = useMemo(() => {
        const allPossibleSteps = [
            { status: TransactionStatus.SUBMITTED, label: 'Payment Initiated', icon: <SendIcon className="w-6 h-6" /> },
            { status: TransactionStatus.CONVERTING, label: 'Processing FX', icon: <ArrowsRightLeftIcon className="w-6 h-6" /> },
            { status: TransactionStatus.AWAITING_AUTHORIZATION, label: 'Pending Authorization', icon: <ShieldCheckIcon className="w-6 h-6" /> },
            { status: TransactionStatus.FLAGGED_AWAITING_CLEARANCE, label: 'Compliance Review', icon: <ScaleIcon className="w-6 h-6" /> },
            { status: TransactionStatus.IN_TRANSIT, label: 'Sent to Network', icon: <GlobeAltIcon className="w-6 h-6" /> },
            { status: TransactionStatus.FUNDS_ARRIVED, label: 'Funds Delivered', icon: <BankIcon className="w-6 h-6" /> },
        ];
        // Filter steps to only include those relevant to this specific transaction's history
        const uniqueStatusesInHistory = [...new Set([
            ...Object.keys(transaction.statusTimestamps),
            transaction.status
        ])];
        return allPossibleSteps.filter(step => uniqueStatusesInHistory.includes(step.status));
    }, [transaction]);

  const { status, statusTimestamps } = transaction;
  const currentStepIndex = steps.findIndex(s => s.status === status);
  
  const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;
  const isComplete = status === TransactionStatus.FUNDS_ARRIVED;

  return (
    <div className="w-full font-sans">
      <div className="relative h-2.5 w-full bg-slate-700/50 rounded-full my-10 shadow-inner">
        <div 
          className="absolute top-0 left-0 h-2.5 rounded-full transition-all duration-1500 ease-out"
          style={{ 
            width: `${progressPercentage}%`, 
            background: isComplete ? '#22c55e' : 'linear-gradient(to right, #2dd4bf, #0052FF)',
            boxShadow: isComplete ? '0 0 8px #22c55e' : '0 0 8px #0052FF' 
          }}
        ></div>
        {/* Animated Money Icon */}
        <div 
          className="absolute -top-4 transform -translate-x-1/2 transition-all duration-1500 ease-out"
          style={{ 
              left: `${progressPercentage}%`
          }}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ring-4 ring-slate-800/50 transition-colors duration-500 animate-breathing ${isComplete ? 'bg-green-500' : 'bg-gradient-to-br from-green-400 to-emerald-600'}`}>
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-start text-center">
        {steps.map((step, index) => {
          const isStepCompleted = index < currentStepIndex || isComplete;
          const isStepCurrent = index === currentStepIndex && !isComplete;
          const timestamp = statusTimestamps[step.status as keyof typeof statusTimestamps];
          const isFlaggedStep = step.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE;

          return (
            <div key={step.status} className="w-1/4 px-1">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 mb-2 ${
                  isStepCompleted ? 'bg-green-500/20 text-green-300' 
                  : isStepCurrent && isFlaggedStep ? 'bg-yellow-500/20 text-yellow-300 ring-2 ring-yellow-500 animate-pulse-ring'
                  : isStepCurrent ? 'bg-primary/20 text-primary-300 ring-2 ring-primary animate-pulse-ring' 
                  : 'bg-slate-800 text-slate-500 shadow-inner'}`
              }>
                {isStepCompleted ? <CheckCircleIcon className="w-7 h-7 animate-pop-in" /> : step.icon}
              </div>
              <p className={`text-xs font-bold transition-colors duration-500 ${isStepCompleted || isStepCurrent ? 'text-slate-200' : 'text-slate-500'} ${isStepCurrent ? 'animate-fade-in-text' : ''}`}>
                {step.label}
              </p>
              {timestamp && (
                 <p className={`text-xs text-slate-400 mt-1 transition-opacity duration-500 opacity-100 ${isStepCurrent ? 'animate-fade-in-text' : ''}`} style={{animationDelay: '150ms'}}>
                   {timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                 </p>
              )}
            </div>
          );
        })}
      </div>
      
      {isComplete && (
        <div className="text-center mt-6 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-300 font-semibold px-4 py-2 rounded-full">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Transfer Sent Successfully!</span>
            </div>
        </div>
      )}

      {isComplete && phone && (
        <div className="mt-6 text-left">
            <SmsConfirmation transaction={transaction} phone={phone} />
        </div>
      )}
    </div>
  );
};