import React, { useState, useEffect, useMemo } from 'react';
import { LoanProduct, LoanApplication, LoanApplicationStatus, NotificationType } from '../types';
import { getLoanProducts } from '../services/geminiService';
import { SpinnerIcon, InfoIcon, CheckCircleIcon, CashIcon, XIcon } from './Icons';

interface LoansProps {
    loanApplications: LoanApplication[];
    addLoanApplication: (application: Omit<LoanApplication, 'id' | 'status' | 'submittedDate'>) => void;
    addNotification: (type: NotificationType, title: string, message: string) => void;
}

const ApplicationDetailsModal: React.FC<{ application: LoanApplication; onClose: () => void }> = ({ application, onClose }) => {
    const statusStyles = {
        [LoanApplicationStatus.APPROVED]: 'bg-green-100 text-green-700',
        [LoanApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
        [LoanApplicationStatus.REJECTED]: 'bg-red-100 text-red-700',
    };

    const isRejected = application.status === LoanApplicationStatus.REJECTED;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-lg m-4 animate-fade-in-up">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Loan Application Details</h2>
                        <p className="text-sm text-slate-500">Application ID: {application.id}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-300">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-200 rounded-lg shadow-digital-inset grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Product</p>
                            <p className="font-semibold text-slate-800">{application.loanProduct.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Status</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[application.status]}`}>{application.status}</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Amount</p>
                            <p className="font-semibold text-slate-800 font-mono">{application.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Term</p>
                            <p className="font-semibold text-slate-800">{application.term} months</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Submitted</p>
                            <p className="font-semibold text-slate-800 text-xs">{application.submittedDate.toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-sm text-slate-500">Interest Rate</p>
                            <p className="font-semibold text-slate-800">{application.loanProduct.interestRate.min}% - {application.loanProduct.interestRate.max}% APR</p>
                        </div>
                    </div>
                    {isRejected && (
                        <div className="p-4 bg-red-100 text-red-800 rounded-lg shadow-digital-inset flex items-start space-x-3">
                            <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold">Reason for Decision</h4>
                                <p className="text-sm">Based on our automated review, this application did not meet our current lending criteria. Common reasons include credit history, debt-to-income ratio, or verification issues. This is a simulated response.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md">
                        Close
                    </button>
                </div>
                 <style>{`
                    @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                    @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    }
                    .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};


