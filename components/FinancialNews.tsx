import React, { useState, useEffect } from 'react';
import { getFinancialNews, getCountryBankingTip, BankingTipResult } from '../services/geminiService';
import { NewsArticle, Country } from '../types';
import { ALL_COUNTRIES } from '../constants';
import { SpinnerIcon, InfoIcon, StarIcon, LightBulbIcon } from './Icons';

const NewsArticleCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <div className="p-4 rounded-lg shadow-inner bg-slate-800/50 border border-slate-700">
        <span className="inline-block bg-primary-500/20 text-primary-300 text-xs font-semibold px-2 py-1 rounded-full mb-2">
            {article.category}
        </span>
        <h4 className="font-bold text-slate-100 mb-1">{article.title}</h4>
        <p className="text-sm text-slate-400">{article.summary}</p>
    </div>
);

const AdCard: React.FC = () => (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 text-primary-500/20">
            <StarIcon />
        </div>
        <div className="relative z-10">
            <h3 className="text-xl font-bold">Upgrade to iCredit Union® Premium</h3>
            <p className="mt-2 text-sm text-primary-100">Unlock higher transfer limits, a dedicated account manager, and exclusive investment opportunities.</p>
            <button className="mt-4 bg-white text-primary font-bold py-2 px-4 rounded-lg shadow-md hover:bg-slate-100 transition-colors">
                Learn More
            </button>
        </div>
    </div>
);


const NewsSkeletonLoader: React.FC = () => (
    <div className="p-4 rounded-lg shadow-inner bg-slate-800/50 border border-slate-700 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/3 mb-3"></div>
        <div className="h-5 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-4/5"></div>
    </div>
);


export const FinancialNews: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(true);
    const [isNewsError, setIsNewsError] = useState(false);

    // New state for the banking tip feature
    const [selectedCountryCode, setSelectedCountryCode] = useState<string>('GB'); // Default to UK
    const [bankingTip, setBankingTip] = useState<string>('');
    const [isTipLoading, setIsTipLoading] = useState(true);
    const [isTipError, setIsTipError] = useState(false);

    useEffect(() => {
        const fetchNews = async () => {
            setIsLoadingNews(true);
            setIsNewsError(false);
            const result = await getFinancialNews();
            if (result.isError) {
                setIsNewsError(true);
            } else {
                setArticles(result.articles);
            }
            setIsLoadingNews(false);
        };
        fetchNews();
    }, []);

    // New useEffect for banking tips
    useEffect(() => {
        const fetchTip = async () => {
            if (!selectedCountryCode) return;

            const country = ALL_COUNTRIES.find(c => c.code === selectedCountryCode);
            if (!country) return;

            setIsTipLoading(true);
            setIsTipError(false);
            const result: BankingTipResult = await getCountryBankingTip(country.name);
            setBankingTip(result.tip);
            setIsTipError(result.isError);
            setIsTipLoading(false);
        };
        fetchTip();
    }, [selectedCountryCode]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-slate-700/50 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-100">Market Insights & News</h2>
                </div>
                <div className="p-6">
                    {isLoadingNews ? (
                        <div className="space-y-4">
                           <NewsSkeletonLoader />
                           <NewsSkeletonLoader />
                           <NewsSkeletonLoader />
                        </div>
                    ) : isNewsError ? (
                        <div className="flex items-center space-x-3 text-yellow-300 bg-yellow-500/10 p-4 rounded-lg shadow-inner">
                            <InfoIcon className="w-6 h-6" />
                            <p>Could not load financial news at this time. Please try again later.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {articles.map((article, index) => (
                                <NewsArticleCard key={index} article={article} />
                            ))}
                        </div>
                    )}
                </div>
                
                {/* NEW "Did You Know?" Section */}
                <div className="p-6 border-t border-slate-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <LightBulbIcon className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-lg font-bold text-slate-100">Did You Know?</h3>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                        <label htmlFor="country-tip-select" className="text-sm font-medium text-slate-300 flex-shrink-0">
                            Get transfer tips for:
                        </label>
                        <select
                            id="country-tip-select"
                            value={selectedCountryCode}
                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                            className="w-full sm:w-auto bg-slate-800/50 border border-slate-600 text-slate-100 p-2 rounded-md shadow-inner focus:ring-2 focus:ring-primary-400"
                        >
                            {ALL_COUNTRIES.map((country: Country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={`p-4 rounded-lg flex items-start space-x-3 shadow-inner ${isTipError ? 'bg-yellow-500/10 text-yellow-300' : 'bg-primary-500/10 text-primary-300'}`}>
                        {isTipLoading ? (
                            <SpinnerIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm">
                            {isTipLoading ? 'Fetching AI-powered tip...' : bankingTip}
                        </p>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1">
                <AdCard />
            </div>
        </div>
    );
};