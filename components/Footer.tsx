import React from 'react';
import { SchoolConfig } from '../types';
import { MapPin, Phone, Mail, Facebook, Youtube, Globe } from 'lucide-react';

interface FooterProps {
  config: SchoolConfig;
}

export const Footer: React.FC<FooterProps> = ({ config }) => {
  return (
    <footer className="bg-blue-900 text-white pt-10 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Info */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4 border-b border-blue-700 pb-2 inline-block">
              Thông tin liên hệ
            </h3>
            <ul className="space-y-3 text-sm text-blue-100">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} />
                <span>{config.phone} {config.hotline && `- ${config.hotline}`}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} />
                <span>{config.email}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Links */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4 border-b border-blue-700 pb-2 inline-block">
              Liên kết
            </h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li><a href="#" className="hover:text-white hover:underline">Bộ Giáo dục & Đào tạo</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Sở Giáo dục Hà Nội</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Cổng thông tin tuyển sinh</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Tài nguyên học tập số</a></li>
            </ul>
          </div>

          {/* Column 3: Stats/Social */}
          <div>
            <h3 className="text-lg font-bold uppercase mb-4 border-b border-blue-700 pb-2 inline-block">
              Mạng xã hội
            </h3>
            <div className="flex space-x-4 mb-6">
              {config.facebook && (
                <a href={config.facebook} target="_blank" rel="noreferrer" className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition">
                  <Facebook size={20} />
                </a>
              )}
              {config.youtube && (
                <a href={config.youtube} target="_blank" rel="noreferrer" className="bg-red-800 p-2 rounded-full hover:bg-red-700 transition">
                  <Youtube size={20} />
                </a>
              )}
              {config.website && (
                <a href={config.website} target="_blank" rel="noreferrer" className="bg-teal-800 p-2 rounded-full hover:bg-teal-700 transition">
                  <Globe size={20} />
                </a>
              )}
            </div>
            <p className="text-xs text-blue-300">
              © {new Date().getFullYear()} Bản quyền thuộc về {config.name}.<br/>
              Phát triển bởi VinaEdu CMS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
