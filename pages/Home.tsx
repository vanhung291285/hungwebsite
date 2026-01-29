import React from 'react';
import { Post, SchoolConfig, GalleryImage, DisplayBlock, SchoolDocument } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { Sidebar } from '../components/Sidebar';
import { ChevronRight, Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface HomeProps {
  posts: Post[];
  config: SchoolConfig;
  gallery: GalleryImage[];
  blocks: DisplayBlock[];
  onNavigate: (path: string, id?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ posts, config, gallery, blocks, onNavigate }) => {
  // Helper to get posts for a specific block
  // LOGIC UPDATED: Now checks category stored in htmlContent OR blockIds
  const getPostsForBlock = (block: DisplayBlock) => {
    let filtered = posts.filter(p => p.status === 'published');
    
    // Check if block has a configured category source (stored in htmlContent for non-HTML blocks)
    const categorySource = block.htmlContent;
    const hasCategorySource = categorySource && categorySource !== 'all' && block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs';

    if (hasCategorySource) {
        // Filter by category
        filtered = filtered.filter(p => p.category === categorySource);
    } 
    // If no category source is set (or set to 'all'), we generally default to all latest posts
    // UNLESS the block has specific blockIds assigned manually.
    else if (block.htmlContent === 'all' || !block.htmlContent) {
         // If specific blockIds are present, prioritize them? 
         // For now, if 'all' is selected, we show all.
         // If user wants specific posts, they should rely on the category filter or we can add a 'Manual' mode later.
         // Current behavior: Show all latest published posts.
    }

    return filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, block.itemCount);
  };

  const renderBlock = (block: DisplayBlock) => {
    // Check Visibility for Home Page
    if (block.targetPage === 'detail') return null;

    const blockPosts = getPostsForBlock(block);

    if (block.type === 'hero' && blockPosts.length > 0) {
        const heroPost = blockPosts[0];
        return (
          <section key={block.id} className="relative h-[300px] md:h-[450px] overflow-hidden group cursor-pointer mb-8 rounded-lg shadow-md" onClick={() => onNavigate('news-detail', heroPost.id)}>
             <img 
              src={heroPost.thumbnail} 
              alt={heroPost.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
             <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                 <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase rounded mb-3 inline-block">
                     {block.name}
                 </span>
                 <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md leading-tight">
                     {heroPost.title}
                 </h2>
                 <p className="hidden md:block text-gray-200 mb-2 max-w-3xl line-clamp-2 text-sm">
                      {heroPost.summary}
                 </p>
             </div>
          </section>
        );
    }

    if (block.type === 'grid' && blockPosts.length > 0) {
        const mainPost = blockPosts[0];
        const subPosts = blockPosts.slice(1, 6); // Max 5 sub posts

        return (
          <section key={block.id} className="mb-10">
            <div className="flex justify-between items-center border-b-2 border-blue-900 mb-6 pb-2">
              <h3 className="text-xl font-bold text-blue-900 uppercase flex items-center border-l-4 border-blue-500 pl-3">
                {block.name}
              </h3>
              <button onClick={() => onNavigate('news')} className="text-gray-500 hover:text-blue-700 text-sm flex items-center">
                Xem thêm <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left Column: 1 Main Post (2/3 width) */}
               <div className="lg:col-span-2">
                   <div 
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col h-full group"
                      onClick={() => onNavigate('news-detail', mainPost.id)}
                    >
                      <div className="relative h-64 md:h-80 overflow-hidden bg-gray-100">
                        <img 
                          src={mainPost.thumbnail} 
                          alt={mainPost.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                         <div className="absolute top-2 left-2">
                            <span className={`px-2 py-1 text-xs font-bold text-white rounded uppercase ${
                                mainPost.category === 'news' ? 'bg-blue-600' :
                                mainPost.category === 'announcement' ? 'bg-red-600' : 'bg-green-600'
                            }`}>
                                Tin nổi bật
                            </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 leading-tight">
                          {mainPost.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {mainPost.summary}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-auto">
                            <Calendar size={14} className="mr-2" />
                            <span>{mainPost.date}</span>
                        </div>
                      </div>
                    </div>
               </div>

               {/* Right Column: Up to 5 Sub Posts (1/3 width) */}
               <div className="lg:col-span-1 flex flex-col space-y-4">
                   {subPosts.length > 0 ? subPosts.map((post, index) => (
                      <div 
                        key={post.id} 
                        onClick={() => onNavigate('news-detail', post.id)} 
                        className="flex gap-3 items-start group cursor-pointer bg-white p-2 rounded hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                      >
                         <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded bg-gray-100 relative">
                             <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="" />
                             <div className="absolute top-0 left-0 bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                                #{index + 1}
                             </div>
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-700 line-clamp-2 leading-snug mb-1">
                                {post.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-400">
                                <Calendar size={10} className="mr-1"/> {post.date}
                            </div>
                         </div>
                      </div>
                   )) : (
                      <div className="p-4 bg-gray-50 text-center text-gray-500 text-sm italic rounded">Không có tin phụ nào.</div>
                   )}
                   
                   {subPosts.length > 0 && (
                      <button onClick={() => onNavigate('news')} className="mt-auto text-xs font-bold text-blue-600 uppercase flex items-center justify-center pt-2 hover:underline">
                          Xem tất cả tin tức <ArrowRight size={12} className="ml-1"/>
                      </button>
                   )}
               </div>
            </div>
          </section>
        );
    }

    if (block.type === 'highlight' && blockPosts.length > 0) {
         return (
            <section key={block.id} className="mb-10">
               <div className="flex justify-between items-center border-b-2 border-green-700 mb-6 pb-2">
                 <h3 className="text-xl font-bold text-green-800 uppercase flex items-center border-l-4 border-green-500 pl-3">
                   {block.name}
                 </h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blockPosts.map(post => (
                    <div key={post.id} onClick={() => onNavigate('news-detail', post.id)} className="flex space-x-4 cursor-pointer group p-2 hover:bg-white hover:shadow-sm rounded transition border border-transparent hover:border-gray-100">
                       <img src={post.thumbnail} className="w-24 h-24 object-cover rounded shadow-sm group-hover:shadow" alt="" />
                       <div>
                          <h4 className="font-bold text-gray-800 text-sm leading-tight mb-2 group-hover:text-green-700 line-clamp-2">{post.title}</h4>
                          <div className="flex items-center text-xs text-gray-500">
                             <Calendar size={12} className="mr-1"/> {post.date}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
         );
    }

    return null;
  };

  const mainBlocks = blocks.filter(b => b.position === 'main');
  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="space-y-6 pb-10 mt-6">
      
      {/* Banner is now in Header.tsx */}

      <div className="container mx-auto px-4">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* MAIN COLUMN (8/12) */}
            <div className="lg:col-span-8">
               {mainBlocks.length > 0 ? (
                 mainBlocks.map(block => renderBlock(block))
               ) : (
                 <p className="text-center text-gray-500 py-10">Chưa có khối nội dung nào.</p>
               )}
            </div>

            {/* SIDEBAR COLUMN (4/12) */}
            <div className="lg:col-span-4">
               <Sidebar 
                  blocks={sidebarBlocks} 
                  posts={posts} 
                  documents={[]} 
                  onNavigate={onNavigate} 
                  currentPage="home" 
               />
               
               {/* Static Quick Links */}
               <div className="space-y-3 mb-8">
                  <button className="w-full bg-blue-800 text-white p-4 rounded text-left font-bold uppercase shadow flex items-center justify-between hover:bg-blue-900 transition">
                     <span>Tra cứu điểm thi</span>
                     <ChevronRight />
                  </button>
                  <button className="w-full bg-teal-600 text-white p-4 rounded text-left font-bold uppercase shadow flex items-center justify-between hover:bg-teal-700 transition">
                     <span>Thời khóa biểu</span>
                     <ChevronRight />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* GALLERY STRIP */}
      <section className="bg-gray-100 py-10 mt-8">
         <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-2xl font-bold text-gray-800 uppercase flex items-center">
                  <ImageIcon className="mr-2 text-blue-600" /> Thư viện ảnh
               </h3>
               <button onClick={() => onNavigate('gallery')} className="px-4 py-1 border border-gray-400 rounded-full text-sm hover:bg-gray-200">
                  Xem tất cả
               </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {gallery.slice(0,4).map(img => (
                  <div key={img.id} className="aspect-[4/3] overflow-hidden rounded-lg group cursor-pointer relative">
                     <img src={img.url} alt="Gallery" className="w-full h-full object-cover transform transition duration-500 group-hover:scale-110" />
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};