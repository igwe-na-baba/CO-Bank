import React, { useState } from 'react';
import { SubscriptionService, SubscriptionServiceType } from '../types';
import { WifiIcon, TvIcon, SatelliteDishIcon, CheckCircleIcon, SpinnerIcon } from './Icons';

interface SubscriptionManagerProps {
    subscriptions: SubscriptionService[];
    onPay: (subscriptionId: string) => boolean;
}

const SubscriptionCard: React.FC<{ subscription: SubscriptionService; onPay: (id: string) => boolean; }> = ({ subscription, onPay }) => {
    const [status, setStatus] = useState<'idle' | 'paying' | 'paid'>(subscription.isPaid ? 'paid' : 'idle');

    const handlePay = () => {
        setStatus('paying');
        setTimeout(() => {
            const success = onPay(subscription.id);
            if (success) {
                setStatus('paid');
            } else {
                // Handle payment failure if needed, e.g., show an error message
                setStatus('idle');
            }
        }, 1500);
    };

    const getIcon = () => {
        switch (subscription.type) {
            case SubscriptionServiceType.INTERNET: return <WifiIcon className="w-6 h-6 text-primary" />;
            case SubscriptionServiceType.TV: return <TvIcon className="w-6 h-6 text-primary" />;
            case SubscriptionServiceType.SATELLITE: return <SatelliteDishIcon className="w-6 h-6 text-primary" />;
            default: return null;
        }
    };

    const isOverdue = !subscription.isPaid && new Date() > subscription.dueDate;

    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-200 rounded-md shadow-digital">
                        {getIcon()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{subscription.provider}</p>
                        <p className="text-xs text-slate-500">{subscription.plan}</p>
                    </div>
                </div>
                <p className="font-bold text-lg text-slate-800 font-mono">
                    {subscription.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
                <div>
                    <p className="text-xs font-semibold text-slate-500">
                        {status === 'paid' ? 'Paid on' : isOverdue ? 'Due Since' : 'Due Date'}
                    </p>
                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                        {subscription.dueDate.toLocaleDateString()}
                    </p>
                </div>
                <button
                    onClick={handlePay}
                    disabled={status !== 'idle'}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-md w-28 text-center transition-all duration-300
                        ${status === 'idle' ? 'bg-primary text-white hover:shadow-lg' : ''}
                        ${status === 'paying' ? 'bg-yellow-500 text-white cursor-wait' : ''}
                        ${status === 'paid' ? 'bg-green-500 text-white' : ''}
                        disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {status === 'idle' && 'Pay Now'}
                    {status === 'paying' && <SpinnerIcon className="w-5 h-5 mx-auto" />}
                    {status === 'paid' && <div className="flex items-center justify-center space-x-1.5"><CheckCircleIcon className="w-5 h-5"/><span>Paid</span></div>}
                </button>
            </div>
        </div>
    );
};

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onPay }) => {
    const upcoming = subscriptions.filter(s => !s.isPaid).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const paid = subscriptions.filter(s => s.isPaid);

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">My Subscriptions</h3>
            <div className="p-6 space-y-4">
                {upcoming.length > 0 ? (
                    upcoming.map(sub => <SubscriptionCard key={sub.id} subscription={sub} onPay={onPay} />)
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">All your subscriptions are paid up!</p>
                )}

                {paid.length > 0 && (
                     <details className="pt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-600">View Paid Subscriptions</summary>
                        <div className="space-y-4 mt-4">
                             {paid.map(sub => <SubscriptionCard key={sub.id} subscription={sub} onPay={onPay} />)}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
};