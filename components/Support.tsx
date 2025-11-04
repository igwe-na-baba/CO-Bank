import React, { useState, useEffect, FormEvent } from 'react';
import { SystemUpdate } from '../types';
import { getSystemUpdates, getSupportAnswer } from '../services/geminiService';
import { SearchIcon, SpinnerIcon, InfoIcon, SparklesIcon, CheckCircleIcon, LightBulbIcon, UserCircleIcon, ArrowsRightLeftIcon, ShieldCheckIcon, CreditCardIcon } from './Icons';

const SystemUpdateCard: React.FC<{ update: SystemUpdate }> = ({ update }) => {
    const categoryStyles = {
        'New Feature': 'bg-blue-100 text-blue-800',
        'Improvement': 'bg-green-100 text-green-800',
        'Maintenance': 'bg-yellow-100 text-yellow-800',
    };
    return (
        <div className="p-4 rounded-lg shadow-digital-inset space-y-2">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800">{update.title}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryStyles[update.category]}`}>{update.category}</span>
            </div>
            <p className="text-sm text-slate-600">{update.description}</p>
            <p className="text-xs text-slate-400">{new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    );
};

const FormattedAnswer: React.FC<{ text: string }> = ({ text }) => {
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n\*/g, '\n•'); // Simple bullet points

    const paragraphs = formattedText.split('\n').map((paragraph, index) => {
        if (paragraph.startsWith('•')) {
            return (
                <li key={index} className="ml-5 list-disc">{paragraph.substring(1).trim()}</li>
            );
        }
        return paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />;
    });

    return <div className="space-y-2 text-sm text-slate-700">{paragraphs}</div>;
};

const supportTopics = [
    { title: "My Account", icon: UserCircleIcon, query: "How do I update my profile?" },
    { title: "Transfers", icon: ArrowsRightLeftIcon, query: "What are the transfer limits?" },
    { title: "Security", icon: ShieldCheckIcon, query: "How to enable two-factor authentication?" },
    { title: "Cards & Payments", icon: CreditCardIcon, query: "How do I freeze my card?" },
];


export const Support: React.FC = () => {
    const [updates, setUpdates] = useState<SystemUpdate[]>([]);
    const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);
    const [updatesError, setUpdatesError] = useState(false);
    
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
    const [answerError, setAnswerError] = useState(false);

    useEffect(() => {
        const fetchUpdates = async () => {
            const { updates: fetchedUpdates, isError } = await getSystemUpdates();
            if (isError) {
                setUpdatesError(true);
            } else {
                setUpdates(fetchedUpdates);
            }
            setIsLoadingUpdates(false);
        };
        fetchUpdates();
    }, []);

    const handleSubmit = async (e: FormEvent, newQuery?: string) => {
        e.preventDefault();
        const currentQuery = newQuery || query;
        if (!currentQuery.trim()) return;

        setIsLoadingAnswer(true);
        setAnswer('');
        setAnswerError(false);
        setQuery(currentQuery);

        const { answer: newAnswer, isError } = await getSupportAnswer(currentQuery);
        if (isError) {
            setAnswerError(true);
        } else {
            setAnswer(newAnswer);
        }
        setIsLoadingAnswer(false);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Support Center</h2>
                <p className="text-sm text-slate-500 mt-1">Get instant answers from our AI assistant or browse system updates.</p>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><SparklesIcon className="w-6 h-6 text-primary mr-2" /> AI-Powered Support</h3>
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                    <div className="relative flex-grow">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-slate-200 p-3 pl-10 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button type="submit" disabled={isLoadingAnswer} className="px-4 py-3 bg-primary text-white rounded-lg shadow-md flex items-center justify-center disabled:bg-primary/50">
                        {isLoadingAnswer ? <SpinnerIcon className="w-5 h-5"/> : 'Ask'}
                    </button>
                </form>

                {(isLoadingAnswer || answer || answerError) && (
                    <div className="mt-4 p-4 bg-slate-200 rounded-lg shadow-digital-inset">
                        {isLoadingAnswer ? (
                            <div className="flex items-center space-x-3 text-slate-600">
                                <SpinnerIcon className="w-5 h-5 text-primary" />
                                <span>Finding the best answer for you...</span>
                            </div>
                        ) : answerError ? (
                            <div className="flex items-center space-x-3 text-yellow-700">
                                <InfoIcon className="w-5 h-5"/>
                                <span>Our AI assistant is currently unavailable. Please try again later.</span>
                            </div>
                        ) : (
                            <FormattedAnswer text={answer} />
                        )}
                    </div>
                )}
            </div>
            
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">Common Questions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {supportTopics.map(topic => {
                        const Icon = topic.icon;
                        return (
                             <button key={topic.title} onClick={(e) => handleSubmit(e, topic.query)} className="flex items-center space-x-3 p-3 text-left bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset hover:bg-slate-300/50 transition-colors">
                                <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                                <span className="font-semibold text-slate-700 text-sm">{topic.title}</span>
                            </button>
                        )
                    })}
                 </div>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300"><h3 className="text-xl font-bold text-slate-800">System Updates</h3></div>
                <div className="p-6">
                    {isLoadingUpdates ? (
                        <div className="flex justify-center"><SpinnerIcon className="w-8 h-8 text-primary" /></div>
                    ) : updatesError ? (
                        <div className="flex items-center space-x-3 text-yellow-700"><InfoIcon className="w-5 h-5"/><span>Could not load system updates.</span></div>
                    ) : (
                        <div className="space-y-4">
                            {updates.map(update => <SystemUpdateCard key={update.id} update={update} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
