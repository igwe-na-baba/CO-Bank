import React, { useState, useMemo } from 'react';
import { Flight, FlightBooking, Airport, Account, View } from '../types';
import { AIRPORTS } from '../constants';
import { AirplaneTicketIcon, ArrowLongRightIcon, UsersIcon, CalendarDaysIcon, SpinnerIcon, ShieldCheckIcon, QuestionMarkCircleIcon, InfoIcon, XIcon } from './Icons';
import { USER_PIN } from '../constants';

interface FlightsProps {
    bookings: FlightBooking[];
    onBookFlight: (booking: Omit<FlightBooking, 'id' | 'bookingDate' | 'status'>, sourceAccountId: string) => boolean;
    accounts: Account[];
    setActiveView: (view: View) => void;
}

const FlightDetailsModal: React.FC<{ flight: Flight; onClose: () => void; onBook: () => void; }> = ({ flight, onClose, onBook }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 w-full max-w-2xl m-4 relative animate-fade-in-up">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        <img src={flight.airlineLogo} alt={flight.airline} className="w-12 h-12 rounded-lg" loading="lazy" />
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{flight.airline}</h2>
                            <p className="text-sm text-slate-500 font-mono">Flight {flight.flightNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-primary rounded-full shadow-digital active:shadow-digital-inset">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-4xl font-bold text-slate-800">{flight.from.code}</p>
                            <p className="font-semibold text-slate-700">{flight.from.city}</p>
                            <p className="text-sm text-slate-500">{flight.from.name}</p>
                        </div>
                        <div className="flex-1 flex items-center mx-4 text-slate-400">
                             <div className="w-full h-px bg-slate-300 relative text-center">
                                <AirplaneTicketIcon className="w-8 h-8 bg-slate-200 px-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-slate-800">{flight.to.code}</p>
                            <p className="font-semibold text-slate-700">{flight.to.city}</p>
                            <p className="text-sm text-slate-500">{flight.to.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-200 rounded-lg shadow-digital-inset">
                        <div>
                            <p className="text-sm text-slate-500">Departure</p>
                            <p className="font-semibold text-slate-800">{flight.departureTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Arrival</p>
                            <p className="font-semibold text-slate-800">{flight.arrivalTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Duration</p>
                            <p className="font-semibold text-slate-800">{flight.duration}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Stops</p>
                            <p className="font-semibold text-slate-800">{flight.stops}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-300">
                         <div className="text-left">
                            <p className="text-sm text-slate-500">Price per passenger</p>
                            <p className="text-3xl font-bold text-primary">{flight.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                        <button onClick={onBook} className="px-6 py-3 text-lg font-bold text-white bg-primary rounded-lg shadow-md hover:shadow-lg">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-up {
                  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
              `}</style>
        </div>
    );
};


const FlightCard: React.FC<{ flight: Flight, onSelect: () => void }> = ({ flight, onSelect }) => (
    <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <img src={flight.airlineLogo} alt={flight.airline} className="w-6 h-6" loading="lazy" />
                <span className="text-sm font-semibold text-slate-600">{flight.airline} {flight.flightNumber}</span>
            </div>
            <span className="text-xs font-medium bg-slate-300 px-2 py-1 rounded-full">{flight.stops} stop{flight.stops !== 1 && 's'}</span>
        </div>
        <div className="flex items-center justify-between">
            <div className="text-center">
                <p className="font-bold text-xl text-slate-800">{flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-slate-500">{flight.from.code}</p>
            </div>
            <div className="flex-1 flex items-center mx-4">
                <div className="w-full h-px bg-slate-300 relative">
                    <ArrowLongRightIcon className="w-6 h-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-200 px-1" />
                </div>
            </div>
            <div className="text-center">
                <p className="font-bold text-xl text-slate-800">{flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm text-slate-500">{flight.to.code}</p>
            </div>
        </div>
        <div className="flex items-end justify-between pt-3 border-t border-slate-300">
            <p className="text-sm text-slate-500">Duration: {flight.duration}</p>
            <div className="text-right">
                <p className="text-2xl font-bold text-primary">{flight.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                <button onClick={onSelect} className="mt-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:shadow-lg">Select</button>
            </div>
        </div>
    </div>
);

const BookingConfirmationModal: React.FC<{ flight: Flight, passengers: number, accounts: Account[], onConfirm: (sourceAccountId: string) => boolean, onClose: () => void }> = ({ flight, passengers, accounts, onConfirm, onClose }) => {
    const [step, setStep] = useState<'review' | 'pay' | 'processing' | 'success'>('review');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');

    const totalPrice = flight.price * passengers;

    const handleConfirm = () => {
        setError('');
        if (pin !== USER_PIN) {
            setError('Incorrect PIN. Please try again.');
            return;
        }
        setStep('processing');
        setTimeout(() => {
            const success = onConfirm(sourceAccountId);
            if (success) {
                setStep('success');
            } else {
                setError('Booking failed. Please check your account balance.');
                setStep('pay');
            }
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4">
                {step === 'review' && <>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Review Your Flight</h2>
                    {/* Review content */}
                    <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset space-y-2">
                        <p><strong>From:</strong> {flight.from.city} ({flight.from.code})</p>
                        <p><strong>To:</strong> {flight.to.city} ({flight.to.code})</p>
                        <p><strong>Airline:</strong> {flight.airline}</p>
                        <p><strong>Passengers:</strong> {passengers}</p>
                        <p className="text-xl font-bold pt-2 border-t border-slate-300 mt-2">Total: {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg shadow-digital">Cancel</button>
                        <button onClick={() => setStep('pay')} className="px-4 py-2 text-white bg-primary rounded-lg shadow-md">Proceed to Pay</button>
                    </div>
                </>}
                {step === 'pay' && <>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Confirm Payment</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Pay From</label>
                            <select value={sourceAccountId} onChange={e => setSourceAccountId(e.target.value)} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset">
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nickname || acc.type} ({acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Enter PIN to Authorize</label>
                             <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className="w-full mt-1 p-3 bg-slate-200 rounded-md shadow-digital-inset text-center tracking-[1em]" placeholder="----" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={() => setStep('review')} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg shadow-digital">Back</button>
                        <button onClick={handleConfirm} disabled={pin.length !== 4} className="px-4 py-2 text-white bg-primary rounded-lg shadow-md disabled:bg-primary-300">Confirm Booking</button>
                    </div>
                </>}
                 {step === 'processing' && <div className="text-center p-8"><SpinnerIcon className="w-12 h-12 text-primary mx-auto" /><p className="mt-4 font-semibold">Confirming your booking...</p></div>}
                {step === 'success' && <div className="text-center p-8"><h2 className="text-2xl font-bold text-green-600">Booking Confirmed!</h2><p className="mt-2">Your flight is booked. Check your email for details.</p><button onClick={onClose} className="mt-4 px-6 py-2 text-white bg-primary rounded-lg shadow-md">Done</button></div>}
            </div>
        </div>
    );
};


export const Flights: React.FC<FlightsProps> = ({ bookings, onBookFlight, accounts, setActiveView }) => {
    const [searchParams, setSearchParams] = useState({ from: 'JFK', to: 'LHR', depart: '', passengers: 1 });
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Flight[]>([]);
    const [flightToBook, setFlightToBook] = useState<Flight | null>(null);
    const [viewingFlight, setViewingFlight] = useState<Flight | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);
        setSearchResults([]);

        // Simulate API call
        setTimeout(() => {
            const from = AIRPORTS.find(a => a.code === searchParams.from);
            const to = AIRPORTS.find(a => a.code === searchParams.to);
            if(from && to) {
                const results: Flight[] = Array.from({ length: 5 }).map((_, i) => {
                    const depart = new Date();
                    depart.setHours(6 + i * 2, Math.floor(Math.random()*60));
                    const arrive = new Date(depart.getTime() + (8 * 60 + Math.floor(Math.random()*60)) * 60 * 1000); // ~8h flight
                    return {
                        id: `fl_${Date.now()}_${i}`,
                        airline: ['Delta', 'British Airways', 'American', 'United', 'JetBlue'][i],
                        airlineLogo: `https://logo.clearbit.com/${['delta.com', 'ba.com', 'aa.com', 'united.com', 'jetblue.com'][i]}`,
                        flightNumber: `DL${100+i}`,
                        from,
                        to,
                        departureTime: depart,
                        arrivalTime: arrive,
                        duration: `${Math.floor(Math.random()*2)+7}h ${Math.floor(Math.random()*60)}m`,
                        price: 800 + Math.floor(Math.random()*400),
                        stops: Math.random() > 0.7 ? 1 : 0
                    };
                });
                setSearchResults(results);
            }
            setIsSearching(false);
        }, 1500);
    };
    
    const handleBook = (sourceAccountId: string) => {
        if (flightToBook) {
            return onBookFlight({ flight: flightToBook, passengers: searchParams.passengers, totalPrice: flightToBook.price * searchParams.passengers }, sourceAccountId);
        }
        return false;
    };

    return (
        <div className="space-y-8">
             {viewingFlight && (
                <FlightDetailsModal 
                    flight={viewingFlight} 
                    onClose={() => setViewingFlight(null)} 
                    onBook={() => {
                        setFlightToBook(viewingFlight);
                        setViewingFlight(null);
                    }}
                />
             )}
             {flightToBook && <BookingConfirmationModal flight={flightToBook} passengers={searchParams.passengers} accounts={accounts} onConfirm={handleBook} onClose={() => setFlightToBook(null)} />}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Book Flights</h2>
                    <p className="text-sm text-slate-500 mt-1">Search and book flights using your iCredit Union® account.</p>
                </div>
                 <button onClick={() => setActiveView('support')} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    <span>Need Help?</span>
                </button>
            </div>

            {/* Search Form */}
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                 <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                     <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">From</label>
                            <select value={searchParams.from} onChange={e => setSearchParams(p => ({...p, from: e.target.value}))} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset">
                                {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">To</label>
                            <select value={searchParams.to} onChange={e => setSearchParams(p => ({...p, to: e.target.value}))} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset">
                                {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Depart</label>
                            <input type="date" value={searchParams.depart} onChange={e => setSearchParams(p => ({...p, depart: e.target.value}))} className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Passengers</label>
                            <input type="number" value={searchParams.passengers} onChange={e => setSearchParams(p => ({...p, passengers: parseInt(e.target.value) || 1}))} min="1" className="w-full mt-1 bg-slate-200 p-3 rounded-md shadow-digital-inset" />
                        </div>
                    </div>
                     <button type="submit" disabled={isSearching} className="w-full py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:bg-primary-300 flex items-center justify-center">
                        {isSearching ? <SpinnerIcon className="w-5 h-5" /> : 'Search Flights'}
                    </button>
                </form>
            </div>

            {/* Search Results */}
            <div className="space-y-4">
                {isSearching && (
                    <div className="text-center p-8">
                        <SpinnerIcon className="w-10 h-10 text-primary mx-auto" />
                        <p className="mt-4 font-semibold text-slate-600">Finding the best flights for you...</p>
                    </div>
                )}
                {searchResults.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-800">Available Flights</h3>
                        {searchResults.map(flight => <FlightCard key={flight.id} flight={flight} onSelect={() => setViewingFlight(flight)} />)}
                    </div>
                )}
                 {!isSearching && searchResults.length === 0 && (
                    <div className="text-center p-8 bg-slate-200 rounded-lg shadow-digital-inset">
                        <AirplaneTicketIcon className="w-12 h-12 mx-auto text-slate-400 mb-2"/>
                        <p className="font-semibold text-slate-500">No flights found</p>
                        <p className="text-sm">Try adjusting your search criteria or check back later.</p>
                    </div>
                )}
            </div>

            {/* Existing Bookings */}
            {bookings.length > 0 && (
                <div className="bg-slate-200 rounded-2xl shadow-digital">
                    <h3 className="text-xl font-bold text-slate-800 p-6 border-b border-slate-300">My Bookings</h3>
                    <div className="p-6 space-y-4">
                        {bookings.map(booking => (
                            <div key={booking.id} className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                                <p className="font-bold">{booking.flight.from.city} to {booking.flight.to.city}</p>
                                <p className="text-sm text-slate-600">{booking.flight.airline} - {booking.bookingDate.toLocaleDateString()}</p>
                                <p className="text-sm font-semibold text-green-600">{booking.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};