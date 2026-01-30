
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar'; 
import { AdminLayout } from './components/AdminLayout';
import { FloatingContact } from './components/FloatingContact'; 
import { ScrollToTop } from './components/ScrollToTop'; 
import { Home } from './pages/Home';
import { Introduction } from './pages/Introduction';
import { Documents } from './pages/Documents';
import { Gallery } from './pages/Gallery';
import { Staff } from './pages/Staff'; 
import { Login } from './pages/Login'; 
import { Register } from './pages/Register';
import { ManageNews } from './pages/admin/ManageNews';
import { ManageDocuments } from './pages/admin/ManageDocuments';
import { ManageGallery } from './pages/admin/ManageGallery';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageMenu } from './pages/admin/ManageMenu';
import { ManageSettings } from './pages/admin/ManageSettings';
import { ManageBlocks } from './pages/admin/ManageBlocks';
import { ManageStaff } from './pages/admin/ManageStaff';
import { ManageIntro } from './pages/admin/ManageIntro';
import { ManagePostCategories } from './pages/admin/ManagePostCategories'; 
import { ManageVideos } from './pages/admin/ManageVideos';
import { Dashboard } from './pages/admin/Dashboard';
import { DatabaseService } from './services/database'; 
import { supabase } from './services/supabaseClient';
import { PageRoute, Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, DisplayBlock, MenuItem, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video } from './types';
import { Loader2, Paperclip, FileText, Download, Facebook, Share2 } from 'lucide-react';

