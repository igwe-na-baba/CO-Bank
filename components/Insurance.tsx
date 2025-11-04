import React, { useState, useEffect } from 'react';
import { InsuranceProduct, NotificationType } from '../types';
import { getInsuranceProductDetails } from '../services/geminiService';
import { DevicePhoneMobileIcon, GlobeAltIcon, ShieldCheckIcon, SpinnerIcon, InfoIcon, CheckCircleIcon } from './Icons';

const InsuranceProductCard: React.FC<{ product: InsuranceProduct; addNotification: (type: NotificationType, title: string, message: string) => void; }> = ({ product, addNotification }) => {
    const [quoteStatus, setQuoteStatus] = useState<'idle' | 'requesting' | 'requested'>('idle');
    
    const getIcon = (name: string) => {
        if (name.includes('Transfer')) return <ShieldCheckIcon className="w-6 h-6 text-primary" />;
        if (name.includes('Travel')) return <GlobeAltIcon className="w-6 h-6 text-primary" />;
        if (name.includes('Device')) return <DevicePhoneMobileIcon className="w-6 h-6 text-primary" />;
        return <ShieldCheckIcon className="w-6 h-6 text-primary" />;
    };

    const handleGetQuote = () => {
        setQuoteStatus('requesting');
        setTimeout(() => {
            setQuoteStatus('requested');
            addNotification(NotificationType.INSURANCE, 'Quote Requested', `We've received your request for ${product.name}. An agent will contact you shortly.`);
        }, 1500);
    };

    return (
        <div className="bg-slate-200 rounded-2xl shadow-digital p-6 flex flex-col">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center shadow-digital">
                    {getIcon(product.name)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                </div>
            </div>
            <p className="text-sm text-slate-600 my-4 flex-grow">{product.description}</p>
            <div className="space-y-3 pt-4 border-t border-slate-300">
                {product.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{benefit}</p>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleGetQuote} 
                disabled={quoteStatus !== 'idle'}
                className="mt-6 w-full py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center disabled:bg-primary-300"
            >
                {quoteStatus === 'idle' && 'Get a Quote'}
                {quoteStatus === 'requesting' && <><SpinnerIcon className="w-5 h-5 mr-2"/> Requesting...</>}
                {quoteStatus === 'requested' && 'Request Received!'}
            </button>
        </div>
    );
};

const InsuranceSkeletonLoader: React.FC = () => (
    <div className="bg-slate-200 rounded-2xl shadow-digital p-6 animate-pulse">
        <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-slate-300 rounded-lg"></div>
            <div className="flex-1 space-y-2">
                 <div className="h-5 bg-slate-300 rounded w-3/4"></div>
            </div>
        </div>
        <div className="h-4 bg-slate-300 rounded w-full mt-4"></div>
        <div className="h-4 bg-slate-300 rounded w-5/6 mt-2"></div>
        <div className="h-10 bg-slate-300 rounded-lg w-full mt-6"></div>
    </div>
);


export const Insurance: React.FC<{ addNotification: (type: NotificationType, title: string, message: string) => void; }> = ({ addNotification }) => {
    const [products, setProducts] = useState<InsuranceProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const fetchInsuranceProducts = async () => {
            const productNames = ['Transfer Protection', 'Global Travel Insurance', 'Device Protection'];
            try {
                const results = await Promise.all(
                    productNames.map(name => getInsuranceProductDetails(name))
                );
                const fetchedProducts = results.map(r => r.product).filter((p): p is InsuranceProduct => p !== null);

                if (results.some(r => r.isError) && fetchedProducts.length === 0) {
                    setIsError(true);
                } else {
                    setProducts(fetchedProducts);
                }
            } catch (error) {
                console.error("Failed to fetch insurance products:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsuranceProducts();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Insurance & Protection</h2>
                <p className="text-sm text-slate-500 mt-1">Enhance your financial security with tailored protection plans from our trusted partners.</p>
            </div>
            <div className="bg-slate-200 rounded-2xl shadow-digital p-6 text-center">
                 <h3 className="text-xl font-bold text-slate-800">Peace of Mind, Powered by I-Shell Assurance</h3>
                 <p className="mt-2 text-slate-600 max-w-3xl mx-auto">
                    We've partnered with industry-leading insurer I-Shell Assurance to offer you exclusive protection products. Whether you're sending money, traveling, or just going about your day, we've got you covered.
                 </p>
            </div>
            {isLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <InsuranceSkeletonLoader />
                    <InsuranceSkeletonLoader />
                    <InsuranceSkeletonLoader />
                 </div>
            ) : isError ? (
                <div className="flex items-center space-x-3 text-yellow-700 bg-yellow-100 p-4 rounded-lg shadow-digital-inset">
                    <InfoIcon className="w-6 h-6" />
                    <p>Could not load insurance products at this time. Please try again later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => <InsuranceProductCard key={product.name} product={product} addNotification={addNotification} />)}
                </div>
            )}
        </div>
    );
};