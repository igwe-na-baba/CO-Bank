import React from 'react';
import { SubscriptionService, AppleCardDetails, AppleCardTransaction, SpendingLimit, SpendingCategory } from '../types';
import { SubscriptionManager } from './SubscriptionManager';
import { AppleCardManager } from './AppleCardManager';

interface ServicesDashboardProps {
    subscriptions: SubscriptionService[];
    appleCardDetails: AppleCardDetails;
    appleCardTransactions: AppleCardTransaction[];
    onPaySubscription: (subscriptionId: string) => boolean;
    onUpdateSpendingLimits: (limits: SpendingLimit[]) => void;
    onUpdateTransactionCategory: (transactionId: string, category: SpendingCategory) => void;
}

export const ServicesDashboard: React.FC<ServicesDashboardProps> = ({ 
    subscriptions, 
    appleCardDetails, 
    appleCardTransactions, 
    onPaySubscription,
    onUpdateSpendingLimits,
    onUpdateTransactionCategory
}) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Bill Pay & Services</h2>
                <p className="text-sm text-slate-500 mt-1">Manage your connected subscriptions and vendor cards all in one place.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <SubscriptionManager subscriptions={subscriptions} onPay={onPaySubscription} />
                </div>
                <div className="lg:col-span-2">
                    <AppleCardManager 
                        card={appleCardDetails} 
                        transactions={appleCardTransactions}
                        onUpdateLimits={onUpdateSpendingLimits}
                        onUpdateCategory={onUpdateTransactionCategory}
                    />
                </div>
            </div>
        </div>
    );
};