import React, { useState, useEffect } from 'react';
import { DisplayBlock, Post, SchoolDocument } from '../types';
import { Bell, FileText, Download, Users, Globe, BarChart2, Clock, Calendar, ArrowRightCircle, CircleArrowRight, Eye, X, Maximize2 } from 'lucide-react';

interface SidebarProps {
  blocks: DisplayBlock[];
  posts: Post[];
  documents: SchoolDocument[];
  onNavigate: (path: string, id?: string) => void;
  currentPage: string;
}

// Sub-component for the Clock/Stats to manage its own timer state
const StatsBlock: React.FC<{ block: DisplayBlock }> = ({ block }) => {
   const [currentTime, setCurrentTime] = useState(new Date());

   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
   };

   const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
   };

   return (
      <div className="bg-white border-t-4 border-blue-800 shadow-sm rounded-b-lg overflow-hidden mb-8">
         <div className="bg-blue-50 p-3 border-b border-blue-100">
            <h3 className="font-bold text-blue-900 uppercase text-sm flex items-center">
               <BarChart2 size={16} className="mr-2" /> {block.name}
            </h3>
         </div>
         <div className="p-4">
            {/* Live Clock */}
            <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-200">
               <div className="text-2xl font-bold text-blue-800 font-mono tracking-wider">
                  {formatTime(currentTime)}
               </div>
               <div className="text-xs text-gray-500 font-medium uppercase mt-1 flex items-center justify-center">
                  <Calendar size={12} className="mr-1"/> {formatDate(currentTime)}
               </div>
            </div>

            {/* Stats List */}
            <ul className="space-y-3 text-sm">
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Users size={16} className="mr-2 text-green-600"/> Đang online:</span>
                  <span className="font-bold text-gray-800">15</span>
               </li>
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Clock size={16} className="mr-2 text-orange-500"/> Hôm nay:</span>
                  <span className="font-bold text-gray-800">350</span>
               </li>
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Calendar size={16} className="mr-2 text-purple-500"/> Tháng này:</span>
                  <span className="font-bold text-gray-800">9.200</span>
               </li>
               <li className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                  <span className="flex items-center text-gray-700 font-bold"><Globe size={16} className="mr-2 text-blue-600"/> Tổng truy cập:</span>
                  <span className="font-bold text-blue-900">1.250.400</span>
               </li>
            </ul>
         </div>
      </div>
   );
};

