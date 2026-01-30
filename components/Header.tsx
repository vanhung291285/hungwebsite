
import React, { useState } from 'react';
import { SchoolConfig, MenuItem } from '../types';
import { Menu, X, GraduationCap, Phone, Mail, Facebook, Youtube, Globe, UserPlus } from 'lucide-react';

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
      <div className="bg-[#1e3a8a] text-white py-2 px-4 text-sm border-b border-blue-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-6 opacity-95 font-medium">
             <span className="flex items-center gap-2"><Phone size={14} className="text-yellow-400"/> Hotline: <strong className="text-base">{config.hotline || config.phone}</strong></span>
             <span className="hidden md:inline text-blue-400">|</span>
             <span className="flex items-center gap-2"><Mail size={14} className="text-yellow-400"/> {config.email}</span>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:inline opacity-80 italic text-xs lg:text-sm">Cổng thông tin điện tử chính thức</span>
             <div className="flex gap-3 ml-2 border-l border-blue-700 pl-3">
                {config.facebook && <a href={config.facebook} target="_blank" rel="noreferrer" className="hover:text-yellow-300 transform hover:scale-110 transition"><Facebook size={18}/></a>}
                {config.youtube && <a href={config.youtube} target="_blank" rel="noreferrer" className="hover:text-red-400 transform hover:scale-110 transition"><Youtube size={18}/></a>}
             </div>
          </div>
        </div>
      </div>

      {/* 2. BRANDING AREA: Logo & Name (White with Background Pattern) */}
      <div 
        className="bg-white relative transition-all duration-300 min-h-[180px] flex items-center shadow-inner"
        style={{ 
            backgroundImage: hasBanner ? `url(${config.bannerUrl})` : 'url("https://www.transparenttextures.com/patterns/cubes.png")',
            backgroundSize: hasBanner ? 'cover' : 'auto',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'white' // Fallback
        }}
      >
         {/* Gradient Overlay: Adjusted to be clearer (less opaque) */}
         {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent"></div>}
         
         <div className="container mx-auto px-4 py-4 relative z-10">
            <div className="flex justify-between items-center">
                {/* Logo Area */}
                <div 
                    className="flex items-center gap-5 cursor-pointer group" 
                    onClick={() => handleNav('home')}
                >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-900 shadow-xl border-4 border-yellow-400 p-1 shrink-0 overflow-hidden transform group-hover:rotate-3 transition duration-500">
                    {config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <GraduationCap size={56} />
                    )}
                    </div>
                    <div className="flex flex-col">
                        <h1 
                            className="text-2xl md:text-4xl lg:text-5xl font-extrabold uppercase leading-tight text-blue-900 drop-shadow-sm tracking-tight group-hover:text-blue-800 transition"
                            style={{ fontFamily: "'Times New Roman', Times, serif", textShadow: "2px 2px 4px rgba(255,255,255,0.9)" }}
                        >
                            {config.name}
                        </h1>
                        <p className="text-base md:text-lg font-bold text-red-600 mt-2 uppercase tracking-wide inline-block pt-1 max-w-fit font-sans" style={{ textShadow: "1px 1px 0 #fff" }}>
                            {config.slogan || 'Trách nhiệm - Yêu thương - Sáng tạo'}
                        </p>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className="lg:hidden p-3 rounded-lg text-blue-900 hover:bg-white/50 border-2 border-blue-900/10 backdrop-blur-sm transition"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={36} /> : <Menu size={36} />}
                </button>
            </div>
         </div>
      </div>

      {/* 3. NAVIGATION BAR (Sticky Blue) */}
      <div className="bg-[#0f4c81] shadow-lg border-t-4 border-yellow-500 sticky top-0 z-40">
         <div className="container mx-auto px-0 lg:px-4">
            <nav className="hidden lg:flex items-center justify-between">
               {/* Main Menu Items - Allow horizontal scroll if needed, preventing wrapping */}
               <div className="flex flex-1 items-center overflow-x-auto no-scrollbar">
                   {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`
                          shrink-0 whitespace-nowrap 
                          px-5 lg:px-6 
                          py-5 
                          text-sm lg:text-base 
                          font-extrabold uppercase 
                          transition-all duration-200 
                          border-r border-blue-800/50 
                          hover:bg-yellow-500 hover:text-blue-900 
                          ${
                            activePath === item.path || (activePath === 'news-detail' && item.path === 'news')
                              ? 'bg-blue-800 text-yellow-400 border-b-4 border-yellow-400' 
                              : 'text-white border-b-4 border-transparent hover:shadow-inner'
                          }
                        `}
                      >
                        {item.label}
                      </button>
                   ))}
               </div>
               
               {/* REGISTER BUTTON ADDED HERE */}
               <button 
                  onClick={() => handleNav('register')} 
                  className="shrink-0 ml-auto lg:ml-2 px-6 lg:px-8 py-5 text-sm lg:text-base font-extrabold uppercase bg-orange-600 text-white hover:bg-orange-700 transition-colors flex items-center gap-2 border-l-2 border-orange-800 shadow-lg whitespace-nowrap"
                  title="Đăng ký thành viên"
               >
                 <UserPlus size={18}/> <span className="hidden xl:inline">ĐĂNG KÝ</span>
               </button>
            </nav>
         </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-2xl absolute w-full top-full z-50 animate-fade-in">
          <div className="flex flex-col divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`text-left font-bold p-5 uppercase text-base ${
                  activePath === item.path ? 'bg-blue-50 text-blue-800 border-l-8 border-blue-600' : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* MOBILE REGISTER LINK */}
            <button 
               onClick={() => handleNav('register')}
               className="text-left font-bold p-5 text-orange-600 hover:bg-orange-50 flex items-center gap-2 bg-orange-50/50 text-base border-t-4 border-orange-100"
            >
               <UserPlus size={20}/> ĐĂNG KÝ THÀNH VIÊN
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
