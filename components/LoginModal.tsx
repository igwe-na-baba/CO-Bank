import React, { useState, useEffect, useCallback } from 'react';
// FIX: Added missing icons.
import { ICreditUnionLogo, FingerprintIcon, SpinnerIcon, ShieldCheckIcon, DevicePhoneMobileIcon, EnvelopeIcon, CheckCircleIcon, FaceIdIcon } from './Icons';
import { 
    sendSmsNotification, 
    sendTransactionalEmail, 
    generateOtpEmail, 
    generateOtpSms 
} from '../services/notificationService';

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
}

type LoginStep = 'credentials' | 'securityCheck' | 'preMfaWarning' | 'mfa';
type ModalMode = 'login' | 'reset' | 'reset_confirmation';

const USER_EMAIL = "randy.m.chitwood@icreditunion.com";
const USER_NAME = "Randy M. Chitwood";

// This component is incomplete and appears to be unused.
// Adding a minimal implementation to resolve syntax errors.
export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
    return null;
};