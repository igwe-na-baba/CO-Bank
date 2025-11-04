import React, { useState } from 'react';
import { PayPalIcon, CashAppIcon, ZelleIcon, WesternUnionIcon, MoneyGramIcon, CheckCircleIcon, OnfidoIcon, TwilioIcon, SendGridIcon } from './Icons';
import { LinkServiceModal } from './LinkServiceModal';

interface IntegrationsProps {
    linkedServices: Record<string, string>;
    onLinkService: (serviceName: string, identifier: string) => void;
}

const serviceProviders = [
    { name: 'PayPal', icon: PayPalIcon, description: 'Send money globally to any PayPal account.' },
    { name: 'CashApp', icon: CashAppIcon, description: 'Instantly send funds to a $Cashtag.' },
    { name: 'Zelle', icon: ZelleIcon, description: 'Send money directly to U.S. bank accounts.' },
    { name: 'Western Union', icon: WesternUnionIcon, description: 'Send cash for pickup at locations worldwide.' },
    { name: 'MoneyGram', icon: MoneyGramIcon, description: 'Reliable cash pickups and bank deposits.' },
];

const platformPartners = [
    { name: 'Onfido', icon: OnfidoIcon, description: 'Industry-leading identity verification for enhanced security and compliance.', website: 'https://onfido.com' },
    { name: 'Twilio', icon: TwilioIcon, description: 'Powering our secure, real-time SMS alerts and notifications.', website: 'https://twilio.com' },
    { name: 'SendGrid', icon: SendGridIcon, description: 'Ensuring reliable delivery of all our transactional emails.', website: 'https://sendgrid.com' },
];

export const Integrations: React.FC<IntegrationsProps> = ({ linkedServices, onLinkService }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleLinkClick = (serviceName: string) => {
        setSelectedService(serviceName);
        setModalOpen(true);
    };

    const handleLink = (serviceName: string, identifier: string) => {
        onLinkService(serviceName, identifier);
        setModalOpen(false);
    };

    return (
        <>
            {modalOpen && (
                <LinkServiceModal
                    serviceName={selectedService}
                    onClose={() => setModalOpen(false)}
                    onLink={handleLink}
                />
            )}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Integrations</h2>
                    <p className="text-sm text-slate-500 mt-1">Connect your favorite payment services to send money directly from iCredit Union®.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {serviceProviders.map(service => {
                        const isLinked = linkedServices.hasOwnProperty(service.name);
                        const Icon = service.icon;
                        return (
                            <div key={service.name} className="bg-slate-200 rounded-2xl shadow-digital p-6 flex flex-col">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Icon className="w-10 h-10" />
                                    <h3 className="text-xl font-bold text-slate-800">{service.name}</h3>
                                </div>
                                <p className="text-sm text-slate-600 flex-grow">{service.description}</p>
                                {isLinked ? (
                                    <div className="mt-6 flex items-center justify-center space-x-2 text-green-600 font-semibold p-3 bg-green-100 rounded-lg shadow-digital-inset">
                                        <CheckCircleIcon className="w-5 h-5"/>
                                        <span>Linked: {linkedServices[service.name]}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleLinkClick(service.name)}
                                        className="mt-6 w-full py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        Link Account
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                 <div className="bg-slate-200 rounded-2xl shadow-digital mt-8">
                    <div className="p-6 border-b border-slate-300">
                        <h2 className="text-xl font-bold text-slate-800">Platform Partners</h2>
                        <p className="text-sm text-slate-500 mt-1">Powered by industry-leading technology for security and communication.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {platformPartners.map(partner => {
                            const Icon = partner.icon;
                            return (
                                <div key={partner.name} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset text-center">
                                    <Icon className="w-12 h-12 mx-auto text-slate-600" />
                                    <h4 className="font-bold text-slate-800 mt-3">{partner.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{partner.description}</p>
                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
                                        Learn More &rarr;
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};