export const Sidebar: React.FC<SidebarProps> = ({ blocks, posts, documents, onNavigate, currentPage }) => {
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);
  
  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    
    // Check if block has a configured category source (stored in htmlContent)
    const categorySource = block.htmlContent;
    const hasCategorySource = categorySource && categorySource !== 'all' && block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs';

    if (hasCategorySource) {
        filtered = filtered.filter(p => p.category === categorySource);
    } 

    return filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, block.itemCount);
  };

  const handlePreview = (doc: SchoolDocument) => {
      if (!doc.downloadUrl || doc.downloadUrl === '#') {
          alert("Tài liệu này chưa có nội dung để xem trước.");
          return;
      }
      setPreviewDoc(doc);
  };

  const renderBlock = (block: DisplayBlock) => {
    // Check Visibility based on Page
    if (block.targetPage !== 'all') {
       if (block.targetPage === 'home' && currentPage !== 'home') return null;
       if (block.targetPage === 'detail' && currentPage !== 'news-detail') return null;
    }

    // 0. Visitor Stats Block
    if (block.type === 'stats') {
       return <StatsBlock key={block.id} block={block} />;
    }

    // 1. HTML / Text Block
    if (block.type === 'html') {
      return (
        <div key={block.id} className="bg-white border-t-4 border-green-600 shadow-sm rounded-b-lg overflow-hidden mb-8">
           <div className="bg-green-50 p-3 border-b border-green-100">
              <h3 className="font-bold text-green-800 uppercase text-sm">{block.name}</h3>
           </div>
           <div className="p-4 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: block.htmlContent || '' }} />
        </div>
      );
    }

    // 2. Documents Block
    if (block.type === 'docs') {
       const docsToShow = documents.slice(0, block.itemCount);
       return (
        <div key={block.id} className="bg-white border-t-4 border-orange-500 shadow-sm rounded-b-lg overflow-hidden mb-8">
           <div className="bg-orange-50 p-3 border-b border-orange-100">
              <h3 className="font-bold text-orange-800 uppercase text-sm flex items-center">
                 <FileText size={16} className="mr-2" /> {block.name}
              </h3>
           </div>
           <div className="p-2">
              <ul className="space-y-1">
                 {docsToShow.map(doc => (
                    <li key={doc.id} className="flex items-start p-2 hover:bg-orange-50 rounded group transition border-b border-dashed border-gray-100 last:border-0">
                       <FileText size={18} className="text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
                       <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-orange-700 leading-snug mb-1">{doc.title}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">{doc.number}</span>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handlePreview(doc)}
                                    className="flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100"
                                    title="Xem trước"
                                >
                                    <Eye size={10} className="mr-1"/> Xem
                                </button>
                                <a 
                                    href={doc.downloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded hover:bg-green-100"
                                    title="Tải về"
                                >
                                    <Download size={10} className="mr-1"/> Tải
                                </a>
                            </div>
                          </div>
                       </div>
                    </li>
                 ))}
              </ul>
              <div className="text-right p-2 pt-3 border-t border-gray-100">
                 <button onClick={() => onNavigate('documents')} className="text-xs font-bold text-orange-600 hover:underline">Xem tất cả »</button>
              </div>
           </div>
        </div>
       );
    }

    // 3. Article List Block (Standard or Latest News)
    const blockPosts = getPostsForBlock(block);
    if (blockPosts.length === 0) return null;

    // Special styling for "TIN MỚI NHẤT" or general list types
    return (
      <div key={block.id} className="bg-white border border-gray-200 shadow-sm mb-6 rounded overflow-hidden">
         {/* Green Header */}
         <div className="bg-[#1e7e46] p-3 flex items-center">
            <h3 className="font-bold text-white uppercase text-sm flex items-center">
               <CircleArrowRight size={16} className="mr-2 text-white fill-white bg-transparent" />
               {block.name}
            </h3>
         </div>
         <div className="p-0 bg-white">
            <ul className="divide-y divide-gray-100">
               {blockPosts.map(post => (
                  <li key={post.id} className="p-3 hover:bg-gray-50 transition">
                     <div 
                        onClick={() => onNavigate('news-detail', post.id)} 
                        className="flex gap-3 cursor-pointer group"
                     >
                        {/* Thumbnail */}
                        {post.thumbnail && (
                            <div className="w-24 h-16 shrink-0 overflow-hidden border border-gray-200">
                                <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        )}
                        
                        {/* Title */}
                        <div className="flex-1">
                            <h4 className="text-sm text-[#2a4e6c] font-medium line-clamp-3 group-hover:text-blue-600 leading-snug uppercase">
                            {post.title}
                            </h4>
                        </div>
                     </div>
                  </li>
               ))}
            </ul>
         </div>
      </div>
    );
  };

  return (
    <>
        <aside className="w-full">
        {blocks.map(block => renderBlock(block))}
        
        {/* Static Fallback Links if sidebar is empty */}
        {blocks.length === 0 && (
            <div className="bg-white p-4 border rounded text-center text-gray-500 text-sm">
                Chưa có block nào. Vui lòng cấu hình trong Admin.
            </div>
        )}
        </aside>

        {/* DOCUMENT PREVIEW MODAL */}
        {previewDoc && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in">
                <div className="bg-white w-full max-w-4xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center p-3 bg-gray-800 text-white border-b border-gray-700">
                        <div className="flex items-center overflow-hidden">
                             <FileText size={18} className="mr-2 text-orange-400 flex-shrink-0"/>
                             <h3 className="font-bold text-sm truncate pr-4">{previewDoc.title}</h3>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <a 
                                href={previewDoc.downloadUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-1.5 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
                                title="Mở trong tab mới"
                            >
                                <Maximize2 size={18} />
                            </a>
                            <button 
                                onClick={() => setPreviewDoc(null)}
                                className="p-1.5 hover:bg-red-600 rounded text-gray-300 hover:text-white transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-gray-100 relative">
                        {previewDoc.downloadUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                            <div className="w-full h-full flex items-center justify-center overflow-auto">
                                <img src={previewDoc.downloadUrl} alt="Preview" className="max-w-full max-h-full" />
                            </div>
                        ) : (
                            /* Using Google Docs Viewer for generic preview support for PDF, DOC, etc. */
                            <iframe 
                                src={previewDoc.downloadUrl.startsWith('http') ? previewDoc.downloadUrl : ''} 
                                className="w-full h-full" 
                                frameBorder="0"
                                title="Document Preview"
                            ></iframe>
                        )}
                        
                        {/* Fallback Message for Iframe issues */}
                        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-gray-400">
                             <p>Đang tải bản xem trước...</p>
                             <p className="text-xs mt-2">Nếu không hiển thị, vui lòng nhấn nút tải về.</p>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-50 p-3 border-t border-gray-200 text-right">
                        <a 
                            href={previewDoc.downloadUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
                        >
                            <Download size={16} className="mr-2"/> Tải tài liệu về máy
                        </a>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};