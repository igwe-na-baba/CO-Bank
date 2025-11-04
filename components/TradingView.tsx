import React, { useState, useMemo } from 'react';
import { CryptoAsset, CryptoHolding, Account, Order, Trade } from '../types';
import { SpinnerIcon } from './Icons';
import { TradeConfirmationModal } from './TradeConfirmationModal';

interface TradingViewProps {
    asset: CryptoAsset;
    holdings: CryptoHolding[];
    checkingAccount?: Account;
    onBuy: (assetId: string, usdAmount: number, assetPrice: number) => boolean;
    onSell: (assetId: string, cryptoAmount: number, assetPrice: number) => boolean;
}

const PriceChart: React.FC<{ history: number[], asset: CryptoAsset }> = ({ history, asset }) => {
    const minPrice = Math.min(...history);
    const maxPrice = Math.max(...history);
    const range = maxPrice - minPrice;
    
    const points = history.map((price, i) => {
        const x = (i / (history.length - 1)) * 500;
        const y = 150 - ((price - minPrice) / range) * 140;
        return `${x},${y}`;
    }).join(' ');

    const isPositiveChange = asset.change24h >= 0;

    return (
        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset">
            <svg viewBox="0 0 500 150" className="w-full h-auto">
                <polyline
                    fill="none"
                    stroke={isPositiveChange ? "#22c55e" : "#ef4444"}
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        </div>
    );
};

