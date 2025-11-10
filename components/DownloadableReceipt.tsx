import React from 'react';
import { Transaction, Account, TransactionStatus } from '../types';
import { ICreditUnionLogo } from './Icons';
import { USER_PROFILE } from '../constants';

interface DownloadableReceiptProps {
  transaction: Transaction;
  sourceAccount: Account;
}

export const DownloadableReceipt: React.FC<DownloadableReceiptProps> = ({ transaction, sourceAccount }) => {
    const totalDebited = transaction.sendAmount + transaction.fee;
    const isCompleted = transaction.status === 'Funds Arrived';
    const isCredit = transaction.type === 'credit';
    const submissionDate = transaction.statusTimestamps[TransactionStatus.SUBMITTED];
    const formattedDateTime = submissionDate.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short'
    });

    return (
        <div className="w-[800px] bg-white text-gray-800 p-10 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                <div className="flex items-center space-x-3">
                    <ICreditUnionLogo />
                    <h1 className="text-3xl font-bold text-gray-900">iCredit Union®</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold">Official Wire Transfer Receipt</h2>
                    <p className="text-sm text-gray-500">Date Issued: {formattedDateTime}</p>
                </div>
            </div>

            <div className="mt-8">
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-lg font-mono tracking-wider">{transaction.id}</p>
            </div>

            {/* Transfer Path */}
             <div className="mt-8 p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-semibold text-gray-500 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Transfer Path</h3>
                <div className="flex items-center justify-between text-center">
                    <div className="w-2/5">
                        <img src={`https://flagsapi.com/US/shiny/64.png`} alt="USA Flag" className="w-8 mx-auto mb-1 rounded" />
                        <p className="font-semibold text-gray-800 truncate">New York, USA</p>
                        <p className="text-xs text-gray-500">Origin</p>
                    </div>
                    <div className="w-1/5 text-gray-400 text-2xl font-light">
                        &rarr;
                    </div>
                    <div className="w-2/5">
                        <img src={`https://flagsapi.com/${transaction.recipient.country.code}/shiny/64.png`} alt={`${transaction.recipient.country.name} Flag`} className="w-8 mx-auto mb-1 rounded" />
                        <p className="font-semibold text-gray-800 truncate">{transaction.recipient.city}, {transaction.recipient.country.code}</p>
                        <p className="text-xs text-gray-500">Destination</p>
                    </div>
                </div>
            </div>

            {/* From/To Details */}
            <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2 text-sm uppercase tracking-wider">Sender Details</h3>
                    <p className="font-bold">{USER_PROFILE.name}</p>
                    <p className="text-sm text-gray-600">{sourceAccount.nickname}</p>
                    <p className="text-sm text-gray-600 font-mono">Acct: {sourceAccount.fullAccountNumber}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-500 border-b pb-2 mb-2 text-sm uppercase tracking-wider">Recipient Details</h3>
                    <p className="font-bold">{transaction.recipient.fullName}</p>
                    <p className="text-sm text-gray-600">{transaction.recipient.bankName}</p>
                    <p className="text-sm text-gray-600 font-mono">Acct: {transaction.recipient.realDetails.accountNumber}</p>
                    <p className="text-sm text-gray-600 font-mono">SWIFT/BIC: {transaction.recipient.realDetails.swiftBic}</p>
                </div>
            </div>

            {/* Financial Breakdown */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y">
                            <tr className="bg-gray-50"><td className="p-3 text-gray-600">Amount Sent</td><td className="p-3 text-right font-mono">{transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                            {!isCredit && <tr><td className="p-3 text-gray-600">Transfer Fee</td><td className="p-3 text-right font-mono">{transaction.fee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>}
                            {!isCredit && transaction.exchangeRate !== 1 && (
                                <>
                                <tr><td className="p-3 text-gray-600">Exchange Rate</td><td className="p-3 text-right font-mono">1 USD = {transaction.exchangeRate.toFixed(4)} {transaction.receiveCurrency}</td></tr>
                                <tr className="bg-gray-50"><td className="p-3 text-gray-600 font-bold">Recipient Receives (Est.)</td><td className="p-3 text-right font-mono font-bold">{transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.receiveCurrency })}</td></tr>
                                </>
                            )}
                            <tr className="bg-gray-100 font-bold"><td className="p-4">Total {isCredit ? 'Credited' : 'Debited'}</td><td className="p-4 text-right font-mono text-lg">{totalDebited.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* QR Code and Stamp */}
            <div className="mt-8 flex justify-between items-end">
                 <div className="text-left">
                    <img src={`https://quickchart.io/qr?text=iCU-Txn-${transaction.id}&size=100`} alt="Transaction QR Code" className="w-24 h-24" />
                    <p className="text-xs text-gray-500 mt-1">Scan for details</p>
                 </div>
                 <div className="relative w-48 h-24 flex items-center justify-center">
                    {isCompleted && (
                        <div className="stamp stamp-red" style={{width: 140, height: 140, opacity: 0.75}}>
                            <div className="stamp-inner">
                                <div className="text-lg leading-tight">Verified</div>
                                <div className="text-[10px] my-1">{submissionDate.toLocaleDateString()}</div>
                                <div className="text-[10px] tracking-normal">iCredit Union®</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 border-t-2 border-gray-200 pt-4 text-center text-xs text-gray-500">
                <p>Thank you for banking with iCredit Union®. This is an automated receipt and does not require a signature.</p>
                <p>If you have any questions, please contact our support team. NMLS ID #9999999.</p>
            </div>
        </div>
    );
};