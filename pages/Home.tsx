
import React from 'react';
import { Post, SchoolConfig, GalleryImage, DisplayBlock, IntroductionArticle, PostCategory } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChevronRight, Calendar, ImageIcon, ArrowRight, Star, Clock } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  postCategories: PostCategory[]; // NEW
  config: SchoolConfig;
  gallery: GalleryImage[];
  blocks: DisplayBlock[];
  introductions?: IntroductionArticle[]; 
  onNavigate: (path: string, id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ posts, postCategories, config, gallery, blocks, introductions = [], onNavigate }) => {
  
  // Helper to get posts based on Block Configuration
  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    
    // Check if block has a configured category source (stored in htmlContent for non-HTML blocks)
    // IMPORTANT: htmlContent is hijacked to store Category Slug or 'featured'
    const categorySource = block.htmlContent || 'all'; 

    if (categorySource === 'featured') {
        // Filter for Featured/Highlight posts
        filtered = filtered.filter(p => p.isFeatured);
    } else if (categorySource !== 'all' && block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs') {
        // Filter by specific category slug (news, announcement, activity, etc.)
        filtered = filtered.filter(p => p.category === categorySource);
    }
    
    // Override itemCount from Global Config if it's the main grid, otherwise use block config
    const limit = (block.type === 'grid' && config.homeNewsCount > 0) ? config.homeNewsCount : block.itemCount;

    // Sort by newest first
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit);
  };

  const getCategoryBadge = (catSlug: string) => {
    const cat = postCategories.find(c => c.slug === catSlug);
    if (cat) {
        return { text: cat.name.toUpperCase(), color: `bg-${cat.color}-600` };
    }
    return { text: 'TIN TỨC', color: 'bg-blue-600' };
  };

  const renderBlock = (block: DisplayBlock) => {
    if (block.targetPage === 'detail') return null;
    
    // --- GLOBAL CONFIG CHECKS ---
    // 1. Hero Block Check
    if (block.type === 'hero' && !config.showWelcomeBanner) return null;
    
    // 2. Program/Category Block Check (Highlight / List type)
    if ((block.type === 'highlight' || block.type === 'list') && block.position === 'main' && !config.homeShowProgram) return null;

    // 3. Main News Grid Check (If we wanted to hide it, but user only asked for count config. 
    //    We can assume if count is 0, it might hide, but the logic handles slice(0,0) which returns empty)
    
    const blockPosts = getPostsForBlock(block);
    
    // Only render if there are posts (except for HTML/Stats which handle themselves)
    if (blockPosts.length === 0 && block.type !== 'html' && block.type !== 'stats') return null;

    // 1. HERO SLIDER BLOCK
    if (block.type === 'hero') {
        const mainHero = blockPosts[0];
        const subHeros = blockPosts.slice(1, 3);
        if (!mainHero) return null;

        return (
          <section key={block.id} className="mb-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                {/* Main Large Hero */}
                <div 
                    className="md:col-span-2 relative h-[300px] md:h-[400px] group cursor-pointer overflow-hidden bg-gray-900" 
                    onClick={() => onNavigate('news-detail', mainHero.id)}
                >
                    <img src={mainHero.thumbnail} alt={mainHero.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <span className={`text-white text-[10px] font-bold px-2 py-1 uppercase rounded mb-2 inline-block shadow ${getCategoryBadge(mainHero.category).color}`}>
                            {block.htmlContent === 'featured' ? 'TIN NỔI BẬT' : getCategoryBadge(mainHero.category).text}
                        </span>
                        <h2 className="text-white text-xl md:text-3xl font-bold leading-tight mb-2 line-clamp-2 hover:text-yellow-400 transition drop-shadow-md">{mainHero.title}</h2>
                        <div className="flex items-center text-gray-200 text-xs gap-3">
                            <span className="flex items-center gap-1"><Calendar size={12}/> {mainHero.date}</span>
                        </div>
                    </div>
                </div>
                
                {/* Side stacked heroes */}
                <div className="md:col-span-1 flex flex-col gap-1 h-[300px] md:h-[400px]">
                    {subHeros.map(sub => (
                        <div key={sub.id} className="relative flex-1 group cursor-pointer overflow-hidden bg-gray-900" onClick={() => onNavigate('news-detail', sub.id)}>
                            <img src={sub.thumbnail} alt={sub.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 hover:text-yellow-400 transition drop-shadow-md">{sub.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </section>
        );
    }

    // 2. STANDARD GRID BLOCK
    if (block.type === 'grid') {
        return (
          <section key={block.id} className="mb-10 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-end border-b-2 border-blue-900 mb-5 pb-2">
              <h3 className="text-xl font-bold text-blue-900 uppercase flex items-center">
                <span className="w-2 h-6 bg-blue-600 mr-3 rounded-sm"></span> {block.name}
              </h3>
              <button onClick={() => onNavigate('news')} className="text-xs font-bold text-gray-600 hover:text-blue-800 uppercase flex items-center bg-gray-100 px-3 py-1 rounded hover:bg-blue-50 transition border border-gray-200">
                Xem thêm <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {blockPosts.map((post, idx) => {
                   const badge = getCategoryBadge(post.category);
                   return (
                   <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full">
                       <div className="relative overflow-hidden rounded mb-3 h-48 border border-gray-200 shadow-sm">
                           <img src={post.thumbnail} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" alt=""/>
                           <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded shadow ${badge.color}`}>
                                {badge.text}
                           </div>
                       </div>
                       <h4 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition">{post.title}</h4>
                       <p className="text-xs text-gray-600 line-clamp-2 mb-3 flex-grow">{post.summary}</p>
                       <div className="text-[10px] text-gray-500 font-medium flex items-center border-t border-gray-100 pt-2 mt-auto">
                           <Clock size={12} className="mr-1"/> {post.date}
                       </div>
                   </div>
                   );
               })}
            </div>
          </section>
        );
    }

    // 3. LIST BLOCK (Highlight/Focus)
    if (block.type === 'highlight' || block.type === 'list') {
         return (
            <section key={block.id} className="mb-10">
               <div className="bg-[#004d40] text-white p-3 rounded-t-lg flex justify-between items-center shadow-sm">
                   <h3 className="font-bold uppercase text-sm flex items-center"><Star size={16} className="mr-2 text-yellow-400 fill-yellow-400"/> {block.name}</h3>
               </div>
               <div className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-4 shadow-sm">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {blockPosts.map(post => (
                           <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded transition border border-transparent hover:border-gray-200">
                               <img src={post.thumbnail} className="w-24 h-20 object-cover rounded shadow-sm flex-shrink-0 border border-gray-200" alt=""/>
                               <div>
                                   <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-teal-700 line-clamp-2">{post.title}</h4>
                                   <div className="text-xs text-gray-600 mb-1 line-clamp-1">{post.summary}</div>
                                   <div className="text-[10px] text-gray-400">{post.date}</div>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
            </section>
         );
    }
    return null;
  };

  const mainBlocks = blocks.filter(b => b.position === 'main');
  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="pb-10 bg-slate-100 font-sans">
      <div className="container mx-auto px-4 mt-6">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* MAIN COLUMN (8/12) */}
            <div className="lg:col-span-8">
               
               {mainBlocks.length > 0 ? (
                 mainBlocks.map(block => renderBlock(block))
               ) : (
                 <p className="text-center text-gray-500 py-10">Chưa có nội dung hiển thị.</p>
               )}
            </div>

            {/* SIDEBAR COLUMN (4/12) */}
            <div className="lg:col-span-4 space-y-8">
               {/* Quick Links */}
               <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                   <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-3 text-white font-bold uppercase text-center text-sm tracking-wide">
                       Liên kết nhanh
                   </div>
                   <div className="p-4 grid grid-cols-2 gap-3">
                       <button className="bg-blue-50 hover:bg-blue-100 text-blue-900 p-3 rounded flex flex-col items-center justify-center gap-2 transition border border-blue-100 shadow-sm">
                           <Calendar size={24} className="text-blue-700"/>
                           <span className="text-xs font-bold text-center">Thời khóa biểu</span>
                       </button>
                       <button className="bg-green-50 hover:bg-green-100 text-green-900 p-3 rounded flex flex-col items-center justify-center gap-2 transition border border-green-100 shadow-sm">
                           <Star size={24} className="text-green-700"/>
                           <span className="text-xs font-bold text-center">Thành tích</span>
                       </button>
                       <button className="bg-orange-50 hover:bg-orange-100 text-orange-900 p-3 rounded flex flex-col items-center justify-center gap-2 transition border border-orange-100 shadow-sm">
                           <ImageIcon size={24} className="text-orange-700"/>
                           <span className="text-xs font-bold text-center">Thư viện ảnh</span>
                       </button>
                       <button onClick={() => onNavigate('contact')} className="bg-purple-50 hover:bg-purple-100 text-purple-900 p-3 rounded flex flex-col items-center justify-center gap-2 transition border border-purple-100 shadow-sm">
                           <ArrowRight size={24} className="text-purple-700"/>
                           <span className="text-xs font-bold text-center">Liên hệ</span>
                       </button>
                   </div>
               </div>

               <Sidebar 
                  blocks={sidebarBlocks} 
                  posts={posts} 
                  postCategories={postCategories}
                  documents={[]} 
                  onNavigate={onNavigate} 
                  currentPage="home" 
               />
            </div>
         </div>
      </div>

      {/* GALLERY STRIP */}
      <section className="bg-white border-t border-gray-200 py-12 mt-8">
         <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-blue-900 uppercase flex items-center border-l-4 border-blue-600 pl-3">
                  Hoạt động qua ảnh
               </h3>
               <button onClick={() => onNavigate('gallery')} className="px-5 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-bold hover:bg-blue-100 transition border border-blue-200">
                  Xem thư viện
               </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {gallery.slice(0,4).map(img => (
                  <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer relative shadow-sm border border-gray-200">
                     <img src={img.url} alt="Gallery" className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <ImageIcon className="text-white w-8 h-8"/>
                     </div>
                  </div>
               ))}
               {gallery.length === 0 && <p className="text-gray-400 col-span-4 text-center">Đang cập nhật hình ảnh...</p>}
            </div>
         </div>
      </section>
    </div>
  );
};