const OrderBook: React.FC<{ asset: CryptoAsset }> = ({ asset }) => {
    const generateOrders = (count: number, side: 'buy' | 'sell'): Order[] => {
        return Array.from({ length: count }, (_, i) => {
            const priceFluctuation = (Math.random() - (side === 'buy' ? 0.55 : 0.45)) * asset.price * 0.01;
            const size = Math.random() * (asset.symbol === 'BTC' ? 0.5 : 10);
            return {
                price: asset.price + priceFluctuation,
                size: size
            };
        }).sort((a, b) => side === 'buy' ? b.price - a.price : a.price - b.price);
    };

    const bids = useMemo(() => generateOrders(8, 'buy'), [asset.price]);
    const asks = useMemo(() => generateOrders(8, 'sell'), [asset.price]);

    return (
        <div className="text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between text-slate-500 mb-1"><span>Price (USD)</span><span>Size ({asset.symbol})</span></div>
                    {bids.map((order, i) => (
                        <div key={i} className="flex justify-between text-green-600">
                            <span>{order.price.toFixed(2)}</span>
                            <span>{order.size.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex justify-between text-slate-500 mb-1"><span>Price (USD)</span><span>Size ({asset.symbol})</span></div>
                     {asks.map((order, i) => (
                        <div key={i} className="flex justify-between text-red-600">
                            <span>{order.price.toFixed(2)}</span>
                            <span>{order.size.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TradeHistory: React.FC<{ asset: CryptoAsset }> = ({ asset }) => {
    const trades = useMemo(() => Array.from({ length: 10 }, (_, i): Trade => {
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const priceFluctuation = (Math.random() - 0.5) * asset.price * 0.005;
        const size = Math.random() * (asset.symbol === 'BTC' ? 0.1 : 5);
        const time = new Date(Date.now() - i * 1000 * Math.random() * 5).toLocaleTimeString();
        return {
            id: `${i}-${time}`,
            price: asset.price + priceFluctuation,
            size: size,
            time: time,
            type: type
        };
    }), [asset.price]);

    return (
        <div className="text-xs font-mono">
            <div className="grid grid-cols-3 text-slate-500 mb-1">
                <span>Time</span><span className="text-right">Price (USD)</span><span className="text-right">Size ({asset.symbol})</span>
            </div>
            {trades.map(trade => (
                <div key={trade.id} className={`grid grid-cols-3 ${trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{trade.time}</span>
                    <span className="text-right">{trade.price.toFixed(2)}</span>
                    <span className="text-right">{trade.size.toFixed(4)}</span>
                </div>
            ))}
        </div>
    );
};


export const TradingView: React.FC<TradingViewProps> = ({ asset, holdings, checkingAccount, onBuy, onSell }) => {
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
    const [amount, setAmount] = useState(''); // This is always in USD for simplicity
    const [isConfirming, setIsConfirming] = useState(false);
    
    const holding = holdings.find(h => h.assetId === asset.id);
    const assetBalance = holding?.amount || 0;
    const usdBalance = checkingAccount?.balance || 0;

    const numericAmount = parseFloat(amount) || 0;
    const cryptoAmount = numericAmount / asset.price;
    
    const isTradeInvalid = tradeType === 'buy' 
        ? numericAmount <= 0 || numericAmount > usdBalance
        : cryptoAmount <= 0 || cryptoAmount > assetBalance;

    const handleConfirmTrade = () => {
        setIsConfirming(true);
    };

    const handleExecuteTrade = (): boolean => {
        let success = false;
        if (tradeType === 'buy') {
            success = onBuy(asset.id, numericAmount, asset.price);
        } else {
            success = onSell(asset.id, cryptoAmount, asset.price);
        }
        if (success) {
            setAmount('');
        }
        setIsConfirming(false);
        return success;
    };


    return (
        <>
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6 space-y-4">
            <div className="flex items-center space-x-4">
                <asset.icon className="w-10 h-10" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{asset.name} ({asset.symbol})</h2>
                    <p className="font-mono text-slate-600">{asset.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
            </div>

            <PriceChart history={asset.priceHistory} asset={asset} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Trade Form */}
                <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setTradeType('buy')} className={`py-2 rounded-md font-semibold transition-all ${tradeType === 'buy' ? 'bg-green-500 text-white shadow-md' : 'bg-slate-200 text-slate-700 shadow-digital active:shadow-digital-inset'}`}>Buy</button>
                        <button onClick={() => setTradeType('sell')} className={`py-2 rounded-md font-semibold transition-all ${tradeType === 'sell' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-200 text-slate-700 shadow-digital active:shadow-digital-inset'}`}>Sell</button>
                    </div>

                    <div className="text-sm">
                        <p>USD Balance: <span className="font-semibold">{usdBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
                        <p>{asset.symbol} Balance: <span className="font-semibold">{assetBalance.toFixed(6)}</span></p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Amount (USD)</label>
                        <div className="mt-1 relative rounded-md shadow-digital-inset">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-transparent border-0 p-3"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="text-center text-sm text-slate-600">
                        You will {tradeType === 'buy' ? 'get approx.' : 'sell approx.'} <span className="font-bold text-slate-800">{cryptoAmount.toFixed(6)} {asset.symbol}</span>
                    </div>

                    <button onClick={handleConfirmTrade} disabled={isTradeInvalid} className="w-full py-3 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:bg-slate-400 disabled:cursor-not-allowed bg-primary">
                        {tradeType === 'buy' ? 'Buy' : 'Sell'} {asset.symbol}
                    </button>
                </div>
                {/* Market Data */}
                <div className="space-y-4">
                    <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset h-40 overflow-y-auto">
                       <h4 className="font-semibold text-slate-700 text-sm mb-2">Order Book</h4>
                       <OrderBook asset={asset} />
                    </div>
                     <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset h-40 overflow-y-auto">
                       <h4 className="font-semibold text-slate-700 text-sm mb-2">Trade History</h4>
                       <TradeHistory asset={asset} />
                    </div>
                </div>
            </div>
        </div>
        {isConfirming && (
             <TradeConfirmationModal
                asset={asset}
                tradeType={tradeType}
                usdAmount={numericAmount}
                cryptoAmount={cryptoAmount}
                onClose={() => setIsConfirming(false)}
                onConfirm={handleExecuteTrade}
            />
        )}
        </>
    );
};
