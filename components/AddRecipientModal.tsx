import React, { useState, useEffect, useMemo } from 'react';
import { Country, Recipient } from '../types';
import { ALL_COUNTRIES, BANKS_BY_COUNTRY, BANK_ACCOUNT_CONFIG, COUNTRY_CALLING_CODES } from '../constants';
import { getCountryBankingTip, BankingTipResult } from '../services/geminiService';
import { sendSmsNotification, sendTransactionalEmail, generateOtpEmail, generateOtpSms } from '../services/notificationService';
import { InfoIcon, SpinnerIcon, ShieldCheckIcon, UserCircleIcon, HomeIcon, BankIcon, CheckCircleIcon, getBankIcon } from './Icons';
import { validatePhoneNumber } from '../utils/validation';
import { CountrySelector } from './CountrySelector';
import { BankSelector } from './BankSelector';

interface AddRecipientModalProps {
  onClose: () => void;
  onAddRecipient: (data: {
    fullName: string;
    nickname?: string;
    phone?: string;
    bankName: string;
    accountNumber: string;
    swiftBic: string;
    country: Country;
    cashPickupEnabled: boolean;
    streetAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
  }) => void;
  recipientToEdit?: Recipient | null;
  onUpdateRecipient?: (recipientId: string, data: any) => void;
}

type ModalStep = 'form' | 'otp';
const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";
const USER_PHONE = "+1-555-012-1234";

const getAddressConfig = (countryCode?: string) => {
    switch (countryCode) {
        case 'US':
            return {
                stateLabel: 'State',
                postalCodeLabel: 'ZIP Code',
                postalCodePlaceholder: 'e.g., 90210',
                validatePostalCode: (v: string) => /^\d{5}(-\d{4})?$/.test(v) ? null : 'Must be a 5-digit ZIP code.'
            };
        case 'GB':
            return {
                stateLabel: 'County (Optional)',
                postalCodeLabel: 'Postcode',
                postalCodePlaceholder: 'e.g., SW1A 0AA',
                validatePostalCode: (v: string) => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(v) ? null : 'Invalid UK postcode format.'
            };
        case 'CA':
            return {
                stateLabel: 'Province',
                postalCodeLabel: 'Postal Code',
                postalCodePlaceholder: 'e.g., A1A 1A1',
                validatePostalCode: (v: string) => /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/i.test(v) ? null : 'Invalid Canadian postal code format.'
            };
        default:
            return {
                stateLabel: 'State / Province',
                postalCodeLabel: 'Postal Code',
                postalCodePlaceholder: 'Enter postal code',
                validatePostalCode: (v: string) => v.length > 2 ? null : 'Postal code is too short.'
            };
    }
};

const formSteps = [
    { label: 'Personal Info', icon: <UserCircleIcon className="w-6 h-6" /> },
    { label: 'Address', icon: <HomeIcon className="w-6 h-6" /> },
    { label: 'Bank Details', icon: <BankIcon className="w-6 h-6" /> },
];

