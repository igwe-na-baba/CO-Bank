import React, { useState } from 'react';
import { SpinnerIcon, DevicePhoneMobileIcon, CheckCircleIcon, KeypadIcon, XIcon } from './Icons';
import { SecuritySettings } from '../types';

interface Setup2FAModalProps {
    onClose: () => void;
    settings: SecuritySettings['mfa'];
    onUpdate: (update: Partial<SecuritySettings['mfa']>) => void;
}

type Step = 'manage' | 'setup_sms' | 'verify_sms' | 'setup_app' | 'success';

export const Setup2FAModal: React.FC<Setup2FAModalProps> = ({ onClose, settings, onUpdate }) => {
    const [step, setStep] = useState<Step>('manage');
    const [otp, setOtp] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const phone = '+1 (***) ***-1234'; // Masked phone number for display

    const handleEnableSms = () => {
        setIsProcessing(true);
        // Simulate sending SMS
        setTimeout(() => {
            setIsProcessing(false);
            setStep('verify_sms');
        }, 1000);
    };

    const handleVerifySms = () => {
        setError('');
        setIsProcessing(true);
        setTimeout(() => {
            if (otp.length === 6) { // Demo check
                onUpdate({ enabled: true, method: 'sms' });
                setIsProcessing(false);
                setStep('success');
            } else {
                setError('Invalid code. Please enter the 6-digit code.');
                setIsProcessing(false);
            }
        }, 1000);
    };

    const handleDisable = () => {
        onUpdate({ enabled: false, method: null });
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'manage':
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">Select your preferred method for Two-Factor Authentication. This adds an extra layer of security to your account.</p>
                        
                        <button onClick={() => setStep('setup_sms')} className={`w-full text-left p-4 rounded-lg transition-all ${settings.method === 'sms' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">SMS Verification</span>
                                {settings.method === 'sms' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                            </div>
                        </button>
                        
                        <button onClick={() => setStep('setup_app')} className={`w-full text-left p-4 rounded-lg transition-all ${settings.method === 'app' ? 'shadow-digital-inset' : 'shadow-digital'}`}>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-800">Authenticator App</span>
                                {settings.method === 'app' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                            </div>
                        </button>

                        {settings.enabled && (
                             <button onClick={handleDisable} className="w-full mt-6 py-2 text-red-600 font-semibold">
                                Disable Two-Factor Authentication
                            </button>
                        )}
                    </div>
                );
            case 'setup_sms':
                return (
                    <div>
                        <button onClick={() => setStep('manage')} className="text-sm font-semibold text-primary mb-4">&larr; Back to methods</button>
                        <p className="text-sm text-slate-600 mb-4">We will send a 6-digit verification code to your registered phone number: <strong>{phone}</strong>.</p>
                        <button onClick={handleEnableSms} disabled={isProcessing} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center">
                            {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Send Verification Code'}
                        </button>
                    </div>
                );
            case 'verify_sms':
                return (
                    <div>
                        <button onClick={() => setStep('setup_sms')} className="text-sm font-semibold text-primary mb-4">&larr; Back</button>
                        <p className="text-sm text-slate-600 mb-4">Enter the 6-digit code sent to {phone}.</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-48 mx-auto bg-slate-200 border-0 p-3 text-center text-3xl tracking-[.75em] rounded-md shadow-digital-inset"
                            maxLength={6}
                            placeholder="------"
                            autoFocus
                        />
                         {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                        <button onClick={handleVerifySms} disabled={isProcessing} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center">
                             {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Verify & Enable'}
                        </button>
                    </div>
                );
            case 'setup_app':
                return (
                     <div>
                        <button onClick={() => setStep('manage')} className="text-sm font-semibold text-primary mb-4">&larr; Back to methods</button>
                        <p className="text-sm text-slate-600 mb-4">1. Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).</p>
                        <div className="p-4 bg-white rounded-lg shadow-digital-inset w-40 h-40 mx-auto flex items-center justify-center">
                            {/* Placeholder for QR Code */}
                             <p className="text-xs text-slate-500">QR Code</p>
                        </div>
                        <p className="text-sm text-slate-600 my-4">2. Enter the 6-digit code from your app to verify.</p>
                        <button onClick={() => onUpdate({ enabled: true, method: 'app' })} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Verify & Enable (Demo)</button>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">2FA Enabled!</h3>
                        <p className="text-slate-600 mt-2">Your account is now protected with Two-Factor Authentication.</p>
                        <button onClick={onClose} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
                        </button>
                    </div>
                );
        }
    };

    // FIX: Add the main modal return statement which was missing.
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative animate-fade-in-up">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4 shadow-digital">
                        {step === 'success' ? <CheckCircleIcon className="w-8 h-8 text-green-500"/> : <DevicePhoneMobileIcon className="w-8 h-8 text-primary"/>}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Two-Factor Authentication</h2>
                </div>
                {renderContent()}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full">
                    <XIcon className="w-6 h-6"/>
                </button>
            </div>
        </div>
    );
};