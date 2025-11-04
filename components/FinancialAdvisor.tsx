import React from 'react';
import { AdvisorResponse, View } from '../types';
// FIX: Add missing icons
import { SpinnerIcon, SparklesIcon, InfoIcon, LightBulbIcon, TrendingUpIcon } from './Icons';

interface FinancialAdvisorProps {
    analysis: AdvisorResponse | null;
    isAnalyzing: boolean;
    analysisError: boolean;
    // FIX: Changed prop name to match what is passed from App.tsx
    runFinancialAnalysis: () => void;
    setActiveView: (view: View) => void;
}

const FinancialScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference * (1 - score / 100);
    const scoreColor = score > 80 ? 'text-green-500' : score > 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="text-slate-300" />
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${scoreColor}`}
                    style={{ transitionDelay: '500ms' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
                <span className="text-sm font-medium text-slate-500">Score</span>
            </div>
        </div>
    );
};


export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ analysis, isAnalyzing, analysisError, runFinancialAnalysis, setActiveView }) => {

    const renderContent = () => {
        if (isAnalyzing) {
            return (
                <div className="text-center p-12">
                    <SpinnerIcon className="w-16 h-16 text-primary mx-auto" />
                    <h3 className="mt-6 text-xl font-bold text-slate-800 animate-pulse">Analyzing your financial data...</h3>
                    <p className="text-slate-600 mt-2">Our AI is securely processing your information to provide personalized insights. This may take a moment.</p>
                </div>
            );
        }

        if (analysisError) {
            return (
                <div className="text-center p-12 bg-yellow-50 rounded-lg shadow-inner">
                    <InfoIcon className="w-12 h-12 text-yellow-500 mx-auto" />
                    <h3 className="mt-4 text-xl font-bold text-yellow-800">Analysis Failed</h3>
                    <p className="text-yellow-700 mt-2">We're sorry, but our AI advisor is currently unavailable. Please try again later.</p>
                     <button onClick={runFinancialAnalysis} className="mt-6 px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                        Retry Analysis
                    </button>
                </div>
            );
        }

        if (analysis) {
            return (
                <div className="space-y-8 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-slate-200 rounded-2xl shadow-digital p-6">
                        <div className="md:col-span-1 flex justify-center">
                            <FinancialScoreGauge score={analysis.financialScore} />
                        </div>
                        <div className="md:col-span-2">
                             <h3 className="text-lg font-bold text-slate-800">Your Financial Wellness Report</h3>
                            <p className="text-sm text-slate-600 mt-1">{analysis.overallSummary}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><LightBulbIcon className="w-6 h-6 mr-2 text-yellow-500"/> Key Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.insights.map((insight, i) => (
                                <div key={i} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                                    <p className="font-semibold text-slate-700">{insight.category}</p>
                                    <p className="text-sm text-slate-600">{insight.insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><TrendingUpIcon className="w-6 h-6 mr-2 text-green-500"/> Recommendations</h3>
                         <div className="space-y-4">
                            {analysis.recommendations.map((rec, i) => (
                                <div key={i} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-700">{rec.suggestedAction}</p>
                                        <p className="text-sm text-slate-600">{rec.reason}</p>
                                    </div>
                                    <button onClick={() => setActiveView(rec.linkTo)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md ml-4 flex-shrink-0">
                                        Explore
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="text-center p-12 bg-slate-200 rounded-2xl shadow-digital">
                <SparklesIcon className="w-16 h-16 text-primary mx-auto" />
                <h3 className="mt-4 text-2xl font-bold text-slate-800">Unlock Your Financial Potential</h3>
                <p className="text-slate-600 mt-2 max-w-lg mx-auto">Get a personalized financial wellness report powered by AI. We'll analyze your spending, saving, and investment habits to provide actionable insights and recommendations.</p>
                <button onClick={runFinancialAnalysis} className="mt-8 px-8 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105">
                    Analyze My Finances
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">AI Financial Advisor</h2>
                <p className="text-sm text-slate-500 mt-1">Your personalized guide to financial wellness.</p>
            </div>
            {renderContent()}
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};