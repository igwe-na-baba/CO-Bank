import React from 'react';
import { ExclamationTriangleIcon } from './Icons';

interface DeleteConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
  taskText: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onClose, onConfirm, taskText }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-200 rounded-2xl shadow-digital p-8 w-full max-w-md m-4 relative animate-fade-in-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 shadow-digital-inset">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Confirm Deletion</h2>
          <p className="text-slate-600 my-4">
            Are you sure you want to permanently delete this task?
          </p>
          <div className="font-semibold text-slate-700 bg-slate-300/50 p-3 rounded-lg shadow-inner break-words text-left">
            <p className="text-xs text-slate-500">Task to be deleted:</p>
            <p>"{taskText}"</p>
          </div>
          <p className="text-slate-600 my-4 text-sm">
            This action is final and cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow"
          >
            Delete Task
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-lg text-sm font-medium text-slate-700 bg-slate-200 shadow-digital active:shadow-digital-inset transition-shadow"
          >
            Cancel
          </button>
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