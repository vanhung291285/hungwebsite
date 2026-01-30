
import React, { useState, useEffect } from 'react';
import { DisplayBlock, Post, SchoolDocument, PostCategory, DocumentCategory, Video } from '../types';
import { Bell, FileText, Download, Users, Globe, BarChart2, Clock, Calendar, ArrowRightCircle, CircleArrowRight, Eye, X, Maximize2, Star, Folder, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  blocks: DisplayBlock[];
  posts: Post[];
  postCategories: PostCategory[]; 
  documents: SchoolDocument[];
  docCategories?: DocumentCategory[]; 
  videos?: Video[]; // NEW
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
      <div className="bg-white border-t-4 border-blue-800 shadow-sm rounded-b-lg overflow-hidden mb-10">
         <div className="bg-blue-50 p-4 border-b border-blue-100">
            <h3 className="font-bold text-blue-900 uppercase text-base flex items-center">
               <BarChart2 size={20} className="mr-3" /> {block.name}
            </h3>
         </div>
         <div className="p-5">
            {/* Live Clock */}
            <div className="text-center mb-5 pb-5 border-b border-dashed border-gray-200">
               <div className="text-3xl font-bold text-blue-800 font-mono tracking-wider">
                  {formatTime(currentTime)}
               </div>
               <div className="text-sm text-gray-500 font-bold uppercase mt-2 flex items-center justify-center">
                  <Calendar size={14} className="mr-2"/> {formatDate(currentTime)}
               </div>
            </div>

            {/* Stats List */}
            <ul className="space-y-4 text-base">
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Users size={18} className="mr-2 text-green-600"/> Đang online:</span>
                  <span className="font-bold text-gray-800">15</span>
               </li>
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Clock size={18} className="mr-2 text-orange-500"/> Hôm nay:</span>
                  <span className="font-bold text-gray-800">350</span>
               </li>
               <li className="flex justify-between items-center">
                  <span className="flex items-center text-gray-600"><Calendar size={18} className="mr-2 text-purple-500"/> Tháng này:</span>
                  <span className="font-bold text-gray-800">9.200</span>
               </li>
               <li className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                  <span className="flex items-center text-gray-700 font-bold"><Globe size={18} className="mr-2 text-blue-600"/> Tổng truy cập:</span>
                  <span className="font-bold text-blue-900 text-lg">1.250.400</span>
               </li>
            </ul>
         </div>
      </div>
   );
};

