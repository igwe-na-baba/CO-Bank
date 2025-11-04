import React, { useState } from 'react';
import { View } from '../types';
import { FAQS } from '../constants';
import { PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, MapPinIcon, ChevronDownIcon, SparklesIcon } from './Icons';

interface ContactProps {
    setActiveView: (view: View) => void;
}

const ContactCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ icon, title, children, action }) => (
    <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
        <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shadow-digital text-primary">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <div className="text-sm text-slate-600 space-y-2">
            {children}
        </div>
        {action && <div className="mt-4">{action}</div>}
    </div>
);

const FaqItem: React.FC<{ faq: { question: string, answer: string } }> = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-300 last:border-b-0">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4">
                <span className="font-semibold text-slate-800">{faq.question}</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-sm text-slate-600 animate-fade-in-down">
                    {faq.answer}
                </div>
            )}
            <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const Contact: React.FC<ContactProps> = ({ setActiveView }) => {
    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-slate-800">Get in Touch</h2>
                <p className="text-lg text-slate-500 mt-2 max-w-2xl mx-auto">We're available 24/7 to help you with any questions or concerns. Choose the method that works best for you.</p>
            </div>

            {/* Quick Link to AI Support */}
            <div className="bg-gradient-to-r from-primary-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <SparklesIcon className="w-10 h-10 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold">Need a Quick Answer?</h3>
                        <p className="opacity-90">Our AI Assistant can answer most questions instantly.</p>
                    </div>
                </div>
                <button onClick={() => setActiveView('support')} className="bg-white text-primary font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-100 transition-colors flex-shrink-0">
                    Ask AI Assistant
                </button>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ContactCard icon={<PhoneIcon className="w-6 h-6" />} title="Call Us">
                    <p><strong>General Support (24/7):</strong><br/>+1 (800) 555-0199</p>
                    <p><strong>International:</strong><br/>+1 (212) 555-0187</p>
                    <p><strong>Fraud & Security:</strong><br/>+1 (800) 555-0123</p>
                </ContactCard>
                <ContactCard icon={<EnvelopeIcon className="w-6 h-6" />} title="Email Us">
                    <p><strong>General Support:</strong><br/><a href="mailto:support@icreditunion.com" className="text-primary hover:underline">support@icreditunion.com</a></p>
                    <p><strong>Security Team:</strong><br/><a href="mailto:security@icreditunion.com" className="text-primary hover:underline">security@icreditunion.com</a></p>
                    <p className="text-xs">Response within 24 business hours.</p>
                </ContactCard>
                <ContactCard icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />} title="Live Chat" action={
                    <button className="w-full py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                        Start Live Chat
                    </button>
                }>
                    <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Available Now</span>
                    </p>
                    <p>Get connected with a support agent in minutes for real-time assistance.</p>
                </ContactCard>
            </div>

            {/* FAQ Section */}
            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-6 border-b border-slate-300">
                    <h3 className="text-xl font-bold text-slate-800">Frequently Asked Questions</h3>
                </div>
                <div className="px-6">
                    {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} />)}
                </div>
            </div>

             {/* Headquarters Location */}
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="md:col-span-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><MapPinIcon className="w-6 h-6 mr-2 text-primary" /> Global Headquarters</h3>
                    <address className="not-italic text-slate-600">
                        <strong>iCredit Union Tower</strong><br/>
                        123 Finance Street<br/>
                        New York, NY 10001<br/>
                        United States
                    </address>
                 </div>
                 <div className="md:col-span-2 h-64 rounded-lg overflow-hidden shadow-inner bg-slate-300">
                     <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://i.imgur.com/eIYp3cQ.png')" }}></div>
                 </div>
            </div>

        </div>
    );
};