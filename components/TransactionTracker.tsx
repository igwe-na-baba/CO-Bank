import React from 'react';
import { Transaction, TransactionStatus } from '../types';
import { CheckCircleIcon, SendIcon, ArrowsRightLeftIcon, ShieldCheckIcon, ScaleIcon, GlobeAltIcon, BankIcon } from './Icons';

interface TransactionTrackerProps {
  transaction: Transaction;
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({ transaction }) => {
  const { status, statusTimestamps } = transaction;

  const allPossibleSteps = [
    { status: TransactionStatus.SUBMITTED, label: 'Payment Initiated', icon: <SendIcon className="w-6 h-6" /> },
    { status: TransactionStatus.CONVERTING, label: 'Processing FX', icon: <ArrowsRightLeftIcon className="w-6 h-6" /> },
    { status: TransactionStatus.AWAITING_AUTHORIZATION, label: 'Pending Authorization', icon: <ShieldCheckIcon className="w-6 h-6" /> },
    { status: TransactionStatus.FLAGGED_AWAITING_CLEARANCE, label: 'Compliance Review', icon: <ScaleIcon className="w-6 h-6" /> },
    { status: TransactionStatus.CLEARANCE_GRANTED, label: 'Authorization Success', icon: <ShieldCheckIcon className="w-6 h-6" /> },
    { status: TransactionStatus.IN_TRANSIT, label: 'Sent to Network', icon: <GlobeAltIcon className="w-6 h-6" /> },
    { status: TransactionStatus.FUNDS_ARRIVED, label: 'Funds Delivered', icon: <BankIcon className="w-6 h-6" /> },
  ];
  
  // Filter steps to only include those relevant to this specific transaction's history
  const steps = allPossibleSteps.filter(step => 
      step.status === status || (statusTimestamps as any)[step.status]
  );

  const currentStepIndex = steps.findIndex(s => s.status === status);
  const isComplete = status === TransactionStatus.FUNDS_ARRIVED;

  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isStepCompleted = index < currentStepIndex || isComplete;
          const isCurrentStep = index === currentStepIndex && !isComplete;
          const timestamp = statusTimestamps[step.status as keyof typeof statusTimestamps];
          const isFlaggedStep = step.status === TransactionStatus.FLAGGED_AWAITING_CLEARANCE;

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isStepCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrentStep && isFlaggedStep
                      ? 'bg-yellow-500 text-white animate-pulse'
                      : isCurrentStep
                      ? 'bg-primary text-white animate-pulse'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isStepCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    React.cloneElement(step.icon, {
                        className: `w-6 h-6 ${isCurrentStep ? 'text-white' : ''}`
                    })
                  )}
                </div>
                <p
                  className={`mt-2 text-xs text-center font-medium w-24 ${
                    isStepCompleted || isCurrentStep ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <div className="text-xs text-slate-400 mt-1 text-center">
                    <p>{timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    <p>{timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 mt-5 transition-colors duration-300 ${
                    isStepCompleted ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};