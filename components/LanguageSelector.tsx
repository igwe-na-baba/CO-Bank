import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { XIcon } from './Icons';

interface LanguageSelectorProps {
    onClose: () => void;
}

const languages = [
    { code: 'en', name: 'English', flag: 'us' },
    { code: 'es', name: 'Español', flag: 'es' },
    { code: 'fr', name: 'Français', flag: 'fr' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onClose }) => {
    const { language, setLanguage, t } = useLanguage();

    const handleSelect = (langCode: 'en' | 'es' | 'fr') => {
        setLanguage(langCode);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col m-4 animate-slide-in-down border border-white/10"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-100">{t('language_selector_title')}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-full">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-2">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code as 'en' | 'es' | 'fr')}
                            className={`w-full flex items-center space-x-4 p-3 rounded-lg text-left transition-colors ${
                                language === lang.code ? 'bg-primary/20 text-primary-300' : 'hover:bg-slate-700/50 text-slate-200'
                            }`}
                        >
                            <img src={`https://flagcdn.com/w40/${lang.flag}.png`} alt={`${lang.name} flag`} className="w-8 rounded-md shadow-sm" />
                            <span className="font-semibold">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};