const LoanCalculator: React.FC<{ product: LoanProduct; onApply: (amount: number, term: number) => void }> = ({ product, onApply }) => {
    const [amount, setAmount] = useState(5000);
    const [term, setTerm] = useState(36);

    const monthlyPayment = useMemo(() => {
        const principal = amount;
        const rate = (product.interestRate.min + product.interestRate.max) / 2 / 100 / 12;
        const n = term;
        if (rate === 0) return principal / n;
        return (principal * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    }, [amount, term, product.interestRate]);

    return (
        <div className="bg-slate-200 p-6 rounded-2xl shadow-digital space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Estimate Your Loan</h3>
            <div>
                <label className="flex justify-between text-sm font-medium text-slate-700">
                    <span>Loan Amount</span>
                    <span className="font-bold text-primary">{amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </label>
                <input type="range" min="1000" max="50000" step="500" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label className="flex justify-between text-sm font-medium text-slate-700">
                    <span>Loan Term (Months)</span>
                    <span className="font-bold text-primary">{term} months</span>
                </label>
                <input type="range" min="12" max="60" step="1" value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div className="text-center pt-4 border-t border-slate-300">
                <p className="text-sm text-slate-600">Estimated Monthly Payment</p>
                <p className="text-3xl font-bold text-slate-800">{monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                <p className="text-xs text-slate-500 mt-1">Based on an average APR of {((product.interestRate.min + product.interestRate.max) / 2).toFixed(2)}%</p>
            </div>
            <button onClick={() => onApply(amount, term)} className="w-full py-3 mt-4 text-white bg-primary rounded-lg font-semibold shadow-md hover:shadow-lg transition-shadow">
                Apply for ${amount.toLocaleString()}
            </button>
        </div>
    );
};

const ProductCard: React.FC<{ product: LoanProduct; onSelect: () => void }> = ({ product, onSelect }) => (
    <div className="bg-slate-200 rounded-2xl shadow-digital p-6 flex flex-col">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center shadow-digital">
                <CashIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                <p className="text-sm font-semibold text-primary">{product.interestRate.min}% - {product.interestRate.max}% APR</p>
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
        <button onClick={onSelect} className="mt-6 w-full py-2 text-sm font-medium text-primary bg-slate-200 rounded-lg shadow-digital active:shadow-digital-inset transition-shadow">
            Calculate & Apply
        </button>
    </div>
);

const ApplicationRow: React.FC<{ application: LoanApplication; onViewDetails: () => void; }> = ({ application, onViewDetails }) => {
    const statusStyles = {
        [LoanApplicationStatus.APPROVED]: 'bg-green-100 text-green-700',
        [LoanApplicationStatus.PENDING]: 'bg-yellow-100 text-yellow-700',
        [LoanApplicationStatus.REJECTED]: 'bg-red-100 text-red-700',
    };
    return (
        <tr className="border-b border-slate-300 last:border-b-0">
            <td className="p-4">{application.submittedDate.toLocaleDateString()}</td>
            <td className="p-4 font-semibold text-slate-800">{application.loanProduct.name}</td>
            <td className="p-4 font-mono text-slate-700">{application.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
            <td className="p-4">{application.term} months</td>
            <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[application.status]}`}>{application.status}</span></td>
            <td className="p-4">
                <button onClick={onViewDetails} className="text-primary font-semibold text-sm hover:underline">
                    View Details
                </button>
            </td>
        </tr>
    );
};

export const Loans: React.FC<LoansProps> = ({ loanApplications, addLoanApplication, addNotification }) => {
    const [products, setProducts] = useState<LoanProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
    const [viewingApplication, setViewingApplication] = useState<LoanApplication | null>(null);


    useEffect(() => {
        const fetchProducts = async () => {
            const { products, isError } = await getLoanProducts();
            if (isError) {
                setIsError(true);
            } else {
                setProducts(products);
            }
            setIsLoading(false);
        };
        fetchProducts();
    }, []);

    const handleApply = (amount: number, term: number) => {
        if (selectedProduct) {
            addLoanApplication({ loanProduct: selectedProduct, amount, term });
            addNotification(
                NotificationType.LOAN,
                'Application Submitted',
                `Your application for a ${selectedProduct.name} has been submitted for review.`
            );
            setSelectedProduct(null); // Close the calculator view
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-10"><SpinnerIcon className="w-10 h-10 text-primary" /></div>;
    }
    if (isError) {
        return (
            <div className="flex items-center space-x-3 text-yellow-700 bg-yellow-100 p-4 rounded-lg shadow-digital-inset">
                <InfoIcon className="w-6 h-6" />
                <p>Could not load loan products at this time. Please try again later.</p>
            </div>
        );
    }
    
    return (
        <>
            {viewingApplication && <ApplicationDetailsModal application={viewingApplication} onClose={() => setViewingApplication(null)} />}
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Loans & Credit</h2>
                    <p className="text-sm text-slate-500 mt-1">Access flexible financing options tailored to your needs.</p>
                </div>

                {selectedProduct ? (
                    <div>
                        <button onClick={() => setSelectedProduct(null)} className="mb-4 text-sm font-semibold text-primary">&larr; Back to all loans</button>
                        <LoanCalculator product={selectedProduct} onApply={handleApply} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => <ProductCard key={product.id} product={product} onSelect={() => setSelectedProduct(product)} />)}
                    </div>
                )}
                
                {loanApplications.length > 0 && (
                    <div className="bg-slate-200 rounded-2xl shadow-digital">
                        <div className="p-6 border-b border-slate-300">
                            <h2 className="text-xl font-bold text-slate-800">My Loan Applications</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Product</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Term</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loanApplications.map(app => <ApplicationRow key={app.id} application={app} onViewDetails={() => setViewingApplication(app)} />)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};