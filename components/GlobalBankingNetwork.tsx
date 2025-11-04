import React, { useState, useMemo } from 'react';
import { BANKS_BY_COUNTRY, ALL_COUNTRIES } from '../constants';
import { getBankIcon, SearchIcon } from './Icons';
import { View } from '../types';

interface GlobalBankingNetworkProps {
    onOpenWireTransfer: (data: any) => void;
    setActiveView: (view: View) => void;
}

// Mapping country codes to continents for organization
const CONTINENT_MAP: { [key: string]: string } = {
    US: 'North America', CA: 'North America', MX: 'North America',
    GB: 'Europe', DE: 'Europe', FR: 'Europe', ES: 'Europe', IT: 'Europe', NL: 'Europe', CH: 'Europe', SE: 'Europe', IE: 'Europe', PL: 'Europe', BE: 'Europe', AT: 'Europe', NO: 'Europe', DK: 'Europe', PT: 'Europe', GR: 'Europe', CZ: 'Europe', HU: 'Europe', RO: 'Europe', FI: 'Europe', BG: 'Europe', HR: 'Europe', LT: 'Europe', LV: 'Europe', EE: 'Europe', SK: 'Europe', SI: 'Europe', LU: 'Europe', CY: 'Europe', MT: 'Europe', IS: 'Europe',
    CN: 'Asia', JP: 'Asia', IN: 'Asia', SG: 'Asia', KR: 'Asia', HK: 'Asia', ID: 'Asia', MY: 'Asia', AE: 'Asia', SA: 'Asia', QA: 'Asia', IL: 'Asia', KW: 'Asia', TR: 'Asia', PH: 'Asia', TH: 'Asia', VN: 'Asia', PK: 'Asia', BD: 'Asia', OM: 'Asia', BH: 'Asia', LK: 'Asia', NP: 'Asia', GE: 'Asia', AM: 'Asia', AZ: 'Asia', KZ: 'Asia', UZ: 'Asia', MN: 'Asia', KH: 'Asia', LA: 'Asia', MM: 'Asia',
    AU: 'Australia', NZ: 'Australia',
    BR: 'South America', AR: 'South America', CO: 'South America', CL: 'South America', PE: 'South America', VE: 'South America', EC: 'South America', GT: 'South America', CR: 'South America', PA: 'South America', UY: 'South America', PY: 'South America', BO: 'South America', SV: 'South America', HN: 'South America', NI: 'South America', DO: 'South America', JM: 'South America', TT: 'South America',
    ZA: 'Africa', NG: 'Africa', EG: 'Africa', KE: 'Africa', GH: 'Africa', TZ: 'Africa', UG: 'Africa', MA: 'Africa', DZ: 'Africa', TN: 'Africa', JO: 'Africa', LB: 'Africa',
};

const findCountryForBank = (bankName: string) => {
    for (const countryCode in BANKS_BY_COUNTRY) {
        if (BANKS_BY_COUNTRY[countryCode as keyof typeof BANKS_BY_COUNTRY].some(b => b.name === bankName)) {
            return ALL_COUNTRIES.find(c => c.code === countryCode);
        }
    }
    return undefined;
};

const BankCard: React.FC<{ name: string; onClick: () => void; }> = ({ name, onClick }) => {
    const BankLogo = getBankIcon(name);
    return (
        <button onClick={onClick} className="bg-slate-200 p-4 rounded-xl shadow-digital flex flex-col items-center justify-center text-center h-32 transition-transform hover:scale-105 hover:shadow-lg active:shadow-digital-inset">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-md mb-2">
                <BankLogo className="w-full h-full object-contain" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">{name}</p>
        </button>
    );
};

export const GlobalBankingNetwork: React.FC<GlobalBankingNetworkProps> = ({ onOpenWireTransfer }) => {
    const banksByContinent = useMemo(() => {
        const continents: { [continent: string]: { name: string; domain: string }[] } = {};
        for (const countryCode in BANKS_BY_COUNTRY) {
            const continent = CONTINENT_MAP[countryCode] || 'Other';
            if (!continents[continent]) {
                continents[continent] = [];
            }
            continents[continent].push(...BANKS_BY_COUNTRY[countryCode as keyof typeof BANKS_BY_COUNTRY]);
        }
        
        const sortedContinents: { [continent: string]: { name: string; domain: string }[] } = {};
        const continentOrder = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia', 'Other'];
        continentOrder.forEach(continentName => {
            if (continents[continentName]) {
                 // Deduplicate banks within each continent and sort them
                const uniqueBanks = Array.from(new Map(continents[continentName].map(b => [b.name, b])).values());
                uniqueBanks.sort((a, b) => a.name.localeCompare(b.name));
                sortedContinents[continentName] = uniqueBanks;
            }
        });

        return sortedContinents;
    }, []);

    const [activeTab, setActiveTab] = useState(Object.keys(banksByContinent)[0] || '');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBanks = useMemo(() => {
        const banks = banksByContinent[activeTab] || [];
        if (!searchTerm) return banks;
        return banks.filter(bank => bank.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [activeTab, searchTerm, banksByContinent]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Global Banking Network</h2>
                <p className="text-sm text-slate-500 mt-1">Explore our extensive network of partner financial institutions across the globe.</p>
            </div>

            <div className="bg-slate-200 rounded-2xl shadow-digital">
                <div className="p-4 border-b border-slate-300">
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for a specific bank..."
                            className="w-full bg-slate-200 p-3 pl-10 rounded-md shadow-digital-inset"
                        />
                    </div>
                </div>
                <div className="border-b border-slate-300">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto p-4">
                        {Object.keys(banksByContinent).map(continent => (
                            <button
                                key={continent}
                                onClick={() => { setSearchTerm(''); setActiveTab(continent); }}
                                className={`whitespace-nowrap py-2 px-4 font-semibold text-sm rounded-md transition-all ${
                                    activeTab === continent ? 'bg-white shadow text-primary' : 'text-slate-600 hover:bg-slate-300/50'
                                }`}
                            >
                                {continent}
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="p-6">
                    {filteredBanks.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredBanks.map(bank => (
                                <BankCard 
                                    key={bank.name} 
                                    name={bank.name} 
                                    onClick={() => onOpenWireTransfer({ 
                                        bankName: bank.name, 
                                        step: 2,
                                        recipientCountry: findCountryForBank(bank.name) 
                                    })} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <p className="font-semibold">No banks found</p>
                            <p className="text-sm">Try clearing your search or selecting a different continent.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};