
import React from 'react';
import { SchoolConfig } from '../types';
import { Phone, Facebook, MessageCircle } from 'lucide-react';

interface FloatingContactProps {
  config: SchoolConfig;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ config }) => {
  // Lấy số điện thoại (ưu tiên hotline)
  const phone = config.hotline || config.phone;
  // Giả sử link zalo là https://zalo.me/sdt
  const zaloLink = `https://zalo.me/${phone?.replace(/\D/g, '')}`;
  
  if (!phone) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-center group">
      
      {/* 1. Facebook Button */}
      {config.facebook && (
        <a 
          href={config.facebook} 
          target="_blank" 
          rel="noreferrer"
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 relative group/btn"
          title="Ghé thăm Fanpage"
        >
           <Facebook size={24} fill="currentColor" />
           <span className="absolute right-14 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition whitespace-nowrap pointer-events-none">
              Fanpage
           </span>
        </a>
      )}

      {/* 2. Zalo Button */}
      <a 
        href={zaloLink} 
        target="_blank" 
        rel="noreferrer"
        className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 relative group/btn border-2 border-white"
        title="Chat Zalo"
      >
         {/* Giả lập icon Zalo bằng chữ hoặc icon Message */}
         <div className="font-bold text-[10px] leading-tight flex flex-col items-center">
            <span className="text-sm font-extrabold">Zalo</span>
         </div>
         <span className="absolute right-14 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition whitespace-nowrap pointer-events-none">
            Chat Zalo
         </span>
      </a>

      {/* 3. Phone Button (Main Pulse) */}
      <div className="relative">
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
        <a 
            href={`tel:${phone}`}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300 relative z-10 border-2 border-white"
            title={`Gọi ngay: ${phone}`}
        >
            <Phone size={28} className="animate-pulse" />
        </a>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-l-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            {phone}
        </span>
      </div>

    </div>
  );
};
