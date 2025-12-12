import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error';

export interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4">
      {/* Container - pointer-events-auto allows clicking the notification while passing through clicks elsewhere */}
      <div className="pointer-events-auto bg-white rounded-xl shadow-2xl border border-slate-100 p-5 max-w-sm w-full animate-scale-in flex items-start gap-4">
        
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
        </div>

        {/* Content */}
        <div className="flex-1 pt-1">
          <h4 className={`font-bold text-sm uppercase tracking-wide mb-1 ${type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {type === 'success' ? 'Success' : 'Error'}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full -mt-1 -mr-2"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};