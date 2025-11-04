import React, { useState } from 'react';
import { SpinnerIcon, FingerprintIcon, CheckCircleIcon, ExclamationTriangleIcon } from './Icons';

interface SetupBiometricsModalProps {
    onClose: () => void;
    onEnable: () => void;
}

type Step = 'info' | 'processing' | 'success' | 'error';

export const SetupBiometricsModal: React.FC<SetupBiometricsModalProps> = ({ onClose, onEnable }) => {
    const [step, setStep] = useState<Step>('info');
    const [error, setError] = useState('');

    const handleEnable = async () => {
        setStep('processing');
        setError('');
        try {
            // In a real app, challenge and user ID would come from the server
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);
            
            const userId = new Uint8Array(16);
            window.crypto.getRandomValues(userId);

            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: 'iCredit Union®',
                },
                user: {
                    id: userId,
                    name: 'randy.m.chitwood@icreditunion.com',
                    displayName: 'Randy M. Chitwood',
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }], // ES256
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    requireResidentKey: true,
                    userVerification: 'required',
                },
                timeout: 60000,
                attestation: 'direct',
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            });

            console.log('Biometric credential created:', credential);
            
            setStep('success');

        } catch (err: any) {
            console.error('Biometric setup error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Registration was cancelled or timed out.');
            } else {
                setError('Could not set up biometrics. Your device may not support it or an error occurred.');
            }
            setStep('error');
        }
    };
    
    const handleFinish = () => {
        onEnable();
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'info':
                return (
                    <>
                        <p className="text-sm text-slate-600 mb-4">Enable biometric authentication to sign in faster and more securely using your device's Face ID or fingerprint scanner.</p>
                        <p className="text-xs text-slate-500 mb-6">This will register this device for biometric login. Your biometric data never leaves your device.</p>
                        <button onClick={handleEnable} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Enable Biometric Login
                        </button>
                    </>
                );
            case 'processing':
                return (
                    <div className="text-center">
                        <SpinnerIcon className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800">Follow your browser's prompt</h3>
                        <p className="text-sm text-slate-600 mt-2">Please use your fingerprint or face to confirm.</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800">Biometrics Enabled!</h3>
                        <p className="text-sm text-slate-600 mt-2">You can now use biometrics to log in on this device.</p>
                        <button onClick={handleFinish} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-800">Setup Failed</h3>
                        <p className="text-sm text-slate-600 mt-2">{error}</p>
                        <button onClick={() => setStep('info')} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Try Again
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        <FingerprintIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Setup Biometric Login</h2>
                </div>
                {renderContent()}
                {step === 'info' && (
                     <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
};