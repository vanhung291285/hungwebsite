
import React, { useState, useEffect } from 'react';
import { SchoolConfig } from '../../types';
import { DatabaseService } from '../../services/database';
import { Settings, Globe, Phone, Share2, Search, Save, Layout, Upload, Link as LinkIcon, Image as ImageIcon, FolderOpen } from 'lucide-react';

export const ManageSettings: React.FC = () => {
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'home' | 'contact' | 'social' | 'display' | 'seo'>('general');

  useEffect(() => {
    DatabaseService.getConfig().then(setConfig);
  }, []);

  const handleSave = async () => {
    if (config) {
        try {
            await DatabaseService.saveConfig(config);
            alert("Cấu hình đã được lưu thành công! Website sẽ cập nhật ngay lập tức.");
            window.location.reload(); 
        } catch (e: any) {
            console.error(e);
            alert("Lỗi khi lưu cấu hình: " + e.message + "\n\nNguyên nhân thường gặp: Bạn chưa chạy Script SQL 'db_schema_config.sql' để cấp quyền ghi (Update Policy) hoặc bảng thiếu cột dữ liệu.");
        }
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, bannerUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, logoUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && config) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setConfig({ ...config, faviconUrl: x.target!.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!config) return <div>Loading...</div>;

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Settings },
    { id: 'home', label: 'Trang chủ', icon: Layout },
    { id: 'contact', label: 'Liên hệ', icon: Phone },
    { id: 'display', label: 'Giao diện', icon: ImageIcon },
    { id: 'social', label: 'Mạng xã hội', icon: Share2 },
    { id: 'seo', label: 'Cấu hình SEO', icon: Search },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-lg shadow-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center mb-1">
              <Settings className="mr-3" /> Cấu hình Website
            </h2>
            <p className="text-slate-300 text-sm">Thay đổi thông tin toàn trang: Logo, Banner, Liên hệ, SEO...</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg flex items-center transition transform hover:scale-105"
          >
            <Save className="mr-2" /> Lưu Cấu Hình
          </button>
       </div>

       {/* Tabs Navigation */}
       <div className="flex overflow-x-auto bg-white rounded-t-lg border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            )
          })}
       </div>

       {/* Tab Content */}
       <div className="bg-white p-8 rounded-b-lg shadow-sm border border-t-0 border-gray-200">
          
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Tên trường (Tiêu đề chính)</label>
                     <input 
                       type="text" 
                       className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-900"
                       value={config.name}
                       onChange={e => setConfig({...config, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Khẩu hiệu (Slogan)</label>
                     <input 
                       type="text" 
                       className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-900"
                       value={config.slogan}
                       onChange={e => setConfig({...config, slogan: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Hiệu trưởng / Người đại diện</label>
                     <input 
                       type="text" 
                       className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-900"
                       value={config.principalName}
                       onChange={e => setConfig({...config, principalName: e.target.value})}
                     />
                  </div>
                  
                  {/* FAVICON UPLOAD SECTION */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="grid grid-cols-1 gap-2">
                          <label className="block text-sm font-bold text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded w-fit">Tên file favicon của site</label>
                          <div className="flex gap-3">
                             <input 
                                type="text" 
                                value={config.faviconUrl || ''} 
                                readOnly
                                placeholder="/uploads/favicon..."
                                className="w-full border border-gray-300 p-2.5 rounded text-sm bg-white text-gray-700 outline-none"
                             />
                             <label className="whitespace-nowrap bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-bold cursor-pointer hover:bg-gray-50 flex items-center shadow-sm">
                                <FolderOpen size={18} className="mr-2 text-yellow-600"/> Chọn hình ảnh
                                <input type="file" hidden accept="image/*,.ico" onChange={handleFaviconUpload}/>
                             </label>
                          </div>
                          {config.faviconUrl && (
                             <div className="mt-2 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200 w-fit">
                                <img src={config.faviconUrl} alt="Favicon" className="w-6 h-6 object-contain" />
                                <span className="text-xs text-green-600 font-bold">Đã chọn thành công</span>
                             </div>
                          )}
                      </div>
                  </div>

               </div>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Logo nhà trường</label>
                     
                     <div className="flex flex-col gap-3">
                        {/* URL Input */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={16}/></span>
                            <input 
                              type="text" 
                              className="w-full border p-2 pl-10 rounded text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-200 outline-none"
                              placeholder="Dán đường dẫn logo (URL) từ nguồn ngoài..."
                              value={config.logoUrl}
                              onChange={e => setConfig({...config, logoUrl: e.target.value})}
                            />
                        </div>

                        {/* Local Upload */}
                        <div className="relative border border-gray-300 border-dashed rounded-lg p-2 bg-gray-50 hover:bg-blue-50 transition cursor-pointer group text-center flex items-center justify-center">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleLogoUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600">
                                <Upload size={16} />
                                <span className="text-xs font-bold">Hoặc tải ảnh từ máy tính</span>
                            </div>
                        </div>
                     </div>
                     
                     {config.logoUrl && (
                       <div className="mt-3 bg-white p-2 border rounded inline-flex items-center justify-center min-w-[100px] h-[80px]">
                          <img src={config.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {/* TAB: HOME DISPLAY */}
          {activeTab === 'home' && (
             <div className="space-y-6 max-w-3xl">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded mb-4 text-sm text-blue-800">
                    Cấu hình hiển thị các khối nội dung trên trang chủ. Bạn cũng có thể sắp xếp thứ tự chi tiết trong module "Cấu hình Khối".
                </div>

                <div className="flex items-center justify-between p-4 border rounded bg-white hover:bg-gray-50">
                   <div>
                      <label htmlFor="showBanner" className="block font-bold text-gray-900">Hiển thị Banner Slide (Tin nổi bật)</label>
                      <p className="text-sm text-gray-500">Bật/tắt khối hình ảnh lớn (Hero Slider) ở đầu trang chủ.</p>
                   </div>
                   <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                       <input 
                         type="checkbox" 
                         id="showBanner"
                         className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                         checked={config.showWelcomeBanner}
                         onChange={e => setConfig({...config, showWelcomeBanner: e.target.checked})}
                         style={{right: config.showWelcomeBanner ? '0' : 'auto', left: config.showWelcomeBanner ? 'auto' : '0', borderColor: config.showWelcomeBanner ? '#2563eb' : '#d1d5db'}}
                       />
                       <label htmlFor="showBanner" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.showWelcomeBanner ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded bg-white hover:bg-gray-50">
                   <div>
                      <label className="block font-bold text-gray-900">Số lượng tin hiển thị (Khối Tin mới)</label>
                      <p className="text-sm text-gray-500">Số bài viết tối đa hiển thị trong khối "Tin tức - Sự kiện".</p>
                   </div>
                   <input 
                      type="number" 
                      min="1" max="20"
                      className="w-20 border p-2 rounded text-center font-bold text-gray-900"
                      value={config.homeNewsCount}
                      onChange={e => setConfig({...config, homeNewsCount: parseInt(e.target.value) || 4})}
                   />
                </div>

                <div className="flex items-center justify-between p-4 border rounded bg-white hover:bg-gray-50">
                   <div>
                      <label htmlFor="showProgram" className="block font-bold text-gray-900">Hiển thị Khối Chuyên mục / Hoạt động</label>
                      <p className="text-sm text-gray-500">Bật/tắt các khối tin theo chuyên mục (VD: Hoạt động ngoại khóa, Tiêu điểm...).</p>
                   </div>
                   <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                       <input 
                         type="checkbox" 
                         id="showProgram"
                         className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                         checked={config.homeShowProgram}
                         onChange={e => setConfig({...config, homeShowProgram: e.target.checked})}
                         style={{right: config.homeShowProgram ? '0' : 'auto', left: config.homeShowProgram ? 'auto' : '0', borderColor: config.homeShowProgram ? '#2563eb' : '#d1d5db'}}
                       />
                       <label htmlFor="showProgram" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.homeShowProgram ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
             <div className="space-y-6 max-w-3xl">
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Địa chỉ trụ sở</label>
                   <input 
                     type="text" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.address}
                     onChange={e => setConfig({...config, address: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Điện thoại văn phòng</label>
                     <input 
                       type="text" 
                       className="w-full border p-2 rounded bg-white text-gray-900"
                       value={config.phone}
                       onChange={e => setConfig({...config, phone: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-gray-900 mb-1">Hotline tuyển sinh</label>
                     <input 
                       type="text" 
                       className="w-full border p-2 rounded bg-white text-gray-900"
                       value={config.hotline || ''}
                       onChange={e => setConfig({...config, hotline: e.target.value})}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Email liên hệ</label>
                   <input 
                     type="email" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.email}
                     onChange={e => setConfig({...config, email: e.target.value})}
                   />
                </div>
             </div>
          )}

          {/* TAB: DISPLAY */}
          {activeTab === 'display' && (
             <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-2">Ảnh Banner Mặc định (Trang chủ)</label>
                   
                   <div className="flex flex-col gap-3">
                      {/* File Upload Option */}
                      <div className="relative border border-gray-300 border-dashed rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition cursor-pointer group text-center">
                          <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleBannerUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600">
                              <ImageIcon size={24} className="mb-2"/>
                              <span className="text-sm font-bold">Nhấn để tải Banner từ máy tính</span>
                          </div>
                      </div>

                      {/* URL Input Fallback */}
                      <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">URL:</span>
                          <input 
                              type="text" 
                              className="w-full border p-2 pl-10 rounded text-sm text-gray-900 bg-white placeholder-gray-400 focus:ring-2 focus:ring-blue-200 outline-none"
                              value={config.bannerUrl}
                              onChange={e => setConfig({...config, bannerUrl: e.target.value})}
                              placeholder="Hoặc dán liên kết ảnh vào đây..."
                          />
                      </div>
                   </div>

                   {config.bannerUrl && (
                      <div className="mt-3 relative group">
                          <img src={config.bannerUrl} alt="Banner Preview" className="w-full h-32 object-cover border rounded bg-gray-50 shadow-sm" />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Xem trước</div>
                      </div>
                   )}
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Màu chủ đạo (Primary Color)</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={config.primaryColor || '#1e3a8a'}
                        onChange={e => setConfig({...config, primaryColor: e.target.value})}
                        className="h-10 w-20 bg-white cursor-pointer"
                      />
                      <span className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{config.primaryColor}</span>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: SOCIAL */}
          {activeTab === 'social' && (
             <div className="space-y-4 max-w-2xl">
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Facebook Fanpage URL</label>
                   <input 
                     type="text" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.facebook}
                     onChange={e => setConfig({...config, facebook: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Youtube Channel URL</label>
                   <input 
                     type="text" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.youtube}
                     onChange={e => setConfig({...config, youtube: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Website liên kết</label>
                   <input 
                     type="text" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.website}
                     onChange={e => setConfig({...config, website: e.target.value})}
                   />
                </div>
             </div>
          )}

          {/* TAB: SEO */}
          {activeTab === 'seo' && (
             <div className="space-y-6 max-w-3xl">
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Tiêu đề trang (Meta Title)</label>
                   <input 
                     type="text" 
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.metaTitle}
                     onChange={e => setConfig({...config, metaTitle: e.target.value})}
                     placeholder="VD: Trường THPT Chuyên Hà Nội - Amsterdam"
                   />
                   <p className="text-xs text-gray-500 mt-1">Hiển thị trên tab trình duyệt và kết quả tìm kiếm Google.</p>
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-900 mb-1">Mô tả trang (Meta Description)</label>
                   <textarea 
                     rows={3}
                     className="w-full border p-2 rounded bg-white text-gray-900"
                     value={config.metaDescription}
                     onChange={e => setConfig({...config, metaDescription: e.target.value})}
                     placeholder="Mô tả ngắn gọn về trường..."
                   />
                   <p className="text-xs text-gray-500 mt-1">Đoạn văn bản ngắn xuất hiện dưới tiêu đề trên Google.</p>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
