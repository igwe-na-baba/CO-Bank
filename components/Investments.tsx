import React, { useState, useEffect } from 'react';
import { TrendingUpIcon, ArrowsRightLeftIcon, SpinnerIcon } from './Icons';
import { EXCHANGE_RATES } from '../constants';

const marketIndices = [
    { name: 'S&P 500', value: '5,487.03', change: '+21.43', percentChange: '+0.39%', positive: true },
    { name: 'NASDAQ', value: '17,857.02', change: '+167.64', percentChange: '+0.95%', positive: true },
    { name: 'Dow Jones', value: '38,778.10', change: '-62.30', percentChange: '-0.16%', positive: false },
    { name: 'FTSE 100', value: '8,281.55', change: '+4.57', percentChange: '+0.06%', positive: true },
];

const IndexCard: React.FC<typeof marketIndices[0]> = ({ name, value, change, percentChange, positive }) => {
    const color = positive ? 'text-green-400' : 'text-red-400';
    return (
        <div className="bg-slate-700/50 p-4 rounded-xl shadow-digital">
            <p className="text-sm font-semibold text-slate-400">{name}</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
            <p className={`text-sm font-semibold mt-1 ${color}`}>{change} ({percentChange})</p>
        </div>
    );
};

const KeyRates: React.FC = () => {
    const [rates, setRates] = useState<{ EUR: number, GBP: number, JPY: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60);

    const fetchRates = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setRates({
                EUR: data.rates.EUR,
                GBP: data.rates.GBP,
                JPY: data.rates.JPY,
            });
            setCountdown(60);
        } catch (error) {
            console.error("Failed to fetch rates:", error);
            setError("Could not load live rates.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    fetchRates();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const keyRateData = [
        { currency: 'EUR', name: 'Euro', flag: 'eu' },
        { currency: 'GBP', name: 'Pound Sterling', flag: 'gb' },
        { currency: 'JPY', name: 'Japanese Yen', flag: 'jp' },
    ];

    return (
         <div className="bg-slate-700/50 rounded-xl shadow-digital p-6">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-slate-100">Key Exchange Rates</h3>
                 <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <SpinnerIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Fetching...' : `Live rates refresh in ${countdown}s`}</span>
                </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {keyRateData.map(({ currency, name, flag }) => (
                    <div key={currency} className="bg-slate-800/50 p-4 rounded-lg shadow-inner">
                        <div className="flex items-center space-x-3 mb-2">
                            <img src={`https://flagcdn.com/w40/${flag}.png`} alt={name} className="w-6 h-auto rounded-sm" />
                            <div>
                                <p className="font-bold text-slate-200">{currency}/USD</p>
                                <p className="text-xs text-slate-400">{name}</p>
                            </div>
                        </div>
                        {isLoading ? <div className="h-8 w-3/4 bg-slate-700 rounded animate-pulse"></div> : rates && (
                            <p className="text-2xl font-mono font-bold text-slate-100">
                                {rates[currency as keyof typeof rates].toFixed(4)}
                            </p>
                        )}
                    </div>
                ))}
             </div>
        </div>
    );
};

export const Investments: React.FC = () => {
    const baseCurrency = 'USD';
    const rates = Object.entries(EXCHANGE_RATES).filter(([currency]) => currency !== baseCurrency);
    const [refreshCountdown, setRefreshCountdown] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setRefreshCountdown(prev => {
                if (prev <= 1) {
                    // In a real app, you would re-fetch rates here.
                    // For this demo, we just reset the timer.
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-100">Markets & Rates</h2>
                <p className="text-md text-slate-400 mt-1">Stay informed on global markets and foreign exchange rates.</p>
            </div>
            
            <KeyRates />

            <div>
                <h3 className="text-xl font-bold text-slate-200 mb-4">Major Indices</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {marketIndices.map(index => <IndexCard key={index.name} {...index} />)}
                </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl shadow-digital">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center space-x-3">
                        <ArrowsRightLeftIcon className="w-6 h-6 text-primary" />
                        <span>Indicative FX Rates</span>
                    </h3>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-400 mt-1">Rates based on {baseCurrency}.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-800/60 text-xs text-slate-400 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Currency</th>
                                <th scope="col" className="px-6 py-3 text-right">Units per {baseCurrency}</th>
                                <th scope="col" className="px-6 py-3 text-right">{baseCurrency} per Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {rates.map(([currency, rate]) => (
                                <tr key={currency} className="hover:bg-slate-700">
                                    <td className="px-6 py-4 font-semibold text-slate-200">{currency}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">{rate.toFixed(4)}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-300">{(1 / rate).toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};