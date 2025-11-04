import React from 'react';
import { View } from '../types';
import {
    ICreditUnionLogo,
    XSocialIcon,
    LinkedInIcon,
    InstagramIcon,
    AppleIcon,
    GooglePlayIcon,
    FdicIcon,
    EqualHousingLenderIcon,
} from './Icons';
import { LEGAL_CONTENT } from '../constants';

interface FooterProps {
    setActiveView: (view: View) => void;
    onOpenSendMoneyFlow: (initialTab?: 'send' | 'split' | 'deposit') => void;
    openLegalModal: (title: string, content: string) => void;
}

const FooterLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <li className="group">
        <button onClick={onClick} className="inline-block transition-all duration-200 group-hover:text-primary-300 group-hover:translate-x-1">
            {children}
        </button>
    </li>
);

const DownloadButton: React.FC<{ icon: React.ReactNode; store: string; title: string; href: string }> = ({ icon, store, title, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors w-44 shadow-md">
        {icon}
        <div className="text-left">
            <p className="text-xs leading-none opacity-80">{store}</p>
            <p className="text-lg leading-tight">{title}</p>
        </div>
    </a>
);


export const Footer: React.FC<FooterProps> = ({ setActiveView, onOpenSendMoneyFlow, openLegalModal }) => {

    return (
        <footer className="bg-slate-900 text-slate-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Global Presence Display */}
                <div className="relative rounded-2xl p-8 bg-slate-800/50 shadow-digital mb-12 h-96 flex flex-col justify-center items-center text-center overflow-hidden">
                    {/* Video Background */}
                     <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute z-0 w-auto min-w-full min-h-full max-w-none opacity-20"
                    >
                        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-globe-with-flowing-lines-of-data-42217-large.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
                    {/* Text Content */}
                    <div className="relative z-20">
                        <h2 className="text-3xl font-bold text-slate-100 mb-2 glow-text animate-text-focus-in">A Dynamic Global Network</h2>
                        <p className="text-slate-300 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                            Our infrastructure spans the globe, leveraging real-time data and a distributed network to power your finances securely and instantly, wherever you are.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="col-span-2 lg:col-span-1">
                         <div className="flex items-center space-x-2 mb-4">
                            <ICreditUnionLogo />
                            <p className="font-bold text-slate-200">iCredit Union®</p>
                        </div>
                        <p className="text-sm">
                            The new standard in global finance, built on trust, transparency, and technology.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">About iCU</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => setActiveView('about')}>About Us</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Careers at iCredit Union®', LEGAL_CONTENT.CAREERS_INFO)}>Careers</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Press Room', LEGAL_CONTENT.PRESS_ROOM_INFO)}>Press</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Site Map', LEGAL_CONTENT.SITE_MAP_CONTENT)}>Site Map</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Help & Support</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => onOpenSendMoneyFlow('send')}>Send Money</FooterLink>
                            <FooterLink onClick={() => setActiveView('contact')}>Contact Us</FooterLink>
                            <FooterLink onClick={() => setActiveView('support')}>Help Center</FooterLink>
                            <FooterLink onClick={() => setActiveView('atmLocator')}>ATM Locator</FooterLink>
                            <FooterLink onClick={() => setActiveView('security')}>Security Center</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Legal & Privacy</h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <FooterLink onClick={() => setActiveView('privacy')}>Privacy Center</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Terms of Use', LEGAL_CONTENT.TERMS_OF_USE)}>Terms of Use</FooterLink>
                             <FooterLink onClick={() => openLegalModal('Online Banking Guarantee', LEGAL_CONTENT.ONLINE_BANKING_GUARANTEE)}>Online Banking Guarantee</FooterLink>
                            <FooterLink onClick={() => openLegalModal('Cookie Policy', LEGAL_CONTENT.COOKIE_POLICY)}>Cookie Policy</FooterLink>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase">Follow Us</h3>
                        <div className="flex space-x-6 text-slate-400 mt-4">
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-white transition-all duration-200 hover:scale-125"><XSocialIcon className="w-5 h-5"/></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-all duration-200 hover:scale-125"><LinkedInIcon className="w-5 h-5"/></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-all duration-200 hover:scale-125"><InstagramIcon className="w-5 h-5"/></a>
                        </div>
                        <h3 className="font-semibold text-slate-200 tracking-wider uppercase mt-8">Download Our App</h3>
                        <div className="mt-4 space-y-3 flex flex-col items-start">
                            <DownloadButton icon={<AppleIcon className="w-8 h-8"/>} store="Download on the" title="App Store" href="https://www.apple.com/app-store/" />
                            <DownloadButton icon={<GooglePlayIcon className="w-6 h-6 ml-1"/>} store="GET IT ON" title="Google Play" href="https://play.google.com/store" />
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-700 pt-8 text-xs text-slate-500 space-y-4">
                    <p>iCredit Union® is a fictional financial institution created for demonstration purposes. This is not a real bank. Products and services are simulated. NMLS ID #9999999.</p>
                    <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-2">
                             <FdicIcon className="h-5 w-auto" />
                        </div>
                         <div className="flex items-center space-x-2">
                            <EqualHousingLenderIcon className="w-5 h-5"/>
                            <span>Equal Housing Lender</span>
                        </div>
                    </div>
                    <p className="text-center pt-4">&copy; {new Date().getFullYear()} iCredit Union®. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};