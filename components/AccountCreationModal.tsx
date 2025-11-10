

import React, { useState, useEffect } from 'react';
import {
    UserCircleIcon,
    HomeIcon,
    IdentificationIcon,
    LockClosedIcon,
    CheckCircleIcon,
    ICreditUnionLogo,
    DevicePhoneMobileIcon,
    ArrowRightIcon,
} from './Icons';
import { ALL_COUNTRIES } from '../constants';
import { Country } from '../types';
import { AccountProvisioningAnimation } from './AccountProvisioningAnimation';
import { validatePassword, validatePhoneNumber } from '../utils/validation';
import { sendTransactionalEmail, sendSmsNotification, generateNewAccountOtpEmail, generateNewAccountOtpSms } from '../services/notificationService';
import { CountrySelector } from './CountrySelector';
import { PasswordGenerator } from './PasswordGenerator';

interface AccountCreationModalProps {
    onClose: () => void;
    onCreateAccountSuccess: (formData: any) => void;
}

const StepIndicator: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; isCompleted: boolean }> = ({ icon, label, isActive, isCompleted }) => (
    <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400'}`}>
            {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : icon}
        </div>
        <p className={`mt-2 text-xs text-center font-medium ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>{label}</p>
    </div>
);


export const AccountCreationModal: React.FC<AccountCreationModalProps> = ({ onClose, onCreateAccountSuccess }) => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ALL_COUNTRIES.find(c => c.code === 'US')!,
        password: '',
        confirmPassword: '',
        pin: '',
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [idFrontCaptured, setIdFrontCaptured] = useState(false);
    const [idBackCaptured, setIdBackCaptured] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });
    const [otp, setOtp] = useState('');

    useEffect(() => {
        setPasswordCriteria(validatePassword(formData.password));
    }, [formData.password]);
    
    useEffect(() => {
        if (step === 5) { 
            const { subject, body } = generateNewAccountOtpEmail(formData.fullName);
            sendTransactionalEmail(formData.email, subject, body);
            sendSmsNotification(formData.phone, generateNewAccountOtpSms());
            
            const timer = setTimeout(() => {
                setStep(6);
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [step, formData.fullName, formData.email, formData.phone]);

    const steps = [
        { label: 'Personal', icon: <UserCircleIcon className="w-6 h-6" /> },
        { label: 'Address', icon: <HomeIcon className="w-6 h-6" /> },
        { label: 'Identity', icon: <IdentificationIcon className="w-6 h-6" /> },
        { label: 'Security', icon: <LockClosedIcon className="w-6 h-6" /> },
        { label: 'Review', icon: <CheckCircleIcon className="w-6 h-6" /> },
    ];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const handleCountryChange = (country: Country) => {
        setFormData(prev => ({ ...prev, country }));
    };

    const handleGeneratedPassword = (password: string) => {
        setFormData(prev => ({
            ...prev,
            password: password,
            confirmPassword: password,
        }));
    };

    const validateStep = () => {
        const newErrors: Record<string, string | null> = {};
        switch (step) {
            case 0: // Personal
                if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter your full name.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address.';
                const phoneError = validatePhoneNumber(formData.phone);
                if (phoneError) newErrors.phone = phoneError;
                break;
            case 1: // Address
                if (formData.address.trim().length < 5) newErrors.address = 'Please enter a valid address.';
                if (formData.city.trim().length < 2) newErrors.city = 'Please enter a valid city.';
                if (formData.state.trim().length < 2) newErrors.state = 'Please enter a valid state/province.';
                if (formData.postalCode.trim().length < 3) newErrors.postalCode = 'Please enter a valid postal code.';
                break;
            case 2: // Identity
                if (!idFrontCaptured || !idBackCaptured) newErrors.idFile = 'Please capture both sides of your ID.';
                break;
            case 3: // Security
                const criteriaMet = Object.values(passwordCriteria).every(Boolean);
                if (!criteriaMet) newErrors.password = 'Password does not meet all security requirements.';
                if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
                if (!/^\d{4}$/.test(formData.pin)) newErrors.pin = 'PIN must be exactly 4 digits.';
                break;
            case 4: // Review
                if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the terms.';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep()) {
            setStep(5); // Start provisioning
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === '123456') {
            setErrors({});
            setStep(7); 
            setTimeout(() => {
                onCreateAccountSuccess(formData);
            }, 2000); 
        } else {
            setErrors({ otp: 'Invalid verification code.' });
        }
    };


    if (step === 5) {
        return <AccountProvisioningAnimation onComplete={() => {}} />;
    }
    
    const PasswordStrengthMeter: React.FC<{ criteria: { [key: string]: boolean } }> = ({ criteria }) => {
        const score = Object.values(criteria).filter(Boolean).length;
        const getStrength = () => {
            if (formData.password.length === 0) return { width: '0%', color: 'bg-slate-500', label: '', labelColor: 'text-transparent' };
            if (score <= 2) return { width: '20%', color: 'bg-red-500', label: 'Weak', labelColor: 'text-red-400' };
            if (score <= 3) return { width: '50%', color: 'bg-yellow-500', label: 'Medium', labelColor: 'text-yellow-400' };
            if (score === 4) return { width: '75%', color: 'bg-lime-500', label: 'Good', labelColor: 'text-lime-400' };
            if (score === 5) return { width: '100%', color: 'bg-green-500', label: 'Strong', labelColor: 'text-green-400' };
            return { width: '0%', color: 'bg-slate-500', label: '', labelColor: 'text-transparent' };
        };
        const { width, color, label, labelColor } = getStrength();
        return (
            <div className="mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-700 rounded-full h-2 flex-grow">
                        <div className={`h-2 rounded-full transition-all duration-300 ${color}`} style={{ width }} />
                    </div>
                    <p className={`text-xs font-semibold flex-shrink-0 w-14 text-right ${labelColor}`}>{label}</p>
                </div>
            </div>
        );
    };

    const PasswordCriteriaList = () => {
        const criteria = [
            { label: 'At least 8 characters', met: passwordCriteria.minLength },
            { label: 'One uppercase letter', met: passwordCriteria.hasUppercase },
            { label: 'One lowercase letter', met: passwordCriteria.hasLowercase },
            { label: 'One number', met: passwordCriteria.hasNumber },
            { label: 'One special character', met: passwordCriteria.hasSpecialChar },
        ];
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                {criteria.map(c => (
                    <div key={c.label} className={`flex items-center transition-colors ${c.met ? 'text-green-400' : 'text-slate-400'}`}>
                        <CheckCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>{c.label}</span>
                    </div>
                ))}
            </div>
        );
    };

    const IDCapture: React.FC<{ title: string, captured: boolean, onCapture: () => void }> = ({ title, captured, onCapture }) => (
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-slate-300 mb-2">{title}</h4>
            <div className="w-full aspect-video bg-slate-900 rounded-md flex items-center justify-center text-slate-500 text-sm mb-3 relative overflow-hidden">
                {captured ? <CheckCircleIcon className="w-16 h-16 text-green-500" /> : <p>Simulated Camera View</p>}
                 {!captured && <div className="absolute inset-2 border-2 border-dashed border-white/30 rounded-md"></div>}
            </div>
             <button type="button" onClick={onCapture} disabled={captured} className="w-full py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md disabled:bg-green-600 disabled:cursor-not-allowed">
                {captured ? 'Captured' : 'Simulate Capture'}
            </button>
        </div>
    );

    const renderStepContent = () => {
        const inputBaseClasses = "mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none p-3 rounded-md transition-colors";
        const errorRingClass = "ring-2 ring-red-500";
        const focusRingClass = "focus:ring-2 focus:ring-primary";

        switch (step) {
            case 0: // Personal
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-100">Let's start with your details</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`${inputBaseClasses} ${errors.fullName ? errorRingClass : focusRingClass}`} />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputBaseClasses} ${errors.email ? errorRingClass : focusRingClass}`} />
                             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`${inputBaseClasses} ${errors.phone ? errorRingClass : focusRingClass}`} placeholder="+15551234567" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                );
            case 1: // Address
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-100">Where do you live?</h3>
                         <div>
                            <label className="block text-sm font-medium text-slate-300">Street Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className={`${inputBaseClasses} ${errors.address ? errorRingClass : focusRingClass}`} />
                             {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className={`${inputBaseClasses} ${errors.city ? errorRingClass : focusRingClass}`} />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300">State / Province</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className={`${inputBaseClasses} ${errors.state ? errorRingClass : focusRingClass}`} />
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Postal / ZIP Code</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={`${inputBaseClasses} ${errors.postalCode ? errorRingClass : focusRingClass}`} />
                                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Country</label>
                                <CountrySelector 
                                    selectedCountry={formData.country}
                                    onSelect={handleCountryChange}
                                    className="w-full flex items-center justify-between bg-slate-700/50 border border-slate-600 text-slate-100 p-3 rounded-md mt-1"
                                />
                            </div>
                        </div>
                    </div>
                );
             case 2: // Identity
                return (
                     <div className="space-y-4 text-center animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-100">Identity Verification</h3>
                        <p className="text-sm text-slate-400">Please capture both the front and back of your government-issued photo ID.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <IDCapture title="Front of ID" captured={idFrontCaptured} onCapture={() => setIdFrontCaptured(true)} />
                            <IDCapture title="Back of ID" captured={idBackCaptured} onCapture={() => setIdBackCaptured(true)} />
                        </div>
                        {errors.idFile && <p className="text-red-500 text-xs mt-1">{errors.idFile}</p>}
                    </div>
                );
            case 3: // Security
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-100">Create Your Credentials</h3>
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-300">Password</label>
                                <button type="button" onClick={() => setShowGenerator(prev => !prev)} className="text-xs font-semibold text-primary-400 hover:underline">
                                  {showGenerator ? 'Hide Generator' : 'Generate Strong Password'}
                                </button>
                            </div>
                            {showGenerator && <PasswordGenerator onPasswordGenerated={handleGeneratedPassword} />}
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className={`${inputBaseClasses} ${errors.password ? errorRingClass : focusRingClass}`} />
                            <PasswordStrengthMeter criteria={passwordCriteria} />
                            <PasswordCriteriaList />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`${inputBaseClasses} ${errors.confirmPassword ? errorRingClass : focusRingClass}`} />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-300">4-Digit Security PIN</label>
                            <input type="password" name="pin" value={formData.pin} onChange={e => setFormData(prev => ({...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4)}))} maxLength={4} className={`${inputBaseClasses} text-center tracking-[1em] ${errors.pin ? errorRingClass : focusRingClass}`} placeholder="----" />
                            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
                        </div>
                    </div>
                );
            case 4: // Review
                return (
                    <div className="space-y-4 animate-fade-in-up">
                        <h3 className="text-xl font-bold text-slate-100">Review & Confirm</h3>
                        <div className="p-4 rounded-lg bg-slate-800/50 shadow-inner space-y-2 text-sm">
                            <p><strong>Name:</strong> {formData.fullName}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>Address:</strong> {`${formData.address}, ${formData.city}, ${formData.state} ${formData.postalCode}, ${formData.country.name}`}</p>
                        </div>
                        <div className="flex items-start">
                            <input type="checkbox" id="terms" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="h-4 w-4 rounded mt-1" />
                            <label htmlFor="terms" className="ml-2 text-sm text-slate-300">I agree to the iCredit Union® <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.</label>
                        </div>
                         {errors.agreedToTerms && <p className="text-red-500 text-xs">{errors.agreedToTerms}</p>}
                    </div>
                );
            case 6: // OTP
                return (
                    <div className="text-center animate-fade-in-up">
                        <DevicePhoneMobileIcon className="w-12 h-12 text-primary mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-slate-100">Final Verification</h3>
                        <p className="text-sm text-slate-400 my-4">Enter the 6-digit code sent to your phone and email to finalize your account setup.</p>
                        <form onSubmit={handleOtpSubmit}>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className={`w-48 mx-auto bg-slate-700/50 border border-slate-600 p-3 text-center text-3xl tracking-[.75em] rounded-md transition-colors focus:bg-slate-700 focus:outline-none ${errors.otp ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'}`}
                                maxLength={6}
                                placeholder="------"
                                autoFocus
                            />
                            {errors.otp && <p className="text-red-500 text-xs mt-2">{errors.otp}</p>}
                            <button type="submit" className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md">Verify & Complete</button>
                        </form>
                    </div>
                );
            case 7: // Success
                return (
                    <div className="text-center animate-fade-in-up">
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto" />
                        <h3 className="mt-4 text-2xl font-bold text-slate-100">Verification Completed</h3>
                        <p className="text-slate-300 mt-2">Your account has been authorized. Redirecting you to the dashboard...</p>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                    <div className="inline-block p-2 rounded-full bg-slate-700/50">
                        <ICreditUnionLogo />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 mt-2">Create Your iCredit Union® Account</h2>
                </div>
                
                {step < 5 && (
                    <div className="mb-8 px-4">
                        <div className="flex justify-between items-start">
                            {steps.map((s, index) => (
                                <React.Fragment key={s.label}>
                                    <StepIndicator icon={s.icon} label={s.label} isActive={step === index} isCompleted={step > index} />
                                    {index < steps.length - 1 && <div className={`flex-1 h-0.5 mt-6 transition-colors duration-300 mx-2 ${step > index ? 'bg-green-500' : 'bg-slate-600'}`}></div>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}
                <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-digital p-8">
                    <div className="min-h-[350px]">
                        {renderStepContent()}
                    </div>
                     {step < 5 && (
                        <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between">
                            {/* FIX: Replaced onBackToLogin with onClose as it's the available prop for this modal. */}
                            <button onClick={step === 0 ? onClose : handleBack} className="px-6 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg">
                               {step === 0 ? 'Back to Login' : 'Back'}
                            </button>
                            {step < steps.length - 1 ? (
                                <button onClick={handleNext} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg flex items-center space-x-2">
                                    <span>Next</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={handleSubmit} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:shadow-lg">
                                    Finish & Create Account
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};