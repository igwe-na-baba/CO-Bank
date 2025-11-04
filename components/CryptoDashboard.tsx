import React, { useState, useMemo, useEffect } from 'react';
import { CryptoAsset, CryptoHolding, Account } from '../types';
import { TradingView } from './TradingView';
import { SpinnerIcon, TrendingUpIcon, ShieldCheckIcon } from './Icons';

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
        let totalValue = 0;
        let totalCost = 0;
        holdings.forEach(holding => {
            const asset = assets.find(a => a.id === holding.assetId);
            if (asset) {
                totalValue += holding.amount * asset.price;
                totalCost += holding.amount * holding.avgBuyPrice;
            }
        });
        const totalPL = totalValue - totalCost;
        const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
        return { totalValue, totalCost, totalPL, totalPLPercent };
    }, [holdings, assets]);

    const plColor = totalPL >= 0 ? 'text-green-600' : 'text-red-600';

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
            <h3 className="text-xl font-bold text-slate-800">My Portfolio</h3>
            <p className="text-4xl font-bold text-slate-900 mt-2">{totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <div className={`flex items-center text-lg font-semibold mt-1 ${plColor}`}>
                <TrendingUpIcon className={`w-5 h-5 mr-1 ${totalPL < 0 ? 'transform rotate-180' : ''}`} />
                <span>{totalPL.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} ({totalPLPercent.toFixed(2)}%) Total P/L</span>
            </div>
        </div>
    );
};

const MarketList: React.FC<{ assets: CryptoAsset[], onSelect: (asset: CryptoAsset) => void }> = ({ assets, onSelect }) => {
    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital">
            <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">Market</h3>
            <div className="divide-y divide-slate-300">
                {assets.map(asset => {
                    const priceColor = asset.change24h >= 0 ? 'text-green-600' : 'text-red-600';
                    return (
                        <div key={asset.id} onClick={() => onSelect(asset)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-300/50 transition-colors">
                            <div className="flex items-center space-x-3">
                                <asset.icon className="w-8 h-8"/>
                                <div>
                                    <p className="font-bold text-slate-800">{asset.name}</p>
                                    <p className="text-sm text-slate-500">{asset.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold font-mono text-slate-800">{asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                <p className={`text-sm font-semibold ${priceColor}`}>{asset.change24h.toFixed(2)}%</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CryptoDashboard: React.FC<CryptoDashboardProps> = ({ cryptoAssets, setCryptoAssets, holdings, checkingAccount, onBuy, onSell }) => {
    const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(cryptoAssets[0] || null);
    
    // Simulate real-time price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCryptoAssets(prevAssets => 
                prevAssets.map(asset => {
                    const changePercent = (Math.random() - 0.5) * 0.005; // +/- 0.25%
                    const newPrice = asset.price * (1 + changePercent);
                    const newChange24h = asset.change24h + (changePercent * 100);
                    
                    const newPriceHistory = [...asset.priceHistory.slice(1), newPrice];

                    return { ...asset, price: newPrice, change24h: newChange24h, priceHistory: newPriceHistory };
                })
            );
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, [setCryptoAssets]);
    
    // Update selectedAsset with the latest price data
    const liveSelectedAsset = useMemo(() => {
        if (!selectedAsset) return null;
        return cryptoAssets.find(a => a.id === selectedAsset.id) || null;
    }, [selectedAsset, cryptoAssets]);


    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Cryptocurrency Platform</h2>
                <p className="text-sm text-slate-500 mt-1">Trade, monitor, and manage your digital assets in real-time.</p>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 flex items-start space-x-4">
                <ShieldCheckIcon className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-slate-800">Digital Asset Security</h3>
                    <p className="text-sm text-slate-600">Your assets are secured with multi-layer cold storage and institutional-grade custody solutions. All trades require PIN authorization for your protection. Remember, crypto investments are volatile and carry risk.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <PortfolioSummary holdings={holdings} assets={cryptoAssets} />
                    <MarketList assets={cryptoAssets} onSelect={setSelectedAsset} />
                </div>
                <div className="lg:col-span-2">
                    {liveSelectedAsset ? (
                        <TradingView 
                            asset={liveSelectedAsset} 
                            holdings={holdings}
                            checkingAccount={checkingAccount}
                            onBuy={onBuy}
                            onSell={onSell}
                        />
                    ) : (
                        <div className="bg-slate-200 rounded-2xl shadow-digital p-6 flex items-center justify-center h-full">
                            <p className="text-slate-500">Select an asset from the market list to start trading.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
