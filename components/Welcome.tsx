import React, { useState, useEffect, useCallback } from 'react';
import { 
    ICreditUnionLogo, 
    LockClosedIcon,
    EnvelopeIcon,
    ArrowRightIcon,
    FingerprintIcon,
    FaceIdIcon,
    SpinnerIcon,
    DevicePhoneMobileIcon
} from './Icons';
import { 
    sendSmsNotification, 
    sendTransactionalEmail, 
    generateOtpEmail, 
    generateOtpSms,
    generatePasswordResetEmail,
    generatePasswordResetSms
} from '../services/notificationService';
import { USER_PASSWORD } from '../constants';
import { ReCaptcha } from './ReCaptcha';

interface WelcomeProps {
  onLogin: () => void;
  onStartCreateAccount: () => void;
}

type LoginStep = 'username' | 'password' | 'recaptcha' | 'security_check' | 'mfa';
type WelcomeView = 'signin' | 'forgot_password' | 'forgot_password_confirmation';


const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";
const USER_PHONE = "+1-555-012-1234";

const securityCheckMessages = [
    'Initializing secure session...',
    'Establishing TLS 1.3 tunnel...',
    'Verifying device fingerprint...',
    'Checking against threat intelligence...',
    'Security handshake complete.'
];

const LoginBackground: React.FC = () => (
    <div className="absolute inset-0 z-0">
        <div
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-ken-burns"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1587145820266-a5951ee6f620?q=80&w=2874&auto=format&fit=crop')`,
                animationDuration: '40s',
            }}
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
    </div>
);


