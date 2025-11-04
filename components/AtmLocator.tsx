import React, { useState, useMemo } from 'react';
import { AtmLocation } from '../types';
import { ATM_LOCATIONS } from '../constants';
import { MapIcon, ListBulletIcon, CrosshairsIcon, SpinnerIcon, MapPinIcon } from './Icons';

// A simple distance calculator (Haversine formula approximation)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d * 0.621371; // convert to miles
}

export const AtmLocator: React.FC = () => {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [locations] = useState<AtmLocation[]>(ATM_LOCATIONS);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    const filteredLocations = useMemo(() => {
        const term = searchTerm.toLowerCase();
        let result = locations.filter(loc => 
            loc.name.toLowerCase().includes(term) ||
            loc.address.toLowerCase().includes(term) ||
            loc.city.toLowerCase().includes(term) ||
            loc.zip.toLowerCase().includes(term)
        );

        if (userLocation) {
            result.sort((a, b) => {
                const distA = getDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
                const distB = getDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
                return distA - distB;
            });
        }
        return result;
    }, [searchTerm, locations, userLocation]);

    const handleUseLocation = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setSearchTerm("Nearby");
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Could not get your location. Please check your browser permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    const AtmListItem: React.FC<{ loc: AtmLocation }> = ({ loc }) => {
        const distance = userLocation ? getDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng) : null;
        return (
            <div className="bg-slate-200 p-4 rounded-lg shadow-digital-inset">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-800">{loc.name}</p>
                        <p className="text-sm text-slate-600">{loc.address}</p>
                        <p className="text-xs text-slate-500">{loc.city}, {loc.state} {loc.zip}</p>
                    </div>
                    {distance !== null && (
                         <p className="text-sm font-semibold text-primary">{distance.toFixed(1)} mi</p>
                    )}
                </div>
                <div className="mt-2 text-xs font-semibold text-slate-500 bg-slate-300/50 inline-block px-2 py-1 rounded">
                    {loc.network}
                </div>
            </div>
        );
    };

    const MapView = () => (
        <div className="w-full h-96 bg-slate-300/50 rounded-lg shadow-digital-inset flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://www.openstreetmap.org/assets/map/HD-a73919283e74c7c88b64a317f2e53d53.png')" }}></div>
            <div className="text-center text-slate-500 z-10">
                <p className="font-bold">Interactive Map View</p>
                <p className="text-sm">(Simulation)</p>
                <p className="text-xs mt-2">{filteredLocations.length} locations found</p>
            </div>
            {filteredLocations.slice(0, 5).map(loc => (
                 <div key={loc.id} className="absolute text-red-500" style={{
                    left: `${(loc.lng - filteredLocations[0].lng) * 1000 + 50}%`,
                    top: `${(filteredLocations[0].lat - loc.lat) * 1000 + 50}%`,
                    transform: 'translate(-50%, -100%)'
                 }}>
                     <MapPinIcon className="w-8 h-8"/>
                 </div>
            ))}
        </div>
    );
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">ATM Locator</h2>
                <p className="text-sm text-slate-500 mt-1">Find iCredit Union® and partner ATMs near you.</p>
            </div>
            
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search address, city, or ZIP code"
                        className="w-full bg-slate-200 p-3 rounded-md shadow-digital-inset"
                    />
                    <button onClick={handleUseLocation} disabled={isLocating} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 rounded-md shadow-digital text-slate-700 font-semibold w-full md:w-auto">
                        {isLocating ? <SpinnerIcon className="w-5 h-5"/> : <CrosshairsIcon className="w-5 h-5"/>}
                        <span>Use current location</span>
                    </button>
                    <div className="flex items-center gap-2 p-1 bg-slate-300/50 rounded-md shadow-inner">
                        <button onClick={() => setViewMode('map')} className={`px-3 py-2 rounded ${viewMode === 'map' ? 'bg-white shadow' : ''}`}><MapIcon className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}><ListBulletIcon className="w-5 h-5"/></button>
                    </div>
                </div>

                {viewMode === 'map' ? <MapView /> : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {filteredLocations.map(loc => <AtmListItem key={loc.id} loc={loc} />)}
                    </div>
                )}
            </div>
        </div>
    );
};