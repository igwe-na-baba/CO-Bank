import React, { useState } from 'react';
import { TravelPlan, TravelPlanStatus, Country } from '../types';
// FIX: Add missing icons
import { CalendarDaysIcon, GlobeAmericasIcon, VerifiedBadgeIcon, PlusCircleIcon, MapPinIcon } from './Icons';
import { CountrySelector } from './CountrySelector';

interface TravelCheckInProps {
    travelPlans: TravelPlan[];
    addTravelPlan: (country: Country, startDate: Date, endDate: Date) => void;
}

const TravelPlanCard: React.FC<{ plan: TravelPlan }> = ({ plan }) => {
    const getStatusInfo = () => {
        switch (plan.status) {
            case TravelPlanStatus.ACTIVE:
                return {
                    icon: <GlobeAmericasIcon className="w-5 h-5 text-green-600" />,
                    style: "bg-green-100 text-green-700",
                    label: "Active"
                };
            case TravelPlanStatus.UPCOMING:
                return {
                    icon: <CalendarDaysIcon className="w-5 h-5 text-blue-600" />,
                    style: "bg-blue-100 text-blue-700",
                    label: "Upcoming"
                };
            case TravelPlanStatus.COMPLETED:
                return {
                    icon: <VerifiedBadgeIcon className="w-5 h-5 text-slate-500" />,
                    style: "bg-slate-200 text-slate-600",
                    label: "Completed"
                };
        }
    };
    const { icon, style, label } = getStatusInfo();
    
    return (
        <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                    <img src={`https://flagcdn.com/w40/${plan.country.code.toLowerCase()}.png`} alt={plan.country.name} className="w-6" />
                    <div>
                        <h4 className="font-bold text-lg text-slate-800">{plan.country.name}</h4>
                        <p className="text-sm text-slate-500">
                            {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 text-xs font-semibold rounded-full ${style}`}>
                    {icon}
                    <span>{label}</span>
                </div>
            </div>
        </div>
    );
};

export const TravelCheckIn: React.FC<TravelCheckInProps> = ({ travelPlans, addTravelPlan }) => {
    const [country, setCountry] = useState<Country | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!country || !startDate || !endDate) {
            setError('All fields are required.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            setError('End date must be after the start date.');
            return;
        }
        addTravelPlan(country, start, end);
        setCountry(null);
        setStartDate('');
        setEndDate('');
    };

    const upcomingPlans = travelPlans.filter(p => p.status === TravelPlanStatus.UPCOMING);
    const activePlans = travelPlans.filter(p => p.status === TravelPlanStatus.ACTIVE);
    const completedPlans = travelPlans.filter(p => p.status === TravelPlanStatus.COMPLETED);
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Travel Check-In</h2>
                <p className="text-sm text-slate-500 mt-1">Notify us of your travel plans to ensure uninterrupted access to your funds.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 bg-slate-200 rounded-2xl shadow-digital">
                    <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">Add a New Trip</h3>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-slate-700">Destination</label>
                             <CountrySelector 
                                selectedCountry={country || { name: 'Select a country', code: '', currency: '', symbol: ''}}
                                onSelect={setCountry}
                                // FIX: Removed invalid 'dropdownClassName' prop.
                                className="w-full flex items-center justify-between bg-slate-200 p-3 rounded-md shadow-digital-inset text-left mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700">Start Date</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary" required />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700">End Date</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 w-full bg-slate-200 p-3 rounded-md shadow-digital-inset focus:ring-2 focus:ring-primary" required />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <button type="submit" className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <PlusCircleIcon className="w-5 h-5" />
                            <span>Add Travel Plan</span>
                        </button>
                    </form>
                </div>
                
                <div className="lg:col-span-2 bg-slate-200 rounded-2xl shadow-digital">
                     <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">My Travel Plans</h3>
                     <div className="p-6 space-y-6">
                        {(activePlans.length > 0 || upcomingPlans.length > 0) ? (
                            <>
                                {activePlans.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-600">Active</h4>
                                        {activePlans.map(p => <TravelPlanCard key={p.id} plan={p} />)}
                                    </div>
                                )}
                                {upcomingPlans.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-slate-600">Upcoming</h4>
                                        {upcomingPlans.map(p => <TravelPlanCard key={p.id} plan={p} />)}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <MapPinIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                                <p className="font-semibold">No active or upcoming trips</p>
                                <p className="text-sm">Add a new trip to get started.</p>
                            </div>
                        )}
                        
                        {completedPlans.length > 0 && (
                            <details>
                                <summary className="cursor-pointer text-sm font-semibold text-slate-600">View Past Trips</summary>
                                <div className="space-y-3 mt-3">
                                    {completedPlans.map(p => <TravelPlanCard key={p.id} plan={p} />)}
                                </div>
                            </details>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};