import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const response = await fetch(`/locales/${language}.json`);
                if (!response.ok) {
                    throw new Error(`Could not load ${language}.json`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error('Failed to fetch translations:', error);
                // Fallback to English if the desired language file fails to load
                if (language !== 'en') {
                    const fallbackResponse = await fetch(`/locales/en.json`);
                    const fallbackData = await fallbackResponse.json();
                    setTranslations(fallbackData);
                }
            }
        };

        fetchTranslations();
    }, [language]);

    const t = (key: string): string => {
        return translations[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};