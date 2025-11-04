import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Account, AccountType, View } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, VerifiedBadgeIcon, SpinnerIcon, ClockIcon } from './Icons';

const AccountCarouselCard: React.FC<{ account: Account; isBalanceVisible: boolean; onViewDetails: () => void }> = ({ account, isBalanceVisible, onViewDetails }) => {
    if (account.status === 'Provisioning') {
        return (
            <div className="relative w-full rounded-2xl shadow-digital-inset overflow-hidden text-slate-300 bg-slate-700/50 flex flex-col items-center justify-center text-center p-6" style={{ height: '220px' }}>
                <SpinnerIcon className="w-10 h-10 text-primary" />
                <h4 className="font-bold text-lg mt-3 text-slate-200">Account Provisioning</h4>
                <p className="text-sm mt-1">This may take 4-5 business hours. We'll notify you when it's ready.</p>
            </div>
        );
    }
    if (account.status === 'Under Review') {
        return (
            <div className="relative w-full rounded-2xl shadow-digital-inset overflow-hidden text-slate-300 bg-slate-700/50 flex flex-col items-center justify-center text-center p-6" style={{ height: '220px' }}>
                <ClockIcon className="w-10 h-10 text-yellow-400" />
                <h4 className="font-bold text-lg mt-3 text-slate-200">Account Under Review</h4>
                <p className="text-sm mt-1">Your account is pending approval by our customer service team. This typically takes 5-10 minutes. We'll notify you once it's complete.</p>
            </div>
        );
    }
    
    const cardContent = (
      <>
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        <div className="relative z-10 p-6 flex flex-col h-full">
            <div>
                <h4 className="font-bold text-xl drop-shadow-md">{account.nickname || account.type}</h4>
                <p className="text-sm font-mono opacity-80 drop-shadow-sm">{account.accountNumber}</p>
            </div>
            <div className="flex-grow flex flex-col justify-center">
                <p className="text-sm opacity-80">Available Balance</p>
                <p className={`text-4xl font-bold tracking-wider transition-all duration-300 ${!isBalanceVisible ? 'blur-md' : ''}`} style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.5)' }}>
                    {isBalanceVisible ? account.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$ ••••••••'}
                </p>
            </div>
            <div className="flex items-center justify-between">
                {account.features[0] && (
                    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                       <VerifiedBadgeIcon className="w-4 h-4 text-blue-400" />
                       <span>{account.features[0]}</span>
                    </div>
                )}
                <button onClick={onViewDetails} className="text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors">
                    View Details &rarr;
                </button>
            </div>
        </div>
      </>
    );

    const accountBackgrounds: { [key in AccountType]?: { type: 'video' | 'image'; url: string; } } = {
        [AccountType.CHECKING]: { 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2940&auto=format&fit=crop'
        },
        [AccountType.SAVINGS]: { 
            type: 'image', 
            url: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=2938&auto=format&fit=crop'
        },
        [AccountType.BUSINESS]: { 
            type: 'video', 
            url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-42411-large.mp4'
        },
    };
    
    const background = accountBackgrounds[account.type];

    return (
        <div className="group relative w-full rounded-2xl shadow-lg overflow-hidden text-white" style={{ height: '220px' }}>
            {background?.type === 'image' ? (
                 <img
                    src={background.url}
                    alt={`${account.nickname || account.type} background`}
                    className="absolute inset-0 w-full h-full object-cover animate-card-zoom"
                />
            ) : (
                <video
                    key={account.id}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                    src={background?.url || 'https://assets.mixkit.co/videos/preview/mixkit-times-square-in-the-rain-at-night-4379-large.mp4'}
                />
            )}
            {cardContent}
        </div>
    );
};


interface AccountCarouselProps {
    accounts: Account[];
    isBalanceVisible: boolean;
    setActiveView: (view: View) => void;
}

export const AccountCarousel: React.FC<AccountCarouselProps> = ({ accounts, isBalanceVisible, setActiveView }) => {
    const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
  
    const handlePrev = useCallback(() => {
        setCurrentAccountIndex((prevIndex) => (prevIndex === 0 ? accounts.length - 1 : prevIndex - 1));
    }, [accounts.length]);

    const handleNext = useCallback(() => {
        setCurrentAccountIndex((prevIndex) => (prevIndex === accounts.length - 1 ? 0 : prevIndex + 1));
    }, [accounts.length]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement === carousel) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    handlePrev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    handleNext();
                }
            }
        };

        carousel.addEventListener('keydown', handleKeyDown);
        return () => {
            if (carousel) {
                carousel.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [handlePrev, handleNext]);

    return (
        <div
            className="relative"
            ref={carouselRef}
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label="Accounts"
        >
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentAccountIndex * 100}%)` }}
                >
                    {accounts.map(account => (
                        <div key={account.id} className="w-full flex-shrink-0" aria-hidden={accounts[currentAccountIndex].id !== account.id}>
                            <AccountCarouselCard account={account} isBalanceVisible={isBalanceVisible} onViewDetails={() => setActiveView('accounts')} />
                        </div>
                    ))}
                </div>
            </div>
            {accounts.length > 1 && (
                <>
                    <button onClick={handlePrev} aria-label="Previous account" className="absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-700 text-white shadow-lg opacity-50 hover:opacity-100 transition-opacity"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <button onClick={handleNext} aria-label="Next account" className="absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full bg-slate-700 text-white shadow-lg opacity-50 hover:opacity-100 transition-opacity"><ChevronRightIcon className="w-6 h-6" /></button>
                </>
            )}
        </div>
    );
};
