import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob, Chat } from "@google/genai";
import { Account, AccountType, Transaction, Recipient } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import * as Icons from './Icons';
import { timeSince } from '../utils/time';

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const languageMap: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French'
};

interface Transcript {
    role: 'user' | 'model';
    text: string;
}

interface LiveBankingAssistantProps {
    accounts: Account[];
    transactions: Transaction[];
    recipients: Recipient[];
    onInitiateTransfer: (recipientName: string, amount: number) => void;
}

const getToolDeclarations = (): FunctionDeclaration[] => [
    {
        name: 'get_account_balance',
        description: 'Get the current balance of a user\'s specified banking account.',
        parameters: {
            type: Type.OBJECT,
            properties: { account_type: { type: Type.STRING, description: 'The type of account, e.g., "checking" or "savings".' } },
            required: ['account_type']
        }
    },
    {
        name: 'get_last_transaction',
        description: "Get the details of the user's most recent transaction.",
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'initiate_transfer',
        description: "Initiates a money transfer to a specified recipient.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                recipient_name: { type: Type.STRING, description: "The full name of the recipient." },
                amount: { type: Type.NUMBER, description: "The amount of money to transfer." }
            },
            required: ['recipient_name', 'amount']
        }
    }
];


export const LiveBankingAssistant: React.FC<LiveBankingAssistantProps> = ({ accounts, transactions, recipients, onInitiateTransfer }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'text' | 'voice'>('text');
    const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'permission_denied'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [textInput, setTextInput] = useState('');
    const [isProcessingText, setIsProcessingText] = useState(false);
    
    const { language: appLanguage, setLanguage: setAppLanguage, t } = useLanguage();
    const [chatLanguage, setChatLanguage] = useState(appLanguage);

    const chatSessionRef = useRef<Chat | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    const outputSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [transcripts]);
    
    const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const executeFunctionCall = (name: string, args: any): string => {
        if (name === 'get_account_balance' && args.account_type) {
            const accountTypeStr = args.account_type.toLowerCase();
            let account: Account | undefined;
            if (accountTypeStr.includes('checking')) account = accounts.find(a => a.type === AccountType.CHECKING);
            else if (accountTypeStr.includes('savings')) account = accounts.find(a => a.type === AccountType.SAVINGS);
            return account ? `The balance is ${account.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.` : "I couldn't find that account type.";
        }
        if (name === 'get_last_transaction') {
            const lastTx = transactions[0];
            return lastTx ? `Your last transaction was for ${lastTx.sendAmount.toLocaleString('en-US', {style:'currency', currency: 'USD'})} to ${lastTx.recipient.fullName}, about ${timeSince(lastTx.statusTimestamps.Submitted)}.` : "You have no transaction history.";
        }
        if (name === 'initiate_transfer' && args.recipient_name && args.amount) {
            onInitiateTransfer(args.recipient_name, args.amount);
            return "OK, I've started the transfer for you. Please review the details on screen.";
        }
        return "I'm sorry, I couldn't perform that action.";
    };
    
    // --- Text Mode Logic ---
    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = textInput.trim();
        if (!text || isProcessingText) return;

        setTextInput('');
        setTranscripts(prev => [...prev, { role: 'user', text }]);
        setIsProcessingText(true);

        try {
            let response = await chatSessionRef.current!.sendMessage({ message: text });
            
            while(response.functionCalls && response.functionCalls.length > 0) {
                const functionResponses = [];
                for (const fc of response.functionCalls) {
                    const result = executeFunctionCall(fc.name, fc.args);
                    functionResponses.push({
                        functionResponse: { name: fc.name, response: { result } }
                    });
                }
                response = await chatSessionRef.current!.sendMessage({ parts: functionResponses });
            }

            setTranscripts(prev => [...prev, { role: 'model', text: response.text }]);

        } catch (error) {
            console.error("Chat API error:", error);
            setTranscripts(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsProcessingText(false);
        }
    };

    // --- Voice Mode Logic ---
    const stopVoiceSession = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        if (inputAudioContextRef.current?.state !== 'closed') inputAudioContextRef.current?.close();
        if (outputAudioContextRef.current?.state !== 'closed') outputAudioContextRef.current?.close();
        sessionPromiseRef.current = null;
        setLiveStatus('idle');
    }, []);

    const startVoiceSession = useCallback(async () => {
        setLiveStatus('connecting');
        const ai = getAi();
        
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        try {
            mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            console.error('Microphone access denied:', error);
            setLiveStatus('permission_denied');
            return;
        }

        const historyForVoice = transcripts.length > 2 ? `You were just having this text conversation: ${JSON.stringify(transcripts.slice(-4))}. Continue the conversation via voice.` : '';
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                systemInstruction: `You are a friendly banking assistant for iCredit Union®. Always respond in ${languageMap[chatLanguage]}. ${historyForVoice}`,
                tools: [{ functionDeclarations: getToolDeclarations() }],
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
            },
            callbacks: {
                onopen: () => {
                    setLiveStatus('listening');
                    mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const blob: Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((s) => s.sendRealtimeInput({ media: blob }));
                    };
                    mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const { turnComplete, inputTranscription, outputTranscription } = message.serverContent || {};

                    if (inputTranscription) setTranscripts(prev => updateLastTranscript(prev, 'user', inputTranscription.text));
                    if (outputTranscription) setTranscripts(prev => updateLastTranscript(prev, 'model', outputTranscription.text));
                    if (turnComplete) finalizeTranscripts();

                    if (message.toolCall?.functionCalls) {
                        for (const fc of message.toolCall.functionCalls) {
                            const result = executeFunctionCall(fc.name, fc.args);
                            sessionPromiseRef.current?.then(s => s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result } } }));
                        }
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        setLiveStatus('speaking');
                        const outputContext = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outputContext, 24000, 1);
                        const source = outputContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputContext.destination);
                        source.onended = () => {
                            outputSourcesRef.current.delete(source);
                            if (outputSourcesRef.current.size === 0) setLiveStatus('listening');
                        };
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        outputSourcesRef.current.add(source);
                    }
                },
                onerror: (e) => { console.error('Session error:', e); setLiveStatus('idle'); },
                onclose: () => { setLiveStatus('idle'); }
            }
        });
    }, [chatLanguage, onInitiateTransfer, accounts, transactions, transcripts]);

    // --- Transcript Helpers ---
    const lastUserTranscriptIndex = useRef(-1);
    const lastModelTranscriptIndex = useRef(-1);
    const updateLastTranscript = (prev: Transcript[], role: 'user' | 'model', textChunk: string) => {
        const lastIndexRef = role === 'user' ? lastUserTranscriptIndex : lastModelTranscriptIndex;
        if (lastIndexRef.current === -1 || prev[lastIndexRef.current]?.role !== role) {
            const newTranscript = { role, text: textChunk };
            const newTranscripts = [...prev, newTranscript];
            lastIndexRef.current = newTranscripts.length - 1;
            return newTranscripts;
        }
        const newTranscripts = [...prev];
        newTranscripts[lastIndexRef.current] = { ...newTranscripts[lastIndexRef.current], text: newTranscripts[lastIndexRef.current].text + textChunk };
        return newTranscripts;
    };
    const finalizeTranscripts = () => {
        lastUserTranscriptIndex.current = -1;
        lastModelTranscriptIndex.current = -1;
    };
    
    // --- Main Control Logic ---
    useEffect(() => {
        if (isOpen && mode === 'text') {
            const ai = getAi();
            
            // History must start with a user turn or be empty.
            // Find the first user turn to create a valid history for the new session.
            const firstUserTurnIndex = transcripts.findIndex(t => t.role === 'user');
            const validHistory = firstUserTurnIndex !== -1 ? transcripts.slice(firstUserTurnIndex) : [];
            const formattedHistory = validHistory.map(t => ({ role: t.role as 'user' | 'model', parts: [{ text: t.text }] }));
            
            chatSessionRef.current = ai.chats.create({
                history: formattedHistory,
                config: {
                    systemInstruction: `You are a friendly and professional banking assistant for iCredit Union®. Always respond in ${languageMap[chatLanguage]}.`,
                    tools: [{ functionDeclarations: getToolDeclarations() }]
                }
            });
            
            // If the chat is just opening (no history), set the initial greeting message.
            if (transcripts.length === 0) {
                setTranscripts([{ role: 'model', text: t('chat_initial_message') }]);
            }
        } else if (!isOpen) {
            // Cleanup when the entire component is closed
            stopVoiceSession();
            chatSessionRef.current = null;
            setTranscripts([]);
        }
    }, [isOpen, mode, chatLanguage, t, stopVoiceSession]);


    const toggleChat = () => setIsOpen(prev => !prev);

    const toggleMode = () => {
        if (mode === 'text') {
            setMode('voice');
            chatSessionRef.current = null; // Clear text session
            startVoiceSession();
        } else {
            setMode('text');
            stopVoiceSession();
            // The useEffect will now run because `mode` changed to 'text',
            // and it will initialize the text chat session.
        }
    };

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button onClick={toggleChat} className="w-16 h-16 bg-primary-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform chat-pulse" aria-label="Open chat assistant">
                    <Icons.ChatBubbleLeftRightIcon className="w-8 h-8" />
                </button>
            </div>

            <div className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full max-w-sm h-full sm:h-[80vh] bg-slate-900/80 backdrop-blur-xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/10 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="absolute inset-0 z-0 opacity-10 animate-grid-pan" style={{ backgroundImage: `linear-gradient(to right, rgb(var(--color-primary-500) / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-primary-500) / 0.2) 1px, transparent 1px)`, backgroundSize: '2rem 2rem' }}></div>
                
                <div className="relative z-10 flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                         <img src="https://i.postimg.cc/pTfCqSjN/IOe9-Qna.jpg" alt="Assistant" className="w-10 h-10 rounded-full object-cover"/>
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">{t('chat_assistant_title')}</h3>
                             <div className="text-xs text-slate-400 flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full transition-colors ${mode === 'voice' && (liveStatus === 'listening' || liveStatus === 'speaking') ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
                                <span>{mode === 'voice' ? (liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1)) : 'Online'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={toggleChat} className="p-1 rounded-full text-slate-400 hover:bg-white/10">
                        <Icons.XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative z-10 flex-grow p-4 flex flex-col overflow-y-auto chat-messages">
                    <div className="space-y-4">
                        {transcripts.map((t, i) => (
                            <div key={i} className={`flex items-end gap-2 ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {t.role === 'model' && <img src="https://i.postimg.cc/pTfCqSjN/IOe9-Qna.jpg" alt="Assistant" className="w-6 h-6 rounded-full"/>}
                                <div className={`max-w-[80%] p-3 rounded-2xl ${t.role === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                    <p className="text-sm">{t.text}</p>
                                </div>
                            </div>
                        ))}
                         {isProcessingText && (
                            <div className="flex items-end gap-2 justify-start">
                                 <img src="https://i.postimg.cc/pTfCqSjN/IOe9-Qna.jpg" alt="Assistant" className="w-6 h-6 rounded-full"/>
                                 <div className="p-3 bg-slate-700 rounded-2xl rounded-bl-none"><Icons.SpinnerIcon className="w-5 h-5 text-white" /></div>
                            </div>
                        )}
                    </div>
                     <div ref={messagesEndRef} />
                </div>
                
                {liveStatus === 'permission_denied' && (
                    <div className="relative z-10 p-4 text-center border-t border-white/10 bg-yellow-500/10">
                        <p className="text-sm font-semibold text-yellow-300">Microphone Access Denied</p>
                        <p className="text-xs text-yellow-400">Enable microphone permissions in your browser settings to use voice chat.</p>
                        <button onClick={startVoiceSession} className="mt-2 px-3 py-1 bg-primary text-white rounded-md text-sm font-semibold">Retry</button>
                    </div>
                )}
                
                <div className="relative z-10 flex-shrink-0 p-4 border-t border-white/10">
                   <form onSubmit={handleSendText} className="flex items-center space-x-2">
                       <input 
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={t('chat_placeholder')}
                            className="w-full bg-slate-700/50 text-slate-100 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none"
                       />
                        <button type="button" onClick={toggleMode} className={`relative flex-shrink-0 w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center text-white ${mode === 'voice' ? 'bg-red-500' : 'bg-primary-500'}`}>
                           {liveStatus === 'connecting' ? <Icons.SpinnerIcon className="w-6 h-6"/> : <Icons.PhoneIcon className="w-6 h-6"/>}
                        </button>
                   </form>
                </div>
            </div>
        </>
    );
};