const StepIndicator: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; isCompleted: boolean }> = ({ icon, label, isActive, isCompleted }) => (
    <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-slate-700 text-slate-400'}`}>
            {isCompleted ? <CheckCircleIcon className="w-7 h-7" /> : icon}
        </div>
        <p className={`mt-2 text-xs text-center font-medium ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>{label}</p>
    </div>
);


export const AddRecipientModal: React.FC<AddRecipientModalProps> = ({ onClose, onAddRecipient, recipientToEdit, onUpdateRecipient }) => {
  const isEditMode = !!recipientToEdit;
  
  const [modalStep, setModalStep] = useState<ModalStep>('form');
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: recipientToEdit?.fullName || '',
    nickname: recipientToEdit?.nickname || '',
    phone: recipientToEdit?.phone || '',
    bankName: recipientToEdit?.bankName || '',
    country: recipientToEdit?.country || ALL_COUNTRIES.find(c => c.code === 'US')!,
    cashPickupEnabled: recipientToEdit?.deliveryOptions.cashPickup || false,
    streetAddress: recipientToEdit?.streetAddress || '',
    city: recipientToEdit?.city || '',
    stateProvince: recipientToEdit?.stateProvince || '',
    postalCode: recipientToEdit?.postalCode || '',
  });

  const [bankDetails, setBankDetails] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [bankingTip, setBankingTip] = useState<BankingTipResult | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [formDataForOtp, setFormDataForOtp] = useState<any>(null);
  const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);

  const countryConfig = useMemo(() => BANK_ACCOUNT_CONFIG[formData.country.code] || BANK_ACCOUNT_CONFIG.default, [formData.country.code]);
  const addressConfig = useMemo(() => getAddressConfig(formData.country.code), [formData.country.code]);

  useEffect(() => {
    if (!recipientToEdit) return;

    let detailsToSet: Record<string, string> = {};
    const config = BANK_ACCOUNT_CONFIG[recipientToEdit.country.code] || BANK_ACCOUNT_CONFIG.default;

    if (config.field1) {
        if (['iban', 'accountNumber'].includes(config.field1.name)) {
            detailsToSet[config.field1.name] = recipientToEdit.realDetails.accountNumber;
        } else if (['routingNumber', 'sortCode', 'bsb', 'transitNumber'].includes(config.field1.name)) {
             detailsToSet[config.field1.name] = recipientToEdit.realDetails.swiftBic;
        }
    }
     if (config.field2) {
        if (config.field2.name === 'accountNumber') {
            detailsToSet[config.field2.name] = recipientToEdit.realDetails.accountNumber;
        } else if (config.field2.name === 'swiftBic') {
             detailsToSet[config.field2.name] = recipientToEdit.realDetails.swiftBic;
        }
    }
    setBankDetails(detailsToSet);
  }, [recipientToEdit]);

  useEffect(() => {
    if (currentFormStep === 2) { 
      setBankingTip(null);
      const fetchTip = async () => {
          setIsTipLoading(true);
          const result = await getCountryBankingTip(formData.country.name);
          setBankingTip(result);
          setIsTipLoading(false);
      };
      fetchTip();
    }
  }, [formData.country, currentFormStep]);

  const validateField = (name: string, value: string): string | null => {
      switch(name) {
          case 'fullName':
              return value.trim().split(' ').length < 2 ? 'Please enter the recipient\'s full name.' : null;
          case 'phone':
              return value.trim() ? validatePhoneNumber(value) : null;
          case 'streetAddress':
              return value.trim().length < 5 ? 'Please enter a valid street address.' : null;
          case 'city':
              return value.trim().length < 2 ? 'Please enter a valid city.' : null;
          case 'stateProvince':
              return addressConfig.stateLabel.includes('Optional') === false && !value.trim() ? `${addressConfig.stateLabel} is required.` : null;
          case 'postalCode':
              return addressConfig.validatePostalCode(value);
          case 'bankName':
              return !value.trim() ? 'Bank name is required.' : null;
          default:
              if (countryConfig.field1?.name === name) return countryConfig.field1.validate(value);
              if (countryConfig.field2?.name === name) return countryConfig.field2.validate(value);
              return null;
      }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (touched[name]) {
        setErrors(prev => ({...prev, [name]: validateField(name, value)}));
    }
  };
  
  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const config = countryConfig.field1.name === name ? countryConfig.field1 : countryConfig.field2;
    const formattedValue = config.format ? config.format(value) : value;

    setBankDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (touched[name]) {
        setErrors(prev => ({...prev, [name]: validateField(name, formattedValue)}));
    }
    // Clear verification status on change
    setVerified(prev => ({ ...prev, [name]: false }));
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched(prev => ({ ...prev, [name]: true }));
      let finalValue = value;

      // Auto-prepend country code logic for phone number
      if (name === 'phone' && value.trim()) {
          const callingCode = COUNTRY_CALLING_CODES[formData.country.code];
          if (callingCode) {
              const trimmedValue = value.trim();
              if (!trimmedValue.startsWith('+')) {
                  const digitsOnly = trimmedValue.replace(/\D/g, '');
                  if (digitsOnly.startsWith(callingCode)) {
                      finalValue = `+${digitsOnly}`;
                  } else {
                      finalValue = `+${callingCode}${digitsOnly}`;
                  }
                  setFormData(prev => ({ ...prev, phone: finalValue }));
              }
          }
      }

      const error = validateField(name, finalValue);
      setErrors(prev => ({...prev, [name]: error}));

      // Trigger verification simulation for bank details
      if ((name === countryConfig.field1?.name || name === countryConfig.field2?.name) && !error) {
          setVerifying(prev => ({ ...prev, [name]: true }));
          setVerified(prev => ({ ...prev, [name]: false }));
          setTimeout(() => {
              setVerifying(prev => ({ ...prev, [name]: false }));
              setVerified(prev => ({ ...prev, [name]: true }));
          }, 750);
      }
  };

  const handleCountryChange = (country: Country) => {
    if (country) {
      setFormData(prev => ({ ...prev, country, bankName: '', stateProvince: '', postalCode: '' }));
      setBankDetails({});
      setErrors({});
      setTouched({});
      setVerified({});
      setVerifying({});
    }
  };

  const handleBankSelect = (bankName: string) => {
      setFormData(prev => ({ ...prev, bankName }));
      if (touched['bankName']) {
          setErrors(prev => ({...prev, bankName: null})); // Clear error on select
      }
  };
  
  const validateCurrentStep = () => {
    const fieldsToValidate: string[] = [];
    switch (currentFormStep) {
        case 0: fieldsToValidate.push('fullName', 'phone'); break;
        case 1: fieldsToValidate.push('streetAddress', 'city', 'stateProvince', 'postalCode'); break;
        case 2:
            fieldsToValidate.push('bankName');
            if (countryConfig.field1) fieldsToValidate.push(countryConfig.field1.name);
            if (countryConfig.field2) fieldsToValidate.push(countryConfig.field2.name);
            break;
    }
    
    const newErrors: Record<string, string | null> = {};
    const allTouched: Record<string, boolean> = {};
    let isStepValid = true;

    fieldsToValidate.forEach(name => {
        const value = (formData as any)[name] ?? bankDetails[name] ?? '';
        const error = validateField(name, value);
        if (error) {
            newErrors[name] = error;
            isStepValid = false;
        }
        allTouched[name] = true;
    });

    setErrors(prev => ({...prev, ...newErrors}));
    setTouched(prev => ({...prev, ...allTouched}));
    return isStepValid;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
        setCurrentFormStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentFormStep(prev => prev - 1);
  };
  
  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    let finalAccountNumber = '';
    let finalSwiftBic = '';
    
    if (countryConfig.field1) {
        const field1Name = countryConfig.field1.name;
        if (['iban', 'accountNumber', 'nuban'].includes(field1Name)) {
            finalAccountNumber = bankDetails[field1Name];
        } else { 
            finalSwiftBic = bankDetails[field1Name].replace(/-/g, '');
        }
    }
    if (countryConfig.field2) {
        const field2Name = countryConfig.field2.name;
        if (field2Name === 'accountNumber') {
            finalAccountNumber = bankDetails[field2Name];
        } else {
            finalSwiftBic = bankDetails[field2Name];
        }
    }

    const dataForOtp = { ...formData, accountNumber: finalAccountNumber, swiftBic: finalSwiftBic };

    setFormDataForOtp(dataForOtp);
    setIsProcessing(true);
    
    const { subject, body } = generateOtpEmail(USER_NAME);
    sendTransactionalEmail(USER_EMAIL, subject, body);
    sendSmsNotification(USER_PHONE, generateOtpSms());
    
    setTimeout(() => {
        setIsProcessing(false);
        setModalStep('otp');
    }, 1500);
  };
  
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) { 
        setIsProcessing(true);
        setTimeout(() => {
            if (isEditMode && onUpdateRecipient) {
                onUpdateRecipient(recipientToEdit.id, formDataForOtp);
            } else {
                onAddRecipient(formDataForOtp);
            }
            onClose();
        }, 1000);
    } else {
        setErrors({ otp: 'Please enter a valid 6-digit code.' });
    }
  };

  const renderField = (fieldConfig: any) => (
    <div>
        <label className="block text-sm font-medium text-slate-300">{fieldConfig.label}</label>
        <div className="relative mt-1">
            <input 
                type="text" 
                name={fieldConfig.name} 
                value={bankDetails[fieldConfig.name] || ''} 
                onChange={handleBankDetailsChange}
                onBlur={handleBlur}
                className={`w-full bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none focus:border-transparent p-3 rounded-md transition-colors pr-10 ${errors[fieldConfig.name] && touched[fieldConfig.name] ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'}`}
                placeholder={fieldConfig.placeholder}
                maxLength={fieldConfig.maxLength}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {verifying[fieldConfig.name] && <SpinnerIcon className="w-5 h-5 text-primary" />}
                {verified[fieldConfig.name] && !errors[fieldConfig.name] && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
            </div>
        </div>
        {errors[fieldConfig.name] && touched[fieldConfig.name] && <p className="text-red-500 text-xs mt-1">{errors[fieldConfig.name]}</p>}
    </div>
  );

  const StepContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <div className="w-full flex-shrink-0 px-1">{children}</div>
  );

  const inputClasses = (name: string) => `mt-1 w-full bg-slate-700/50 border border-slate-600 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none focus:border-transparent p-3 rounded-md transition-colors ${errors[name] && touched[name] ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'}`;

  const SelectedBankLogo = formData.bankName ? getBankIcon(formData.bankName) : null;

  return (
    <>
      {isBankSelectorOpen && (
        <BankSelector 
            countryCode={formData.country.code}
            onSelect={handleBankSelect}
            onClose={() => setIsBankSelectorOpen(false)}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-digital p-8 w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
          {modalStep === 'form' ? (
          <>
              <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">{isEditMode ? 'Edit' : 'Add New'} Recipient</h2>
              
              <div className="mb-8 px-4">
                  <div className="flex justify-between items-start">
                      {formSteps.map((s, index) => (
                          <React.Fragment key={s.label}>
                              <StepIndicator icon={s.icon} label={s.label} isActive={currentFormStep === index} isCompleted={currentFormStep > index} />
                              {index < formSteps.length - 1 && <div className={`flex-1 h-0.5 mt-6 transition-colors duration-300 mx-2 ${currentFormStep > index ? 'bg-green-500' : 'bg-slate-600'}`}></div>}
                          </React.Fragment>
                      ))}
                  </div>
              </div>

              <div className="flex-grow overflow-hidden">
                  <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentFormStep * 100}%)`}}>
                      <StepContentWrapper>
                          <div className="space-y-4 h-full overflow-y-auto pr-2">
                              <h3 className="text-xl font-bold text-slate-100">Personal Information</h3>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Recipient's Full Name</label>
                                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} className={inputClasses('fullName')} autoFocus />
                                  {errors.fullName && touched.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Nickname (Optional)</label>
                                  <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className={inputClasses('nickname')} placeholder="e.g., London Office" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Recipient's Phone Number (Optional)</label>
                                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={inputClasses('phone')} placeholder="+1 (555) 123-4567" />
                                  {COUNTRY_CALLING_CODES[formData.country.code] && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Country code +{COUNTRY_CALLING_CODES[formData.country.code]} will be added if missing.
                                    </p>
                                  )}
                                  {errors.phone && touched.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                              </div>
                          </div>
                      </StepContentWrapper>
                      <StepContentWrapper>
                          <div className="space-y-4 h-full overflow-y-auto pr-2">
                              <h3 className="text-xl font-bold text-slate-100">Recipient's Address</h3>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Street Address</label>
                                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} onBlur={handleBlur} className={inputClasses('streetAddress')} autoFocus />
                                  {errors.streetAddress && touched.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-sm font-medium text-slate-300">City</label>
                                      <input type="text" name="city" value={formData.city} onChange={handleChange} onBlur={handleBlur} className={inputClasses('city')} />
                                      {errors.city && touched.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                  </div>
                                  <div>
                                      <label className="block text-sm font-medium text-slate-300">{addressConfig.stateLabel}</label>
                                      <input type="text" name="stateProvince" value={formData.stateProvince} onChange={handleChange} onBlur={handleBlur} className={inputClasses('stateProvince')} />
                                      {errors.stateProvince && touched.stateProvince && <p className="text-red-500 text-xs mt-1">{errors.stateProvince}</p>}
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">{addressConfig.postalCodeLabel}</label>
                                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} onBlur={handleBlur} className={inputClasses('postalCode')} placeholder={addressConfig.postalCodePlaceholder} />
                                  {errors.postalCode && touched.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                              </div>
                          </div>
                      </StepContentWrapper>
                      <StepContentWrapper>
                          <div className="space-y-4 h-full overflow-y-auto pr-2">
                              <h3 className="text-xl font-bold text-slate-100">Bank Details</h3>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Receiving Country</label>
                                  <CountrySelector 
                                      selectedCountry={formData.country}
                                      onSelect={handleCountryChange}
                                      className={`w-full flex items-center justify-between text-left ${inputClasses('country')}`}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-slate-300">Bank Name</label>
                                  <button type="button" onClick={() => setIsBankSelectorOpen(true)} className={`w-full flex items-center justify-between text-left ${inputClasses('bankName')}`}>
                                      {formData.bankName && SelectedBankLogo ? (
                                          <div className="flex items-center space-x-2">
                                              <SelectedBankLogo className="w-6 h-6 rounded-md bg-white p-0.5" />
                                              <span className="font-semibold">{formData.bankName}</span>
                                          </div>
                                      ) : (
                                          <span className="text-slate-400">Select a bank...</span>
                                      )}
                                      <span className="text-slate-400">▼</span>
                                  </button>
                                  {errors.bankName && touched.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                              </div>
                              {countryConfig.field1 && renderField(countryConfig.field1)}
                              {countryConfig.field2 && renderField(countryConfig.field2)}

                              {isTipLoading && (
                                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-500/10">
                                      <SpinnerIcon className="w-5 h-5 text-primary-300" />
                                      <span className="text-sm text-primary-300">Fetching AI-powered tip...</span>
                                  </div>
                              )}
                              {bankingTip && !isTipLoading && (
                                  <div className={`flex items-start space-x-3 p-3 rounded-lg ${bankingTip.isError ? 'bg-yellow-500/10' : 'bg-primary-500/10'}`}>
                                      <InfoIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${bankingTip.isError ? 'text-yellow-400' : 'text-primary-300'}`} />
                                      <p className={`text-sm ${bankingTip.isError ? 'text-yellow-300' : 'text-primary-300'}`}>{bankingTip.tip}</p>
                                  </div>
                              )}
                          </div>
                      </StepContentWrapper>
                  </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                  <button type="button" onClick={handleBack} className="px-6 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-lg disabled:opacity-50" disabled={currentFormStep === 0}>
                      Back
                  </button>
                  {currentFormStep < formSteps.length - 1 ? (
                      <button onClick={handleNext} className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg">Next</button>
                  ) : (
                      <button onClick={handleSubmit} disabled={isProcessing} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 flex items-center">
                          {isProcessing ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
                          {isEditMode ? 'Update Recipient' : 'Add Recipient'}
                      </button>
                  )}
              </div>
          </>
          ) : (
            <div className="text-center animate-fade-in-up">
              <ShieldCheckIcon className="w-12 h-12 text-primary mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-slate-100">Final Verification</h3>
              <p className="text-sm text-slate-400 my-4">For your security, please enter the 6-digit verification code sent to your registered phone and email address.</p>
              <form onSubmit={handleOtpSubmit}>
                  <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className={`w-48 mx-auto bg-slate-700/50 border border-slate-600 p-3 text-center text-slate-100 text-3xl tracking-[.75em] rounded-md transition-colors focus:bg-slate-700 focus:outline-none ${errors.otp ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'}`}
                      maxLength={6}
                      placeholder="------"
                      autoFocus
                  />
                  {errors.otp && <p className="text-red-500 text-xs mt-2">{errors.otp}</p>}
                  <button type="submit" disabled={isProcessing} className="w-full mt-6 py-3 text-white bg-primary rounded-lg font-semibold shadow-md flex items-center justify-center">
                      {isProcessing ? <SpinnerIcon className="w-5 h-5"/> : 'Verify & Complete'}
                  </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};