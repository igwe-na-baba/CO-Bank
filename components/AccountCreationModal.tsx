


import React, { useState, useEffect } from 'react';
import {
    SpinnerIcon,
    UserCircleIcon,
    HomeIcon,
    IdentificationIcon,
    LockClosedIcon,
    CheckCircleIcon,
// FIX: Renamed ApexBankLogo to ICreditUnionLogo to fix the import error.
    ICreditUnionLogo,
    DevicePhoneMobileIcon,
    CameraIcon,
    ArrowRightIcon,
} from './Icons';
import { ALL_COUNTRIES } from '../constants';
import { Country } from '../types';
import { AccountProvisioningAnimation } from './AccountProvisioningAnimation';
import { validatePassword, validatePhoneNumber } from '../utils/validation';
import { sendTransactionalEmail, sendSmsNotification, generateNewAccountOtpEmail, generateNewAccountOtpSms } from '../services/notificationService';

interface AccountCreationModalProps {
    onClose: () => void;
    onCreateAccountSuccess: (formData: any) => void;
}

const StepIndicator: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; isCompleted: boolean }> = ({ icon, label, isActive, isCompleted }) => (
    <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500 shadow-digital-inset'}`}>
            {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : icon}
        </div>
        <p className={`mt-2 text-xs text-center font-medium ${isActive || isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>{label}</p>
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
        country: ALL_COUNTRIES[0],
        password: '',
        confirmPassword: '',
        pin: '',
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [idFileName, setIdFileName] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
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
        // Handle post-provisioning steps
        if (step === 5) { // When provisioning animation starts
            // Simulate sending OTPs in the background
            const { subject, body } = generateNewAccountOtpEmail(formData.fullName);
            sendTransactionalEmail(formData.email, subject, body);
            sendSmsNotification(formData.phone, generateNewAccountOtpSms());
            
            // After animation, move to OTP step
            const timer = setTimeout(() => {
                setStep(6);
            }, 5000); // Corresponds to animation duration
            return () => clearTimeout(timer);
        }
    }, [step, formData.fullName, formData.email, formData.phone]);


    const steps = [
        { label: 'Personal Info', icon: <UserCircleIcon className="w-6 h-6" /> },
        { label: 'Address', icon: <HomeIcon className="w-6 h-6" /> },
        { label: 'Identity', icon: <IdentificationIcon className="w-6 h-6" /> },
        { label: 'Security', icon: <LockClosedIcon className="w-6 h-6" /> },
        { label: 'Review', icon: <CheckCircleIcon className="w-6 h-6" /> },
    ];
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = ALL_COUNTRIES.find(c => c.code === e.target.value);
        if (country) {
            setFormData(prev => ({ ...prev, country }));
        }
    };
    
    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIdFileName(file.name);
            setUploadProgress(0);
            
            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 150);
        }
    };

    const validateStep = () => {
        const newErrors: Record<string, string | null> = {};
        switch (step) {
            case 0: // Personal Info
                if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter your full name.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address.';
                const phoneError = validatePhoneNumber(formData.phone);
                if (phoneError) newErrors.phone = phoneError;
                break;
            case 1: // Address
                if (formData.address.trim().length < 5) newErrors.address = 'Please enter a valid street address.';
                if (formData.city.trim().length < 2) newErrors.city = 'Please enter a valid city.';
                if (formData.state.trim().length < 2) newErrors.state = 'Please enter a valid state/province.';
                if (formData.postalCode.trim().length < 3) newErrors.postalCode = 'Please enter a valid postal code.';
                break;
            case 2: // Identity
                if (!idFileName) newErrors.idFile = 'ID upload is required.';
                if (uploadProgress < 100) newErrors.idFile = 'Please wait for upload to complete.';
                break;
            case 3: // Security
                const criteriaMet = Object.values(passwordCriteria).every(Boolean);
                if (!criteriaMet) {
                    newErrors.password = 'Password does not meet all security requirements.';
                }
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
        if (otp === '123456') { // Simple validation for demo
            setErrors({});
            setStep(7); // Show success message
            setTimeout(() => {
                onCreateAccountSuccess(formData);
            }, 2000); // Wait on success screen before closing
        } else {
            setErrors({ otp: 'Invalid verification code.' });
        }
    };


    if (step === 5) {
        // onComplete is handled by the useEffect
        return <AccountProvisioningAnimation onComplete={() => {}} />;
    }
    
    const PasswordStrengthMeter: React.FC<{ criteria: { [key: string]: boolean } }> = ({ criteria }) => {
        const score = Object.values(criteria).filter(Boolean).length;
        
        const getStrength = () => {
            if (formData.password.length === 0) return { width: '0%', color: 'bg-slate-300', label: '', labelColor: 'text-transparent' };
            if (score <= 2) return { width: '20%', color: 'bg-red-500', label: 'Weak', labelColor: 'text-red-500' };
            if (score <= 3) return { width: '50%', color: 'bg-yellow-500', label: 'Medium', labelColor: 'text-yellow-500' };
            if (score === 4) return { width: '75%', color: 'bg-lime-500', label: 'Good', labelColor: 'text-lime-500' };
            if (score === 5) return { width: '100%', color: 'bg-green-500', label: 'Strong', labelColor: 'text-green-500' };
            return { width: '0%', color: 'bg-slate-300', label: '', labelColor: 'text-transparent' };
        };
    
        const { width, color, label, labelColor } = getStrength();
    
        return (
            <div className="mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-300 rounded-full h-2 shadow-inner flex-grow">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${color}`} 
                            style={{ width: width }}
                        ></div>
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
                    <div key={c.label} className={`flex items-center transition-colors ${c.met ? 'text-green-600' : 'text-slate-500'}`}>
                        <CheckCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span>{c.label}</span>
                    </div>
                ))}
            </div>
        );
    };


    const renderStepContent = () => {
        const inputBaseClasses = "mt-1 w-full bg-white/50 border border-slate-300/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-transparent p-3 rounded-md transition-colors";
        const errorRingClass = "ring-2 ring-red-500";
        const focusRingClass = "focus:ring-2 focus:ring-primary";

        switch (step) {
            case 0: // Personal Info
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`${inputBaseClasses} ${errors.fullName ? errorRingClass : focusRingClass}`} />
                            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputBaseClasses} ${errors.email ? errorRingClass : focusRingClass}`} />
                             {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`${inputBaseClasses} ${errors.phone ? errorRingClass : focusRingClass}`} placeholder="+15551234567" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>
                );
            case 1: // Address
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Home Address</h3>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Street Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className={`${inputBaseClasses} ${errors.address ? errorRingClass : focusRingClass}`} />
                             {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} className={`${inputBaseClasses} ${errors.city ? errorRingClass : focusRingClass}`} />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">State / Province</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} className={`${inputBaseClasses} ${errors.state ? errorRingClass : focusRingClass}`} />
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Postal / ZIP Code</label>
                                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={`${inputBaseClasses} ${errors.postalCode ? errorRingClass : focusRingClass}`} />
                                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Country</label>
                                <select name="country" value={formData.country.code} onChange={handleCountryChange} className={`${inputBaseClasses} ${focusRingClass}`}>
                                    {ALL_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                );
             case 2: // Identity
                return (
                     <div className="space-y-4 text-center">
                        <h3 className="text-xl font-bold text-slate-800">Identity Verification</h3>
                        <p className="text-sm text-slate-600">To comply with financial regulations and keep your account secure, please upload a government-issued photo ID (e.g., Passport, Driver's License).</p>
                        <div className="p-4 rounded-lg shadow-digital-inset border-2 border-dashed border-slate-300">
                           <input type="file" id="id-upload" className="hidden" onChange={handleIdUpload} accept="image/png, image/jpeg, application/pdf" />
                           <label htmlFor="id-upload" className="cursor-pointer font-medium text-primary hover:underline">
                                {idFileName ? 'Change file...' : 'Choose a file to upload...'}
                           </label>
                           {idFileName && (
                               <div className="mt-3">
                                   <p className="text-sm text-slate-700 font-medium truncate">{idFileName}</p>
                                   <div className="w-full bg-slate-300 rounded-full h-2.5 mt-2">
                                       <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                                   </div>
                                   <p className="text-xs text-slate-500 mt-1">{uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload Complete!'}</p>
                               </div>
                           )}
                        </div>
                        {errors.idFile && <p className="text-red-500 text-xs mt-1">{errors.idFile}</p>}
                    </div>
                );
            case 3: // Security
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Account Security</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className={`${inputBaseClasses} ${errors.password ? errorRingClass : focusRingClass}`} />
                            <PasswordStrengthMeter criteria={passwordCriteria} />
                            <PasswordCriteriaList />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`${inputBaseClasses} ${errors.confirmPassword ? errorRingClass : focusRingClass}`} />
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">4-Digit Security PIN</label>
                            <input type="password" name="pin" value={formData.pin} onChange={e => setFormData(prev => ({...prev, pin: e.target.value.replace(/\D/g, '').slice(0, 4)}))} maxLength={4} className={`${inputBaseClasses} text-center tracking-[1em] ${errors.pin ? errorRingClass : focusRingClass}`} placeholder="----" />
                            {errors.pin && <p className="text-red-500 text-xs mt-1">{errors.pin}</p>}
                        </div>
                    </div>
                );
            case 4: // Review
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Review & Confirm</h3>
                        <div className="p-4 rounded-lg shadow-digital-inset space-y-2 text-sm">
                            <p><strong>Name:</strong> {formData.fullName}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>Address:</strong> {`${formData.address}, ${formData.city}, ${formData.state} ${formData.postalCode}, ${formData.country.name}`}</p>
                        </div>
                        <div className="flex