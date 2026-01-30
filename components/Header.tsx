
import React, { useState } from 'react';
import { SchoolConfig, MenuItem } from '../types';
import { Menu, X, GraduationCap, Phone, Mail, Facebook, Youtube, Globe, LogIn } from 'lucide-react';

interface HeaderProps {
  config: SchoolConfig;
  menuItems: MenuItem[];
  onNavigate: (path: string) => void;
  activePath: string;
}

export const Header: React.FC<HeaderProps> = ({ config, menuItems, onNavigate, activePath }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNav = (path: string) => {
    // If path starts with http/https, open in new tab
    if (path.startsWith('http')) {
       window.open(path, '_blank');
    } else {
       onNavigate(path);
    }
    setIsMenuOpen(false);
  };

  const hasBanner = !!config.bannerUrl;

  return (
    <header className="font-sans flex flex-col shadow-md relative z-50">
      {/* 1. TOP BAR: Contact & Socials (Dark Blue) */}
      <div className="bg-[#1e3a8a] text-white py-1.5 px-4 text-xs border-b border-blue-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-4 opacity-90">
             <span className="flex items-center gap-1"><Phone size={12} className="text-yellow-400"/> Hotline: <strong>{config.hotline || config.phone}</strong></span>
             <span className="hidden md:inline text-blue-400">|</span>
             <span className="flex items-center gap-1"><Mail size={12} className="text-yellow-400"/> {config.email}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:inline opacity-70 italic">Chào mừng đến với Cổng thông tin điện tử {config.name}</span>
             <div className="flex gap-2 ml-2 border-l border-blue-700 pl-2">
                {config.facebook && <a href={config.facebook} target="_blank" rel="noreferrer" className="hover:text-yellow-300"><Facebook size={14}/></a>}
                {config.youtube && <a href={config.youtube} target="_blank" rel="noreferrer" className="hover:text-red-400"><Youtube size={14}/></a>}
             </div>
          </div>
        </div>
      </div>

      {/* 2. BRANDING AREA: Logo & Name (White with Background Pattern) */}
      <div 
        className="bg-white relative transition-all duration-300"
        style={{ 
            backgroundImage: hasBanner ? `url(${config.bannerUrl})` : 'url("https://www.transparenttextures.com/patterns/cubes.png")',
            backgroundSize: hasBanner ? 'cover' : 'auto',
            backgroundPosition: 'center',
            backgroundColor: 'white' // Fallback
        }}
      >
         {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>}
         
         <div className="container mx-auto px-4 py-6 relative z-10">
            <div className="flex justify-between items-center">
                {/* Logo Area */}
                <div 
                    className="flex items-center gap-4 cursor-pointer group" 
                    onClick={() => handleNav('home')}
                >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-lg border-2 border-yellow-400 p-1 shrink-0 overflow-hidden">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <GraduationCap size={48} />
                    )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl md:text-3xl font-extrabold uppercase leading-tight text-blue-900 drop-shadow-sm font-serif tracking-tight">
                            {config.name}
                        </h1>
                        <p className="text-sm font-bold text-red-600 mt-1 uppercase tracking-wide border-t border-gray-300 inline-block pt-1 max-w-fit">
                            {config.slogan || 'Trách nhiệm - Yêu thương - Sáng tạo'}
                        </p>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="lg:hidden p-2 rounded text-blue-900 hover:bg-blue-50 border border-blue-200"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>
         </div>
      </div>

      {/* 3. NAVIGATION BAR (Sticky Blue) */}
      <div className="bg-[#0f4c81] shadow-lg border-t-4 border-yellow-500 sticky top-0 z-40">
         <div className="container mx-auto px-4">
            <nav className="hidden lg:flex items-center justify-between">
               <div className="flex space-x-1">
                   {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`px-5 py-4 text-sm font-extrabold uppercase transition-all duration-200 border-r border-blue-800/50 hover:bg-yellow-500 hover:text-blue-900 ${
                          activePath === item.path || (activePath === 'news-detail' && item.path === 'news')
                            ? 'bg-blue-800 text-yellow-400 border-b-4 border-yellow-400' 
                            : 'text-white border-b-4 border-transparent hover:shadow-inner'
                        }`}
                      >
                        {item.label}
                      </button>
                   ))}
               </div>
               
               <button 
                  onClick={() => handleNav('login')} 
                  className="px-6 py-4 text-sm font-extrabold uppercase bg-[#b91c1c] text-white hover:bg-red-800 transition-colors flex items-center gap-2 border-l-2 border-red-900 shadow-lg"
                  title="Đăng nhập quản trị"
               >
                 <LogIn size={16}/> <span className="hidden xl:inline">Đăng nhập</span>
               </button>
            </nav>
         </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full top-full z-50 animate-fade-in">
          <div className="flex flex-col divide-y divide-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`text-left font-bold p-4 uppercase text-sm ${
                  activePath === item.path ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-600' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
               onClick={() => handleNav('login')}
               className="text-left font-bold p-4 text-red-600 hover:bg-red-50 flex items-center gap-2 bg-red-50/50"
            >
               <LogIn size={18}/> ĐĂNG NHẬP HỆ THỐNG
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
