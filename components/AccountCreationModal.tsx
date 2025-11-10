



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
    onClose: () => void