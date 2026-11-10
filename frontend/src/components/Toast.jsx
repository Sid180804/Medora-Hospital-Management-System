import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-[#EBF7F2] border-[#C2E8D7] text-[#0E5B57]',
      icon: <CheckCircle2 className="w-5 h-5 text-[#126C68] shrink-0" />,
    },
    error: {
      bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />,
    },
    info: {
      bg: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]',
      icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
    },
  }[type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in max-w-md">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${styles.bg}`}>
        {styles.icon}
        <div className="flex-1 text-sm font-medium leading-snug">
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