// Sub-component for Calendar Widget
const CalendarBlock: React.FC<{ block: DisplayBlock }> = ({ block }) => {
    const [date, setDate] = useState(new Date());
    
    const currYear = date.getFullYear();
    const currMonth = date.getMonth(); // 0-indexed
    
    const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    
    // Adjust start day to Monday (1) if desired, but standard JS starts Sunday (0)
    // Let's stick to Monday start for Vietnam style
    // If Sun (0), becomes 6. If Mon (1), becomes 0.
    const startDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const days = [];
    // Padding empty days
    for (let i = 0; i < startDayIndex; i++) {
        days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const prevMonth = () => {
        setDate(new Date(currYear, currMonth - 1, 1));
    };
    
    const nextMonth = () => {
        setDate(new Date(currYear, currMonth + 1, 1));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currMonth === today.getMonth() && currYear === today.getFullYear();
    };

    return (
        <div className="bg-white border-t-4 border-blue-600 shadow-sm rounded-b-lg overflow-hidden mb-10">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                <h3 className="font-bold text-blue-900 uppercase text-base flex items-center">
                    <Calendar size={20} className="mr-2" /> {block.name}
                </h3>
            </div>
            <div className="p-5">
                {/* Month Nav */}
                <div className="flex justify-between items-center mb-5">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-blue-800 text-base uppercase">Tháng {currMonth + 1} / {currYear}</span>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 rounded text-gray-700"><ChevronRight size={20}/></button>
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                        <div key={d} className="font-bold text-gray-500 py-1.5">{d}</div>
                    ))}
                    {days.map((day, idx) => (
                        <div key={idx} className={`py-2 rounded-lg font-medium ${day ? 'cursor-default' : ''} ${day && isToday(day) ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 text-xs text-center text-gray-500 italic">
                    Hôm nay: <span className="font-bold">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ blocks, posts, postCategories, documents, docCategories = [], videos = [], onNavigate, currentPage }) => {
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);
  
  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    
    // LOGIC: Check category source stored in `htmlContent`
    // If block type is NOT 'html', 'stats', 'docs', 'doc_cats', 'video', 'calendar', then htmlContent holds the Category Slug
    const categorySource = block.htmlContent || 'all'; 

    if (categorySource === 'featured') {
        // Filter for Featured/Highlight posts
        filtered = filtered.filter(p => p.isFeatured);
    } else if (categorySource !== 'all') {
        // Filter by specific category slug
        filtered = filtered.filter(p => p.category === categorySource);
    }
    // If 'all', we don't filter by category

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
    // Check Visibility based on Page configuration
    if (block.targetPage !== 'all') {
       if (block.targetPage === 'home' && currentPage !== 'home') return null;
       if (block.targetPage === 'detail' && currentPage !== 'news-detail') return null;
    }

    // 0. Visitor Stats Block
    if (block.type === 'stats') {
       return <StatsBlock key={block.id} block={block} />;
    }

    // 0.1 Calendar Block (NEW)
    if (block.type === 'calendar') {
        return <CalendarBlock key={block.id} block={block} />;
    }

    // 1. HTML / Text Block
    if (block.type === 'html') {
      return (
        <div key={block.id} className="bg-white border-t-4 border-green-600 shadow-sm rounded-b-lg overflow-hidden mb-10">
           <div className="bg-green-50 p-4 border-b border-green-100">
              <h3 className="font-bold text-green-800 uppercase text-base">{block.name}</h3>
           </div>
           <div className="p-5 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: block.htmlContent || '' }} />
        </div>
      );
    }

    // 2. Document Categories (Folders) Block
    if (block.type === 'doc_cats') {
        return (
            <div key={block.id} className="bg-white border border-blue-900 rounded-lg overflow-hidden mb-8 shadow-sm">
                <div className="bg-blue-900 p-4 text-center">
                    <h3 className="font-bold text-white uppercase text-base">{block.name}</h3>
                </div>
                <div className="p-0">
                    <ul className="divide-y divide-gray-100">
                        {docCategories.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => onNavigate('documents', cat.slug)}
                                    className="w-full flex items-center p-4 hover:bg-blue-50 transition text-left group"
                                >
                                    <Folder size={22} className="text-yellow-500 fill-yellow-500 mr-3 flex-shrink-0" />
                                    <span className="text-base font-bold text-gray-700 uppercase group-hover:text-blue-800">
                                        {cat.name}
                                    </span>
                                </button>
                            </li>
                        ))}
                        {docCategories.length === 0 && <li className="p-5 text-center text-gray-500 text-sm italic">Chưa có danh mục nào</li>}
                    </ul>
                </div>
            </div>
        );
    }

    // 3. Video Block
    if (block.type === 'video') {
       const displayVideos = videos.filter(v => v.isVisible).sort((a,b) => a.order - b.order).slice(0, 1);
       if (displayVideos.length === 0) return null;
       
       return (
          <div key={block.id} className="bg-white border-t-4 border-red-600 shadow-sm rounded-b-lg overflow-hidden mb-10">
             <div className="bg-red-50 p-4 border-b border-red-100">
                <h3 className="font-bold text-red-800 uppercase text-base flex items-center">
                   <PlayCircle size={20} className="mr-2" /> {block.name}
                </h3>
             </div>
             <div className="p-3">
                {displayVideos.map(video => (
                   <div key={video.id} className="space-y-3">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black shadow-md">
                         <iframe 
                            width="100%" 
                            height="100%" 
                            src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                            title={video.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                         ></iframe>
                      </div>
                      <p className="text-sm font-bold text-gray-800 px-1">{video.title}</p>
                   </div>
                ))}
             </div>
          </div>
       );
    }

    // 4. Documents Block (Latest Files)
    if (block.type === 'docs') {
       const docsToShow = documents.slice(0, block.itemCount);
       return (
        <div key={block.id} className="bg-white border-t-4 border-orange-500 shadow-sm rounded-b-lg overflow-hidden mb-10">
           <div className="bg-orange-50 p-4 border-b border-orange-100">
              <h3 className="font-bold text-orange-800 uppercase text-base flex items-center">
                 <FileText size={20} className="mr-2" /> {block.name}
              </h3>
           </div>
           <div className="p-3">
              <ul className="space-y-2">
                 {docsToShow.map(doc => (
                    <li key={doc.id} className="flex items-start p-3 hover:bg-orange-50 rounded group transition border-b border-dashed border-gray-100 last:border-0">
                       <FileText size={22} className="text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                       <div className="flex-1 overflow-hidden">
                          <p className="text-base font-medium text-gray-700 group-hover:text-orange-700 leading-snug mb-1">{doc.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400 font-mono">{doc.number}</span>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handlePreview(doc)}
                                    className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100"
                                    title="Xem trước"
                                >
                                    <Eye size={12} className="mr-1"/> Xem
                                </button>
                                <a 
                                    href={doc.downloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded hover:bg-green-100"
                                    title="Tải về"
                                >
                                    <Download size={12} className="mr-1"/> Tải
                                </a>
                            </div>
                          </div>
                       </div>
                    </li>
                 ))}
              </ul>
              <div className="text-right p-3 pt-4 border-t border-gray-100">
                 <button onClick={() => onNavigate('documents')} className="text-sm font-bold text-orange-600 hover:underline">Xem tất cả »</button>
              </div>
           </div>
        </div>
       );
    }

    // 5. Article List Block (Highlight or Standard List)
    // IMPORTANT: Now supports "1 Main + Sub List" layout
    const blockPosts = getPostsForBlock(block);
    if (blockPosts.length === 0) return null;

    // Split posts into Main and Sub
    const [mainPost, ...subPosts] = blockPosts;

    // Custom Style for "Highlight" (Red Header)
    if (block.type === 'highlight') {
         return (
            <div key={block.id} className="mb-10">
               <div className="bg-[#b91c1c] text-white p-4 rounded-t-lg flex justify-between items-center shadow-sm">
                   <h3 className="font-bold uppercase text-base flex items-center"><Star size={20} className="mr-2 text-yellow-300 fill-yellow-300"/> {block.name}</h3>
               </div>
               <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-4 shadow-sm">
                   {/* Main Big Post */}
                   {mainPost && (
                       <div onClick={() => onNavigate('news-detail', mainPost.id)} className="cursor-pointer group mb-4 pb-4 border-b border-gray-100">
                           {mainPost.thumbnail && (
                               <div className="w-full h-48 overflow-hidden rounded mb-3 border border-gray-200">
                                   <img src={mainPost.thumbnail} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" alt=""/>
                               </div>
                           )}
                           <h4 className="text-base font-bold text-gray-900 leading-snug mb-2 group-hover:text-red-700">{mainPost.title}</h4>
                           <div className="text-xs text-gray-400 flex items-center mb-2"><Calendar size={12} className="mr-1"/> {mainPost.date}</div>
                           <p className="text-sm text-gray-600 line-clamp-2">{mainPost.summary}</p>
                       </div>
                   )}

                   {/* Sub List */}
                   <div className="flex flex-col gap-4">
                       {subPosts.map(post => (
                           <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded transition border-b border-dashed border-gray-100 last:border-0">
                               {post.thumbnail && (
                                   <div className="w-20 h-16 shrink-0 rounded overflow-hidden border border-gray-200">
                                       <img src={post.thumbnail} className="w-full h-full object-cover" alt=""/>
                                   </div>
                               )}
                               <div>
                                   <h4 className="text-sm font-bold text-gray-800 leading-snug mb-1 group-hover:text-red-700 line-clamp-2">{post.title}</h4>
                                   <div className="text-xs text-gray-400">{post.date}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </div>
         );
    }

    // Standard Sidebar List Style (Green Header)
    // Also updated to support 1 Main + Sub List layout
    return (
      <div key={block.id} className="bg-white border border-gray-200 shadow-sm mb-8 rounded-lg overflow-hidden">
         {/* Header */}
         <div className="bg-[#1e7e46] p-4 flex items-center">
            <h3 className="font-bold text-white uppercase text-base flex items-center">
               <CircleArrowRight size={20} className="mr-2 text-white fill-white bg-transparent" />
               {block.name}
            </h3>
         </div>
         <div className="p-4 bg-white">
            {/* Main Big Post */}
            {mainPost && (
                <div onClick={() => onNavigate('news-detail', mainPost.id)} className="cursor-pointer group mb-4 pb-4 border-b border-gray-100">
                    {mainPost.thumbnail && (
                        <div className="w-full h-48 overflow-hidden rounded mb-3 border border-gray-200">
                            <img src={mainPost.thumbnail} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" alt=""/>
                        </div>
                    )}
                    <h4 className="text-base font-bold text-blue-900 leading-snug mb-2 group-hover:text-green-700 uppercase">{mainPost.title}</h4>
                    <div className="text-xs text-gray-400 flex items-center mb-2"><Calendar size={12} className="mr-1"/> {mainPost.date}</div>
                    <p className="text-sm text-gray-500 line-clamp-2">{mainPost.summary}</p>
                </div>
            )}

            {/* Sub List */}
            <ul className="divide-y divide-gray-100">
               {subPosts.map(post => (
                  <li key={post.id} className="py-3 hover:bg-gray-50 transition rounded px-2">
                     <div 
                        onClick={() => onNavigate('news-detail', post.id)} 
                        className="flex gap-3 cursor-pointer group"
                     >
                        {/* Thumbnail */}
                        {post.thumbnail && (
                            <div className="w-20 h-16 shrink-0 overflow-hidden border border-gray-200 rounded-sm">
                                <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        )}
                        
                        {/* Title */}
                        <div className="flex-1">
                            <h4 className="text-sm text-[#2a4e6c] font-bold line-clamp-2 group-hover:text-green-700 leading-snug">
                            {post.title}
                            </h4>
                            <div className="mt-1.5 text-xs text-gray-400">{post.date}</div>
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
                    <div className="flex justify-between items-center p-4 bg-gray-800 text-white border-b border-gray-700">
                        <div className="flex items-center overflow-hidden">
                             <FileText size={20} className="mr-2 text-orange-400 flex-shrink-0"/>
                             <h3 className="font-bold text-base truncate pr-4">{previewDoc.title}</h3>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            <a 
                                href={previewDoc.downloadUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition"
                                title="Mở trong tab mới"
                            >
                                <Maximize2 size={20} />
                            </a>
                            <button 
                                onClick={() => setPreviewDoc(null)}
                                className="p-2 hover:bg-red-600 rounded text-gray-300 hover:text-white transition"
                            >
                                <X size={24} />
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
                    <div className="bg-gray-50 p-4 border-t border-gray-200 text-right">
                        <a 
                            href={previewDoc.downloadUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-base font-bold rounded hover:bg-blue-700 transition"
                        >
                            <Download size={18} className="mr-2"/> Tải tài liệu về máy
                        </a>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