export const Welcome: React.FC<WelcomeProps> = ({ onLogin, onStartCreateAccount }) => {
  const [view, setView] = useState<WelcomeView>('signin');
  const [step, setStep] = useState<LoginStep>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [securityMessageIndex, setSecurityMessageIndex] = useState(0);
  
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricSupportMessage, setBiometricSupportMessage] = useState('Sign in with biometrics');

  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        if (!window.PublicKeyCredential || !(await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())) {
          setIsBiometricSupported(false);
          setBiometricSupportMessage('Biometrics not supported');
          return;
        }
        setIsBiometricSupported(true);
      } catch (e) {
        console.warn('Biometric support check failed:', e);
        setIsBiometricSupported(false);
        setBiometricSupportMessage('Biometric check failed');
      }
    };
    checkBiometricSupport();
  }, []);


  useEffect(() => {
    if (step === 'security_check') {
      setIsLoading(true);
      const interval = setInterval(() => {
        setSecurityMessageIndex(prev => {
          if (prev >= securityCheckMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
                setStep('mfa');
                const { subject, body } = generateOtpEmail(USER_NAME);
                sendTransactionalEmail(USER_EMAIL, subject, body);
                sendSmsNotification(USER_PHONE, generateOtpSms());
            }, 500);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
        setIsLoading(false);
        setSecurityMessageIndex(0);
    }
  }, [step]);
  
  const handleUsernameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!username.trim()) {
          setError('Please enter your username.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setStep('password');
      }, 500);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!password) {
          setError('Please enter your password.');
          return;
      }
      setIsLoading(true);
      setTimeout(() => {
        if (password !== USER_PASSWORD) {
            setError('The password you entered is incorrect. Please try again.');
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        setStep('recaptcha');
      }, 500);
  };
  
  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (mfaCode.length === 6) {
        onLogin();
      } else {
        setError('Please enter a valid 6-digit code.');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const handleBiometricLogin = useCallback(async () => {
    if (!isBiometricSupported) {
        setError("Biometric authentication is not supported on this browser or device.");
        return;
    }
    
    setError('');
    setIsLoading(true);

    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const options: PublicKeyCredentialRequestOptions = {
            challenge,
            userVerification: 'required',
        };

        const assertion = await navigator.credentials.get({ publicKey: options });

        console.log('Biometric authentication successful:', assertion);
        setStep('recaptcha');

    } catch (err: any) {
        console.error('Biometric authentication error:', err);
        if (err.name === 'NotAllowedError') {
            setError('Authentication was cancelled.');
        } else {
            setError('No biometric credential found. Please use your password.');
        }
    } finally {
        setIsLoading(false);
    }
  }, [isBiometricSupported]);

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!recoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        setError('Please enter a valid email address.');
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
        const { subject, body } = generatePasswordResetEmail(USER_NAME, recoveryEmail);
        sendTransactionalEmail(recoveryEmail, subject, body);
        sendSmsNotification(USER_PHONE, generatePasswordResetSms());
        setIsLoading(false);
        setView('forgot_password_confirmation');
    }, 1500);
  };

  const inputClasses = "w-full bg-slate-700/50 border-0 text-slate-100 placeholder-slate-400 focus:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 p-3 rounded-md shadow-digital-inset transition-colors";

  const renderUsernameStep = () => (
    <div className="animate-fade-in-up">
        <h2 className="text-4xl font-extrabold text-3d-digital mb-1 text-center">Welcome to iCredit Union®</h2>
        <p className="text-sm font-semibold text-primary-400 mb-6 text-center glow-text">Premium Digital Banking</p>
        <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className={`${inputClasses} pl-10`}
                    placeholder="Username"
                    autoFocus
                />
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-primary-400 focus:ring-primary-400"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-300">Remember me</label>
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 shadow-md disabled:opacity-50"
            >
                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Sign In'}
            </button>
        </form>
        <div className="mt-6 text-center text-sm space-y-2">
            <button onClick={() => setView('forgot_password')} className="font-medium text-primary-400 hover:underline">Forgot Username or Password?</button>
            <p className="text-slate-300">
                New to iCredit Union®?{' '}
                <button onClick={onStartCreateAccount} className="font-medium text-primary-400 hover:underline">
                    Open an Account
                </button>
            </p>
        </div>
    </div>
  );
  
  const renderPasswordStep = () => (
     <div className="animate-fade-in-up">
        <button onClick={() => { setStep('username'); }} className="text-sm font-medium text-primary-400 hover:underline mb-4">&larr; Back</button>
        <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">{username.charAt(0).toUpperCase()}</div>
            <div>
                <p className="font-semibold text-slate-100">{username}</p>
                <p className="text-xs text-slate-400">Enter your password to continue</p>
            </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${inputClasses} pl-10`}
                    placeholder="Password"
                    autoFocus
                />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 shadow-md disabled:opacity-50">
                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <ArrowRightIcon className="w-5 h-5" />}
            </button>
        </form>
        
        {isBiometricSupported && (
            <div className="mt-4 text-center">
                <button onClick={handleBiometricLogin} className="text-sm font-medium text-primary-400 hover:underline flex items-center justify-center w-full space-x-2">
                    {typeof window.ontouchstart !== 'undefined' ? <FaceIdIcon className="w-5 h-5"/> : <FingerprintIcon className="w-5 h-5"/>}
                    <span>{biometricSupportMessage}</span>
                </button>
            </div>
        )}
    </div>
  );
  
  const renderRecaptchaStep = () => (
    <div className="animate-fade-in-up">
        <p className="text-sm text-slate-300 mb-4 text-center">Please complete the security check to continue.</p>
        <ReCaptcha onVerified={() => setStep('security_check')} />
        <button onClick={() => setStep('password')} className="w-full text-sm font-medium text-primary-400 hover:underline mt-2">
            &larr; Back to password
        </button>
    </div>
  );

  const renderSecurityCheckStep = () => (
    <div className="animate-fade-in-up text-center p-4">
        <SpinnerIcon className="w-12 h-12 text-primary mx-auto" />
        <h3 className="mt-4 text-xl font-bold text-slate-100 transition-opacity duration-300" key={securityMessageIndex}>{securityCheckMessages[securityMessageIndex]}</h3>
    </div>
  );

  const renderMfaStep = () => (
    <div className="animate-fade-in-up text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Verification Required</h2>
        <p className="text-sm text-slate-300 mb-6">A verification code was sent to your registered device.</p>
        <form onSubmit={handleMfaSubmit}>
            <input
                type="text"
                value={mfaCode}
                onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className={`${inputClasses} w-48 mx-auto text-center text-3xl tracking-[.75em]`}
                maxLength={6}
                placeholder="------"
                autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full mt-6 py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-md">
                {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Verify'}
            </button>
        </form>
    </div>
  );
  
  const renderForgotPassword = () => (
    <div className="animate-fade-in-up">
        <button onClick={() => setView('signin')} className="text-sm font-medium text-primary-400 hover:underline mb-4">&larr; Back to Sign In</button>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Reset Your Password</h2>
        <p className="text-sm text-slate-300 mb-6">Enter your registered email address to receive a password reset link.</p>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
             <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    type="email"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    className={`${inputClasses} pl-10`}
                    placeholder="Email Address"
                    autoFocus
                />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-md">
                 {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Send Reset Link'}
            </button>
        </form>
    </div>
  );
  
  const renderForgotPasswordConfirmation = () => (
    <div className="animate-fade-in-up text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Check Your Email</h2>
        <p className="text-sm text-slate-300">We've sent a password reset link to <strong>{recoveryEmail}</strong>. Please check your inbox and follow the instructions.</p>
        <button onClick={() => setView('signin')} className="mt-6 w-full py-3 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md shadow-md">&larr; Back to Sign In</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center overflow-hidden relative">
      <LoginBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-digital p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="inline-block p-2 rounded-full bg-slate-700/50">
              <ICreditUnionLogo />
            </div>
          </div>

          {view === 'signin' && (
            <>
              {step === 'username' && renderUsernameStep()}
              {step === 'password' && renderPasswordStep()}
              {step === 'recaptcha' && renderRecaptchaStep()}
              {step === 'security_check' && renderSecurityCheckStep()}
              {step === 'mfa' && renderMfaStep()}
            </>
          )}
          {view === 'forgot_password' && renderForgotPassword()}
          {view === 'forgot_password_confirmation' && renderForgotPasswordConfirmation()}
        </div>
      </div>
       <style>{`
            @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};