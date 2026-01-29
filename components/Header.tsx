import React, { useState } from 'react';
import { SchoolConfig, MenuItem } from '../types';
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react';

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
    <header className="bg-white shadow-md sticky top-0 z-50 font-sans">
      {/* Top Bar - Brand Color */}
      <div className="bg-blue-900 text-white py-2 px-4 text-xs">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-2 md:gap-0">
          <span className="opacity-90 font-medium">Cổng thông tin điện tử chính thức</span>
          <div className="flex space-x-4 opacity-90">
             <span>Hotline: {config.hotline || config.phone}</span>
             <span className="hidden md:inline">|</span>
             <span className="hidden md:inline">{config.email}</span>
          </div>
        </div>
      </div>

      {/* Main Header / Banner Section */}
      <div 
        className="relative w-full transition-all duration-300 bg-center bg-cover bg-no-repeat"
        style={{ 
            backgroundImage: hasBanner ? `url(${config.bannerUrl})` : 'none',
            backgroundColor: hasBanner ? 'transparent' : '#ffffff',
            height: hasBanner ? 'auto' : 'auto'
        }}
      >
        {/* Overlay if banner exists to make text readable */}
        {hasBanner && <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>}

        <div className={`container mx-auto px-4 relative z-10 ${hasBanner ? 'py-8 md:py-12' : 'py-4 md:py-6'}`}>
            <div className="flex justify-between items-center">
            {/* Logo Area */}
            <div 
                className="flex items-center space-x-3 md:space-x-5 cursor-pointer group" 
                onClick={() => handleNav('home')}
            >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-blue-900 shadow-lg group-hover:shadow-xl transition-all overflow-hidden p-1 shrink-0">
                {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                    <GraduationCap size={40} className="md:w-12 md:h-12" />
                )}
                </div>
                <div className="flex flex-col">
                    <h1 className={`text-sm md:text-2xl lg:text-3xl font-bold uppercase leading-tight tracking-tight drop-shadow-sm ${hasBanner ? 'text-white' : 'text-blue-900'}`}>
                        {config.name}
                    </h1>
                    <p className={`text-xs md:text-sm font-medium tracking-wide mt-1 uppercase ${hasBanner ? 'text-blue-100' : 'text-gray-500'}`}>
                        {config.slogan || 'TRÁCH NHIỆM - YÊU THƯƠNG - SÁNG TẠO'}
                    </p>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className={`lg:hidden p-2 rounded ${hasBanner ? 'text-white hover:bg-white/20' : 'text-blue-900 hover:bg-blue-50'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
            </div>
        </div>
      </div>

      {/* Navigation Bar (Desktop) */}
      <div className="hidden lg:block bg-blue-800 text-white border-t border-blue-700 shadow-md">
         <div className="container mx-auto px-4">
            <nav className="flex space-x-1 flex-wrap">
               {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.path)}
                    className={`px-6 py-3.5 text-sm font-bold uppercase transition-colors duration-200 hover:bg-blue-700 border-r border-blue-700/50 ${
                      activePath === item.path || (activePath === 'news-detail' && item.path === 'news')
                        ? 'bg-blue-700 text-yellow-300' 
                        : 'text-white'
                    }`}
                  >
                    {item.label}
                  </button>
               ))}
               <button onClick={() => handleNav('login')} className="ml-auto px-6 py-3.5 text-sm font-bold uppercase bg-red-700 hover:bg-red-800 transition-colors flex items-center">
                 Đăng nhập
               </button>
            </nav>
         </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full z-50 animate-fade-in">
          <div className="flex flex-col">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`text-left font-semibold p-4 border-b border-gray-50 ${
                  activePath === item.path ? 'bg-blue-50 text-blue-800' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
               onClick={() => handleNav('login')}
               className="text-left font-bold p-4 text-red-600 hover:bg-red-50"
            >
               ĐĂNG NHẬP HỆ THỐNG
            </button>
          </div>
        </div>
      )}
    </header>
  );
};