const FALLBACK_CONFIG: SchoolConfig = {
  name: 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan: 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Xã Suối Lư, Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '',
  email: '',
  hotline: '',
  mapUrl: '',
  facebook: '',
  youtube: '',
  website: '',
  showWelcomeBanner: false,
  homeNewsCount: 6,
  homeShowProgram: false,
  primaryColor: '#1e3a8a',
  metaTitle: 'Trường PTDTBT TH và THCS Suối Lư',
  metaDescription: ''
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentDetailPost, setCurrentDetailPost] = useState<Post | null>(null); // New state for full post detail
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]); 
  const [introductions, setIntroductions] = useState<IntroductionArticle[]>([]); 
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [videos, setVideos] = useState<Video[]>([]); 
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const safePushState = (url: string) => {
    try {
      window.history.pushState({}, '', url);
    } catch (e) {
      console.warn("Routing blocked by environment (pushState failed). App will continue working via internal state.", e);
    }
  };

  // --- 1. INITIALIZATION & ROUTING LOGIC ---
  useEffect(() => {
    refreshData();
    
    // Check Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
         setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: 'Admin User',
            username: session.user.email?.split('@')[0] || 'admin',
            role: UserRole.ADMIN
         });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       if (session) {
         setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: 'Admin User',
            username: session.user.email?.split('@')[0] || 'admin',
            role: UserRole.ADMIN
         });
       } else {
         setCurrentUser(null);
       }
    });

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handleUrlRouting);
    };
  }, []);

  const handleUrlRouting = () => {
    try {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      const idParam = searchParams.get('id');

      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('login'); 
      } 
      else if (pageParam) {
        if (pageParam === 'admin') {
            setCurrentPage('login');
        } else {
            setCurrentPage(pageParam as PageRoute);
        }
        
        if (idParam) setDetailId(idParam);
      } 
      else {
        setCurrentPage('home');
      }
    } catch (e) {
      console.warn("URL parsing failed, defaulting to home", e);
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    if (config) {
        document.title = config.metaTitle || config.name;
        if (config.faviconUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = config.faviconUrl;
        }
    }
  }, [config]);

  useEffect(() => {
    if (currentPage === 'login' && currentUser) {
      setCurrentPage('admin-dashboard');
    }
  }, [currentPage, currentUser]);

  // --- Fetch Full Content when viewing Detail Page ---
  useEffect(() => {
      if (currentPage === 'news-detail' && detailId) {
          // Check if we already have the full content in currentDetailPost
          if (currentDetailPost?.id === detailId && currentDetailPost.content) return;

          // Check if the post in list has content (unlikely after optimization)
          const existing = posts.find(p => p.id === detailId);
          if (existing && existing.content) {
              setCurrentDetailPost(existing);
          } else {
              // Fetch full content
              setLoading(true);
              DatabaseService.getPostById(detailId).then(fullPost => {
                  setCurrentDetailPost(fullPost);
                  setLoading(false);
                  if (fullPost) DatabaseService.incrementPostView(detailId);
              });
          }
      }
  }, [currentPage, detailId, posts]);

  const refreshData = async (showLoader: boolean = true) => {
    if (showLoader) setLoading(true);
    
    try {
        const [
            fetchedConfig, 
            fetchedPosts, 
            fetchedDocs, 
            fetchedCats, 
            fetchedGallery, 
            fetchedAlbums, 
            fetchedBlocks, 
            fetchedMenu,
            fetchedStaff,
            fetchedIntros,
            fetchedPostCats,
            fetchedVideos
        ] = await Promise.all([
            DatabaseService.getConfig().catch(() => FALLBACK_CONFIG),
            DatabaseService.getPosts(50).catch(() => []), // LIMIT POSTS to 50 for optimization
            DatabaseService.getDocuments().catch(() => []),
            DatabaseService.getDocCategories().catch(() => []),
            DatabaseService.getGallery().catch(() => []),
            DatabaseService.getAlbums().catch(() => []),
            DatabaseService.getBlocks().catch(() => []),
            DatabaseService.getMenu().catch(() => []),
            DatabaseService.getStaff().catch(() => []),
            DatabaseService.getIntroductions().catch(() => []),
            DatabaseService.getPostCategories().catch(() => []),
            DatabaseService.getVideos().catch(() => [])
        ]);

        const finalConfig = fetchedConfig;
        if (finalConfig.name === 'Trường THPT Mẫu') {
             finalConfig.name = FALLBACK_CONFIG.name;
             finalConfig.slogan = FALLBACK_CONFIG.slogan;
             finalConfig.address = FALLBACK_CONFIG.address;
        }

        setConfig(finalConfig);
        setPosts(fetchedPosts);
        setDocuments(fetchedDocs);
        setDocCategories(fetchedCats);
        setGalleryImages(fetchedGallery);
        setAlbums(fetchedAlbums);
        setVideos(fetchedVideos); 
        setBlocks(fetchedBlocks.filter(b => b.isVisible).sort((a,b) => a.order - b.order));
        setMenuItems(fetchedMenu.sort((a,b) => a.order - b.order));
        setStaffList(fetchedStaff);
        setIntroductions(fetchedIntros.filter(i => i.isVisible).sort((a,b) => a.order - b.order));
        setPostCategories(fetchedPostCats);
    } catch (error) {
        console.error("Failed to load data", error);
        if (!config) setConfig(FALLBACK_CONFIG);
    } finally {
        if (showLoader) setLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('admin-dashboard');
    safePushState('/?page=admin-dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
    safePushState('/admin');
  };

  const navigate = (path: string, id?: string) => {
    if (path.startsWith('admin')) {
       if (!currentUser) {
         setCurrentPage('login');
         safePushState('/admin');
         return;
       }
    }

    if (id) setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);

    let newUrl = '/';
    if (path === 'home') newUrl = '/';
    else if (path === 'login') newUrl = '/admin'; 
    else newUrl = `/?page=${path}${id ? `&id=${id}` : ''}`;
    
    safePushState(newUrl);
  };

  if (loading && !config) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'login') {
      if (currentUser) return null;
      return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }

  if (currentPage === 'register') {
      return <Register onNavigate={navigate} />;
  }

  if (currentPage.startsWith('admin-')) {
    if (!currentUser) {
        return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
    }
    return (
      <AdminLayout 
        activePage={currentPage} 
        onNavigate={navigate} 
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {currentPage === 'admin-dashboard' && <Dashboard posts={posts} />}
        {currentPage === 'admin-news' && <ManageNews posts={posts} categories={postCategories} refreshData={refreshData} />}
        {currentPage === 'admin-categories' && <ManagePostCategories refreshData={refreshData} />}
        {currentPage === 'admin-intro' && <ManageIntro refreshData={refreshData} />}
        {currentPage === 'admin-blocks' && <ManageBlocks />}
        {currentPage === 'admin-docs' && <ManageDocuments documents={documents} categories={docCategories} refreshData={refreshData} />}
        {currentPage === 'admin-gallery' && <ManageGallery images={galleryImages} albums={albums} refreshData={refreshData} />}
        {currentPage === 'admin-staff' && <ManageStaff refreshData={refreshData} />} 
        {currentPage === 'admin-videos' && <ManageVideos refreshData={refreshData} />} 
        {currentUser.role === UserRole.ADMIN && (
          <>
            {currentPage === 'admin-users' && <ManageUsers refreshData={refreshData} />}
            {currentPage === 'admin-menu' && <ManageMenu refreshData={refreshData} />}
            {currentPage === 'admin-settings' && <ManageSettings />}
          </>
        )}
      </AdminLayout>
    );
  }

  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header config={config} menuItems={menuItems} onNavigate={navigate} activePath={currentPage} />
      {loading && config && (
          <div className="h-1 w-full bg-blue-100 overflow-hidden sticky top-[130px] z-40">
              <div className="animate-progress w-full h-full bg-blue-600 origin-left-right"></div>
          </div>
      )}
      
      <main className="flex-grow w-full">
        {currentPage === 'home' && (
          <Home 
            posts={posts} 
            postCategories={postCategories} 
            documents={documents} 
            docCategories={docCategories}
            config={config} 
            gallery={galleryImages}
            blocks={blocks}
            introductions={introductions}
            staffList={staffList} 
            onNavigate={navigate} 
          />
        )}

        {currentPage === 'intro' && <Introduction config={config} />}
        
        {currentPage === 'staff' && <Staff staffList={staffList} />}

        {currentPage === 'documents' && (
          <Documents 
              documents={documents} 
              categories={docCategories} 
              initialCategorySlug={detailId || 'official'} 
          />
        )}
        
        {currentPage === 'resources' && (
          <Documents 
              documents={documents} 
              categories={docCategories} 
              initialCategorySlug="resource" 
          />
        )}
        
        {currentPage === 'gallery' && <Gallery images={galleryImages} albums={albums} />}

        {currentPage === 'news' && (
          <div className="container mx-auto px-4 py-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center mb-8 pb-3 border-b-2 border-blue-900">
                    <h2 className="text-3xl font-extrabold text-blue-900 uppercase">Tin tức & Sự kiện</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.filter(p => p.status === 'published').map(post => {
                    const cat = postCategories.find(c => c.slug === post.category);
                    return (
                    <div key={post.id} onClick={() => navigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full">
                    <div className="overflow-hidden rounded-lg mb-4 border border-gray-200 shadow-sm h-56">
                        <img src={post.thumbnail} className="h-full w-full object-cover transform group-hover:scale-105 transition duration-500" alt={post.title}/>
                    </div>
                    <span className={`text-xs font-bold uppercase mb-2 block text-${cat?.color || 'blue'}-600 tracking-wide`}>
                        {cat?.name || 'Tin tức'}
                    </span>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-blue-700 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-base text-gray-600 line-clamp-3 mb-4 flex-grow leading-relaxed">{post.summary}</p>
                    <div className="text-sm text-gray-400 mt-auto pt-3 border-t border-gray-100">{post.date}</div>
                    </div>
                )})}
                </div>
            </div>
          </div>
        )}

        {currentPage === 'news-detail' && detailId && (
          <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                    {(() => {
                      const post = currentDetailPost?.id === detailId ? currentDetailPost : posts.find(p => p.id === detailId);
                      
                      if (!post) return <div className="p-10 text-center bg-white rounded shadow text-lg">Bài viết không tồn tại</div>;
                      // Fallback content if loading
                      if (!post.content && !currentDetailPost) return <div className="p-20 text-center"><Loader2 className="animate-spin inline mr-2"/> Đang tải nội dung...</div>;

                      const cat = postCategories.find(c => c.slug === post.category);
                      return (
                        <article className="bg-white p-8 md:p-10 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
                            <div className="mb-8">
                              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-5">{post.title}</h1>
                              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm md:text-base border-b pb-5 border-gray-100">
                                <span className={`font-bold text-${cat?.color || 'blue'}-700 uppercase`}>{(cat?.name || post.category)}</span>
                                <span>|</span>
                                <span className="flex items-center gap-1 font-medium text-gray-600">{post.date}</span>
                                <span>|</span>
                                <span>Tác giả: <span className="font-medium text-gray-800">{post.author}</span></span>
                                <span>|</span>
                                <span>{post.views} lượt xem</span>
                              </div>

                              {/* SOCIAL SHARE BUTTONS */}
                              <div className="flex items-center gap-3 mt-5">
                                  <span className="text-sm font-bold text-gray-500 uppercase">Chia sẻ:</span>
                                  <a 
                                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-1.5 bg-[#1877F2] text-white rounded hover:bg-blue-700 transition text-sm font-bold shadow-sm"
                                  >
                                      <Facebook size={16} fill="currentColor"/> Facebook
                                  </a>
                                  <a 
                                      href={`https://zalo.me/share/?url=${encodeURIComponent(window.location.href)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-1.5 bg-[#0068FF] text-white rounded hover:bg-blue-600 transition text-sm font-bold shadow-sm"
                                  >
                                      <Share2 size={16} /> Zalo
                                  </a>
                              </div>
                            </div>
                            
                            <div className="font-semibold text-xl text-gray-800 mb-8 italic bg-gray-50 p-6 border-l-4 border-blue-500 rounded-r leading-relaxed">
                              {post.summary}
                            </div>

                            <div 
                              className="prose prose-xl prose-blue max-w-none text-gray-900 leading-loose text-justify"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            
                            {post.attachments && post.attachments.length > 0 && (
                              <div className="mt-10 pt-8 border-t border-gray-200">
                                <h4 className="font-bold text-gray-900 text-lg mb-5 flex items-center bg-gray-100 p-3 rounded-lg"><Paperclip size={20} className="mr-2"/> Tài liệu đính kèm</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {post.attachments.map(att => (
                                      <div key={att.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition bg-white group shadow-sm">
                                          <div className="flex items-center overflow-hidden mr-3">
                                            <div className="bg-blue-100 p-2.5 rounded-lg mr-4 text-blue-700">
                                                <FileText size={24}/>
                                            </div>
                                            <div>
                                                <span className="text-base font-bold text-gray-900 group-hover:text-blue-700 block">{att.name}</span>
                                                <span className="text-sm text-gray-500 uppercase font-medium">{att.fileType || 'FILE'}</span>
                                            </div>
                                          </div>
                                          <a href={att.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 p-2 hover:bg-white rounded-full">
                                              <Download size={24} />
                                          </a>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </article>
                      );
                    })()}
                </div>

                <div className="lg:col-span-4">
                    <Sidebar 
                      blocks={sidebarBlocks} 
                      posts={posts} 
                      postCategories={postCategories}
                      documents={documents}
                      docCategories={docCategories}
                      videos={videos} 
                      onNavigate={navigate} 
                      currentPage="news-detail" 
                    />
                </div>
              </div>
          </div>
        )}
        
        {currentPage === 'contact' && (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-3xl font-extrabold mb-8 text-blue-900 border-b pb-4 uppercase">Liên hệ công tác</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4 text-base">
                            <p className="text-gray-800"><strong>Địa chỉ:</strong> {config?.address}</p>
                            <p className="text-gray-800"><strong>Điện thoại:</strong> {config?.phone}</p>
                            <p className="text-gray-800"><strong>Email:</strong> {config?.email}</p>
                            {config?.mapUrl && (
                                <div className="mt-6 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                                    <iframe src={config.mapUrl} width="100%" height="350" style={{border:0}} loading="lazy"></iframe>
                                </div>
                            )}
                        </div>
                        <div>
                            <form className="space-y-5">
                                <input type="text" placeholder="Họ và tên" className="w-full border p-4 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-base"/>
                                <input type="email" placeholder="Email" className="w-full border p-4 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-base"/>
                                <textarea rows={5} placeholder="Nội dung liên hệ" className="w-full border p-4 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-base"></textarea>
                                <button className="bg-blue-800 text-white px-8 py-4 rounded-lg font-bold uppercase hover:bg-blue-900 transition shadow-lg w-full text-base">Gửi liên hệ</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
      
      {config && !currentPage.startsWith('admin') && (
         <>
            <FloatingContact config={config} />
            <ScrollToTop />
         </>
      )}

      {config && <Footer config={config} />}
    </div>
  );
};

export default App;
