import React, { useMemo } from 'react';
import { AppleCardTransaction, SpendingCategory, SpendingLimit, SPENDING_CATEGORIES } from '../types';

interface AppleCardSpendingInsightsProps {
    transactions: AppleCardTransaction[];
    spendingLimits: SpendingLimit[];
    onManageLimits: () => void;
}

const DonutChart: React.FC<{ data: { category: SpendingCategory; value: number }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 w-48 rounded-full bg-slate-300/50 shadow-digital-inset"><p className="text-sm text-slate-500">No spending data</p></div>;
    }

    const colors = ['#0052FF', '#669BFF', '#99BDFF', '#CCDEFF', '#337AFF', '#003199', '#002166'];
    let cumulative = 0;

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const dashArray = 2 * Math.PI * 45;
        const dashOffset = dashArray * (1 - percentage / 100);
        const rotation = (cumulative / total) * 360;
        cumulative += item.value;

        return (
            <circle
                key={item.category}
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeWidth="10"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform={`rotate(${rotation - 90} 50 50)`}
            />
        );
    });

    return (
        <svg viewBox="0 0 100 100" className="w-48 h-48">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            {segments}
        </svg>
    );
};

export const AppleCardSpendingInsights: React.FC<AppleCardSpendingInsightsProps> = ({ transactions, spendingLimits, onManageLimits }) => {
    const spendingByCategory = useMemo(() => {
        const spending: { [key in SpendingCategory]?: number } = {};
        for (const category of SPENDING_CATEGORIES) {
            spending[category] = 0;
        }
        transactions.forEach(tx => {
            if (spending[tx.category] !== undefined) {
                spending[tx.category]! += tx.amount;
            }
        });
        return spending;
    }, [transactions]);

    // FIX: Explicitly cast `value` to a number to resolve type inference issues with `Object.entries`.
    // This addresses errors where `item.value` was treated as `unknown`.
    const chartData = Object.entries(spendingByCategory)
        .map(([category, value]) => ({ category: category as SpendingCategory, value: value as number }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                    <DonutChart data={chartData} />
                </div>
                <div className="w-full">
                    <ul className="space-y-2">
                        {chartData.slice(0, 5).map((item, index) => (
                            <li key={item.category} className="flex items-center text-sm">
                                <span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: ['#0052FF', '#669BFF', '#99BDFF', '#CCDEFF', '#337AFF'][index] }}></span>
                                <span className="text-slate-600 flex-1">{item.category}</span>
                                <span className="font-semibold text-slate-800">{item.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-700">Category Spending & Limits</h4>
                    <button onClick={onManageLimits} className="text-sm font-semibold text-primary hover:underline">Manage Limits</button>
                </div>
                <div className="space-y-3">
                    {SPENDING_CATEGORIES.map(category => {
                        const spent = spendingByCategory[category] || 0;
                        const limit = spendingLimits.find(l => l.category === category)?.limit;
                        if (spent === 0 && !limit) return null;
                        
                        const percentage = limit ? (spent / limit) * 100 : 0;
                        const progressBarColor = percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-primary';

                        return (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-800">{category}</span>
                                    <span className="text-slate-500">
                                        <span className="font-semibold text-slate-700">${spent.toFixed(2)}</span>
                                        {limit && ` of $${limit}`}
                                    </span>
                                </div>
                                {limit && (
                                     <div className="w-full bg-slate-200 rounded-full h-2 shadow-digital-inset">
                                        <div className={`${progressBarColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};