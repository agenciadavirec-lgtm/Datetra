import React from 'react';
import { Send, Download, QrCode, ArrowDownToLine, ArrowUpFromLine, Layers } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SendQrIcon: React.FC<IconProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: { main: 'w-4 h-4', qr: 'w-2.5 h-2.5', badge: '-bottom-1 -right-1 p-0.5' },
    md: { main: 'w-5 h-5', qr: 'w-3 h-3', badge: '-bottom-1 -right-1 p-0.5' },
    lg: { main: 'w-6 h-6', qr: 'w-3.5 h-3.5', badge: '-bottom-1.5 -right-1.5 p-1' }
  };

  const current = iconSizes[size];

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Send className={`${current.main}`} />
      <span className={`absolute ${current.badge} rounded-md bg-amber-500 text-slate-950 font-bold shadow-xs border border-white dark:border-zinc-900 flex items-center justify-center`}>
        <QrCode className={`${current.qr}`} />
      </span>
    </div>
  );
};

export const ReceiveQrIcon: React.FC<IconProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: { main: 'w-4 h-4', qr: 'w-2.5 h-2.5', badge: '-bottom-1 -right-1 p-0.5' },
    md: { main: 'w-5 h-5', qr: 'w-3 h-3', badge: '-bottom-1 -right-1 p-0.5' },
    lg: { main: 'w-6 h-6', qr: 'w-3.5 h-3.5', badge: '-bottom-1.5 -right-1.5 p-1' }
  };

  const current = iconSizes[size];

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Download className={`${current.main}`} />
      <span className={`absolute ${current.badge} rounded-md bg-blue-500 text-white font-bold shadow-xs border border-white dark:border-zinc-900 flex items-center justify-center`}>
        <QrCode className={`${current.qr}`} />
      </span>
    </div>
  );
};

export const TransferQrIcon: React.FC<IconProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: { main: 'w-4 h-4', qr: 'w-2.5 h-2.5', badge: '-bottom-1 -right-1 p-0.5' },
    md: { main: 'w-5 h-5', qr: 'w-3 h-3', badge: '-bottom-1 -right-1 p-0.5' },
    lg: { main: 'w-6 h-6', qr: 'w-3.5 h-3.5', badge: '-bottom-1.5 -right-1.5 p-1' }
  };

  const current = iconSizes[size];

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Layers className={`${current.main}`} />
      <span className={`absolute ${current.badge} rounded-md bg-emerald-500 text-white font-bold shadow-xs border border-white dark:border-zinc-900 flex items-center justify-center`}>
        <QrCode className={`${current.qr}`} />
      </span>
    </div>
  );
};
