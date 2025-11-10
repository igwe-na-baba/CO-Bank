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

    const handleSubmitSms = () => {
        setError('');
        if (otp !== '123456') { // Demo OTP
            setError('Invalid verification code.');
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            onUpdate({ enabled: true, method: 'sms' });
            setIsProcessing(false);
            setStep('success');
        }, 1000);
    };

    const handleEnableApp = () => {
        setStep('setup_app');
    };

    const handleDisable = () => {
        setIsProcessing(true);
        setTimeout(() => {
            onUpdate({ enabled: false, method: null });
            setIsProcessing(false);
            setStep('manage'); // Go back to manage screen
        }, 1000);
    };
    
    const handleFinish = () => {
        onClose();
    };

    const renderContent = () => {
        switch (step) {
            case 'manage':
                return (
                    <div className="space-y-4">
                        {settings.enabled ? (
                            <div className="text-center">
                                <p className="text-slate-600">Two-Factor Authentication is currently <strong className="text-green-600">ENABLED</strong> using {settings.method?.toUpperCase()}.</p>
                                <button onClick={handleDisable} disabled={isProcessing} className="w-full mt-4 py-3 text-white bg-red-600 rounded-lg font-semibold shadow-md flex items-center justify-center">
                                     {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Disable 2FA'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-slate-600 text-center">Select a method to enable Two-Factor Authentication.</p>
                                <button onClick={handleEnableSms} className="w-full flex items-center space-x-3 p-4 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                                    <DevicePhoneMobileIcon className="w-6 h-6 text-primary" />
                                    <div>
                                        <p className="font-semibold text-slate-700">SMS Verification</p>
                                        <p className="text-xs text-slate-500">Receive codes via text message.</p>
                                    </div>
                                </button>
                                <button onClick={handleEnableApp} className="w-full flex items-center space-x-3 p-4 bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset">
                                    <KeypadIcon className="w-6 h-6 text-primary" />
                                     <div>
                                        <p className="font-semibold text-slate-700">Authenticator App</p>
                                        <p className="text-xs text-slate-500">Use an app like Google Authenticator.</p>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>
                );
            case 'verify_sms':
                return (
                    <div className="text-center">
                         <h4 className="font-semibold text-slate-700">Verify SMS</h4>
                         <p className="text-sm text-slate-600 my-4">Enter the 6-digit code sent to {phone}.</p>
                         <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="w-48 mx-auto p-3 text-center text-3xl tracking-[1em] rounded-md shadow-digital-inset" placeholder="------" autoFocus />
                         {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                         <div className="mt-6 flex gap-3">
                             <button onClick={() => setStep('manage')} disabled={isProcessing} className="w-full py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                            <button onClick={handleSubmitSms} disabled={isProcessing || otp.length !== 6} className="w-full py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center disabled:bg-primary/50">
                                {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Verify & Enable'}
                            </button>
                        </div>
                    </div>
                );
            case 'setup_app':
                 return (
                    <div className="text-center">
                         <h4 className="font-semibold text-slate-700">Setup Authenticator App</h4>
                         <p className="text-sm text-slate-600 my-4">Scan this QR code with your authenticator app, then enter the code to verify.</p>
                         <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-inner mx-auto flex items-center justify-center">
                            <img src="https://quickchart.io/qr?text=otpauth://totp/iCreditUnion:randy.m.chitwood?secret=JBSWY3DPEHPK3PXP&issuer=iCreditUnion" alt="QR Code"/>
                         </div>
                          {/* OTP input and verification would go here */}
                         <button onClick={() => setStep('manage')} className="w-full mt-6 py-3 text-slate-700 bg-slate-200 rounded-lg font-semibold shadow-digital">Back</button>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-800">2FA Enabled!</h3>
                        <p className="text-slate-600 mt-2">Your account is now more secure.</p>
                        <button onClick={handleFinish} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">
                            Done
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
                        <DevicePhoneMobileIcon className="w-8 h-8 text-primary"/>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Two-Factor Authentication</h2>
                </div>
                {renderContent()}
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
