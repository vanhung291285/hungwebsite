
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi sự kiện cuộn chuột
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Xử lý cuộn lên đầu
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`
        fixed bottom-8 left-8 z-40 
        p-3 rounded-full shadow-xl 
        bg-gradient-to-tr from-blue-700 to-cyan-500 
        text-white 
        transition-all duration-500 ease-in-out transform
        hover:scale-110 hover:shadow-blue-500/50 hover:-translate-y-1
        focus:outline-none border-2 border-white/20
        flex items-center justify-center
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
      aria-label="Cuộn lên đầu trang"
      title="Lên đầu trang"
    >
      <ArrowUp size={24} strokeWidth={2.5} />
      
      {/* Hiệu ứng Pulse nhẹ xung quanh */}
      <span className="absolute flex h-full w-full">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20 ${isVisible ? 'block' : 'hidden'}`}></span>
      </span>
    </button>
  );
};
