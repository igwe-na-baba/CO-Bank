import React, { useState, useMemo, useEffect } from 'react';
import { CryptoAsset, CryptoHolding, Account } from '../types';
import { TradingView } from './TradingView';
import { TrendingUpIcon, ShieldCheckIcon } from './Icons';

interface CryptoDashboardProps {
    cryptoAssets: CryptoAsset[];
    setCryptoAssets: React.Dispatch<React.SetStateAction<CryptoAsset[]>>;
    holdings: CryptoHolding[];
    checkingAccount?: Account;
    onBuy: (assetId: string, usdAmount: number, assetPrice: number) => boolean;
    onSell: (assetId: string, cryptoAmount: number, assetPrice: number) => boolean;
}

const PortfolioSummary: React.FC<{ holdings: CryptoHolding[], assets: CryptoAsset[] }> = ({ holdings, assets }) => {
    const { totalValue, totalCost, totalPL, totalPLPercent } = useMemo(() => {
        let value = 0;
        let cost = 0;
        holdings.forEach(holding => {
            const asset = assets.find(a => a.id === holding.assetId);
            if (asset) {
                value += holding.amount * asset.price;
                cost += holding.amount * holding.avgBuyPrice;
            }
        });
        const pl = value - cost;
        const plPercent = cost > 0 ? (pl / cost) * 100 : 0;
        return { totalValue: value, totalCost: cost, totalPL: pl, totalPLPercent: plPercent };
    }, [holdings, assets]);

    const isPositive = totalPL >= 0;

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
            <p className="text-sm font-semibold text-slate-600">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-slate-800 mt-1">{totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <div className={`flex items-center text-lg font-semibold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUpIcon className={`w-5 h-5 mr-1 ${!isPositive ? 'transform -scale-y-100' : ''}`} />
                <span>{totalPL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ({totalPLPercent.toFixed(2)}%) All Time</span>
            </div>
        </div>
    );
};

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({ cryptoAssets, setCryptoAssets, holdings, checkingAccount, onBuy, onSell }) => {
    const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);

    // Live price updates simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setCryptoAssets(prevAssets =>
                prevAssets.map(asset => {
                    const change = (Math.random() - 0.5) * 0.01; // +/- 0.5%
                    const newPrice = asset.price * (1 + change);
                    const newPriceHistory = [...asset.priceHistory.slice(1), newPrice];
                    return { ...asset, price: newPrice, change24h: asset.change24h + change * 100, priceHistory: newPriceHistory };
                })
            );
        }, 3000);
        return () => clearInterval(interval);
    }, [setCryptoAssets]);

    const holdingsWithValue = useMemo(() => {
        return holdings.map(holding => {
            const asset = cryptoAssets.find(a => a.id === holding.assetId);
            if (!asset) return null;
            const currentValue = holding.amount * asset.price;
            const totalCost = holding.amount * holding.avgBuyPrice;
            const pl = currentValue - totalCost;
            const plPercent = totalCost > 0 ? (pl / totalCost) * 100 : 0;
            return { ...holding, asset, currentValue, pl, plPercent };
        }).filter((h): h is NonNullable<typeof h> => h !== null);
    }, [holdings, cryptoAssets]);

    if (selectedAsset) {
        return (
            <div className="animate-fade-in-up">
                <button onClick={() => setSelectedAsset(null)} className="mb-4 text-sm font-semibold text-primary">&larr; Back to Portfolio</button>
                <TradingView
                    asset={selectedAsset}
                    holdings={holdings}
                    checkingAccount={checkingAccount}
                    onBuy={onBuy}
                    onSell={onSell}
                />
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Crypto Portfolio</h2>
                    <p className="text-sm text-slate-500 mt-1">Buy, sell, and manage your digital assets.</p>
                </div>
                 <div className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Assets held securely in cold storage</span>
                </div>
            </div>

            <PortfolioSummary holdings={holdings} assets={cryptoAssets} />

             <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300">
                    <h3 className="text-xl font-bold text-slate-800">My Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                         <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                             <tr>
                                <th className="px-6 py-3">Asset</th>
                                <th className="px-6 py-3 text-right">Balance</th>
                                <th className="px-6 py-3 text-right">Price</th>
                                <th className="px-6 py-3 text-right">Value</th>
                                <th className="px-6 py-3 text-right">P/L</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {holdingsWithValue.map(h => (
                                <tr key={h.assetId}>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <h.asset.icon className="w-8 h-8"/>
                                        <div>
                                            <p className="font-bold text-slate-800">{h.asset.name}</p>
                                            <p className="text-xs text-slate-500">{h.asset.symbol}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        <p>{h.amount.toFixed(6)}</p>
                                        <p className="text-xs text-slate-500">Avg. Buy: {h.avgBuyPrice.toLocaleString('en-US',{style:'currency',currency:'USD'})}</p>
                                    </td>
                                     <td className="px-6 py-4 text-right font-mono">{h.asset.price.toLocaleString('en-US',{style:'currency',currency:'USD'})}</td>
                                    <td className="px-6 py-4 text-right font-mono font-semibold">{h.currentValue.toLocaleString('en-US',{style:'currency',currency:'USD'})}</td>
                                    <td className={`px-6 py-4 text-right font-mono font-semibold ${h.pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{h.pl.toFixed(2)} ({h.plPercent.toFixed(2)}%)</td>
                                    <td className="px-6 py-4"><button onClick={() => setSelectedAsset(h.asset)} className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg shadow-md">Trade</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
