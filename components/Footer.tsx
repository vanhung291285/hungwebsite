
import React from 'react';
import { SchoolConfig } from '../types';
import { MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  config: SchoolConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-blue-900 text-white pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Info */}
          <div>
            <h3 className="text-xl font-bold uppercase mb-5 border-b border-blue-700 pb-3 inline-block">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-4 text-base text-blue-100">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="mt-1 flex-shrink-0" />
                <span className="leading-relaxed">{config.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} />
                <span className="font-bold">{config.phone} {config.hotline && `- ${config.hotline}`}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} />
                <span>{config.email}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-xl font-bold uppercase mb-5 border-b border-blue-700 pb-3 inline-block">
              Liên kết
            </h3>
            <ul className="space-y-3 text-base text-blue-100">
              <li><a href="https://moet.gov.vn/" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition">Bộ Giáo dục & Đào tạo</a></li>
              <li><a href="http://sogddt.dienbien.gov.vn/" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition">Sở Giáo dục và Đào tạo Điện Biên</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition">Cổng thông tin tuyển sinh</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition">Tài nguyên học tập số</a></li>
            </ul>
          </div>

          {/* Column 3: Stats/Social */}
          <div>
            <h3 className="text-xl font-bold uppercase mb-5 border-b border-blue-700 pb-3 inline-block">
              Mạng xã hội
            </h3>
            <div className="flex space-x-5 mb-8">
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noreferrer" className="bg-blue-800 p-3 rounded-full hover:bg-blue-700 transition shadow-lg transform hover:scale-110">
                  <Facebook size={24} />
                </a>
              )}
              {config.youtube && (
                <a href={config.youtube} target="_blank" rel="noreferrer" className="bg-red-800 p-3 rounded-full hover:bg-red-700 transition shadow-lg transform hover:scale-110">
                  <Youtube size={24} />
                </a>
              )}
              {config.website && (
                <a href={config.website} target="_blank" rel="noreferrer" className="bg-teal-800 p-3 rounded-full hover:bg-teal-700 transition shadow-lg transform hover:scale-110">
                  <Globe size={24} />
                </a>
              )}
            </div>
            <p className="text-sm text-blue-300 leading-relaxed">
              © {new Date().getFullYear()} Bản quyền thuộc về <span className="font-bold text-white uppercase">{config.name}</span>.<br/>
              Phát triển bởi Vũ Hùng.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
