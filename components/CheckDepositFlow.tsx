import React, { useState, useRef } from 'react';
import { Account } from '../types';
import { SpinnerIcon, CameraIcon, CheckCircleIcon } from './Icons';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

interface CheckDepositFlowProps {
    accounts: Account[];
    onDepositCheck: (details: { amount: number, accountId: string, images: { front: string, back: string } }) => void;
}

const ImageUploader: React.FC<{
    label: string;
    onImageUpload: (base64: string) => void;
    image: string | null;
}> = ({ label, onImageUpload, image }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsAnalyzing(true);
            setIsAnalyzed(false);
            const base64 = await fileToBase64(file);
            // Simulate AI analysis
            setTimeout(() => {
                onImageUpload(base64);
                setIsAnalyzing(false);
                setIsAnalyzed(true);
            }, 1500);
        }
    };

    return (
        <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset">
            <input type="file" accept="image/*" ref={inputRef} onChange={handleFileChange} className="hidden" />
            <div className="flex items-center space-x-4">
                {image ? (
                    <img src={image} alt={`${label} preview`} className="w-20 h-12 object-cover rounded-md" />
                ) : (
                    <div className="w-20 h-12 bg-slate-300 rounded-md flex items-center justify-center">
                        <CameraIcon className="w-6 h-6 text-slate-500" />
                    </div>
                )}
                <div className="flex-1">
                    <p className="font-semibold text-slate-800">{label}</p>
                    <div className="flex items-center space-x-2 h-6">
                        {isAnalyzing && <><SpinnerIcon className="w-4 h-4 text-primary" /><span className="text-xs text-slate-500">Analyzing...</span></>}
                        {isAnalyzed && <><CheckCircleIcon className="w-5 h-5 text-green-500" /><span className="text-xs text-green-600 font-semibold">Ready</span></>}
                    </div>
                </div>
                {!isAnalyzed && (
                    <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                        Upload
                    </button>
                )}
            </div>
        </div>
    );
};


export const CheckDepositFlow: React.FC<CheckDepositFlowProps> = ({ accounts, onDepositCheck }) => {
    const [step, setStep] = useState(1); // 1: Details, 2: Images, 3: Review
    const [amount, setAmount] = useState('');
    const [accountId, setAccountId] = useState(accounts[0]?.id || '');
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleDetailsSubmit = () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setError('');
        setStep(2);
    };
    
    const handleImagesSubmit = () => {
        if (!frontImage || !backImage) {
             setError('Please upload both front and back images of the check.');
            return;
        }
        setError('');
        setStep(3);
    };
    
    const handleDeposit = () => {
        if (frontImage && backImage && accountId) {
            onDepositCheck({
                amount: parseFloat(amount),
                accountId,
                images: { front: frontImage, back: backImage }
            });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Deposit a Check</h2>
            
            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Check Amount</label>
                        <div className="mt-1 relative rounded-md shadow-digital-inset">
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-0 p-3" placeholder="0.00" autoFocus />
                        </div>
                         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Deposit To</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset">
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type}</option>)}
                        </select>
                    </div>
                    <button onClick={handleDetailsSubmit} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Continue</button>
                </div>
            )}
            
            {step === 2 && (
                 <div className="space-y-4">
                    <ImageUploader label="Front of Check" image={frontImage} onImageUpload={setFrontImage} />
                    <ImageUploader label="Back of Check" image={backImage} onImageUpload={setBackImage} />
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    <div className="flex space-x-3">
                        <button onClick={() => setStep(1)} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                        <button onClick={handleImagesSubmit} disabled={!frontImage || !backImage} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md disabled:bg-primary/50">Review Deposit</button>
                    </div>
                </div>
            )}
            
            {step === 3 && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Please review the details of your deposit.</p>
                     <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-3">
                         <div className="flex justify-between"><span className="text-slate-500">Amount:</span> <span className="font-bold font-mono text-slate-800">{parseFloat(amount).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">To Account:</span> <span className="font-semibold text-slate-800">{accounts.find(a=>a.id === accountId)?.nickname}</span></div>
                         <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                             <span className="text-slate-500">Check Images:</span>
                             <div className="flex space-x-2">
                                <img src={frontImage!} alt="Front of check" className="w-16 h-8 object-cover rounded"/>
                                <img src={backImage!} alt="Back of check" className="w-16 h-8 object-cover rounded"/>
                             </div>
                         </div>
                     </div>
                    <div className="flex space-x-3">
                        <button onClick={() => setStep(2)} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                        <button onClick={handleDeposit} className="w-full py-3 text-white bg-green-500 rounded-lg font-semibold shadow-md">Deposit Check</button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};