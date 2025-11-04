import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startChatSession, translateWithGemini } from '../services/geminiService';
import { SendIcon, SpinnerIcon, XIcon, ChatBubbleLeftRightIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'model';
    text: string;
}

type ChatLanguage = 'en' | 'es' | 'fr';

const languageMap: Record<ChatLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French'
};

export const BankingChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatLanguage, setChatLanguage] = useState<ChatLanguage>('en');
    const { t } = useLanguage();

    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: t('chat_initial_message') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<ReturnType<typeof startChatSession> | null>(null);

    useEffect(() => {
        setMessages([{ role: 'model', text: t('chat_initial_message') }]);
    }, [t]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const getChat = () => {
        if (!chatRef.current) {
            chatRef.current = startChatSession();
        }
        return chatRef.current;
    }

    const handleSend = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const chat = getChat();
        const userMessageText = input;
        const userMessage: Message = { role: 'user', text: userMessageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // 1. Translate user input to English if necessary
            const inputForModel = chatLanguage === 'en'
                ? userMessageText
                : await translateWithGemini(userMessageText, 'English');

            // 2. Send to the model and get the full English response
            const stream = await chat.sendMessageStream({ message: inputForModel });
            
            let modelResponseEn = '';
            for await (const chunk of stream) {
                modelResponseEn += chunk.text;
            }

            // 3. Translate the full response back to the user's language if necessary
            const finalResponse = chatLanguage === 'en'
                ? modelResponseEn
                : await translateWithGemini(modelResponseEn, languageMap[chatLanguage]);

            setMessages(prev => [...prev, { role: 'model', text: finalResponse }]);

        } catch (error) {
            console.error("Error with chat stream:", error);
            const errorResponse = chatLanguage === 'en'
                ? 'Sorry, I encountered an error. Please try again.'
                : await translateWithGemini('Sorry, I encountered an error. Please try again.', languageMap[chatLanguage]);
            setMessages(prev => [...prev, { role: 'model', text: errorResponse }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, chatLanguage]);

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Open chat assistant"
                >
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                </button>
            </div>

            <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm h-full max-h-[70vh] bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">{t('chat_assistant_title')}</h3>
                        <div className="text-xs text-slate-400 flex items-center space-x-2">
                             <label htmlFor="chat-lang-select">{t('chat_language_select')}:</label>
                             <select 
                                id="chat-lang-select" 
                                value={chatLanguage} 
                                onChange={(e) => setChatLanguage(e.target.value as ChatLanguage)}
                                className="bg-transparent border-0 focus:ring-0 text-primary-300 p-0"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Messages */}
                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-800/50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">AI</div>}
                            <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">AI</div>
                            <div className="max-w-xs px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
                                <SpinnerIcon className="w-5 h-5 text-primary-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/10">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chat_placeholder')}
                            className="w-full bg-slate-700 border border-slate-600 p-3 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-primary-500 text-white rounded-lg shadow-md disabled:bg-primary-400/50" aria-label="Send message">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};