
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar'; 
import { AdminLayout } from './components/AdminLayout';
import { Home } from './pages/Home';
import { Introduction } from './pages/Introduction';
import { Documents } from './pages/Documents';
import { Gallery } from './pages/Gallery';
import { Staff } from './pages/Staff'; 
import { Login } from './pages/Login'; 
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
import { Dashboard } from './pages/admin/Dashboard';
import { DatabaseService } from './services/database'; 
import { supabase } from './services/supabaseClient';
import { PageRoute, Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, DisplayBlock, MenuItem, DocumentCategory, StaffMember, IntroductionArticle, PostCategory } from './types';
import { Loader2, Paperclip, FileText, Download } from 'lucide-react';

const FALLBACK_CONFIG: SchoolConfig = {
  name: 'Trường Học VinaEdu',
  slogan: 'Hệ thống đang bảo trì hoặc mất kết nối',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Vui lòng kiểm tra kết nối internet',
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
  metaTitle: 'Trường học',
  metaDescription: ''
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCategories, setPostCategories] = useState<PostCategory[]>([]); // New State
  const [introductions, setIntroductions] = useState<IntroductionArticle[]>([]); 
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [docCategories, setDocCategories] = useState<DocumentCategory[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Helper to safely update URL without crashing in sandboxes/blobs
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

    // Handle initial URL mapping
    handleUrlRouting();

    // Listen to browser back/forward buttons
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

      // Logic for /admin path (if supported by env)
      if (path === '/admin' || path === '/admin/') {
        setCurrentPage('login'); 
      } 
      // Logic for query params (e.g. ?page=news)
      else if (pageParam) {
        setCurrentPage(pageParam as PageRoute);
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

  // Update Page Title
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

  // Redirect if on login page but already logged in
  useEffect(() => {
    if (currentPage === 'login' && currentUser) {
      setCurrentPage('admin-dashboard');
    }
  }, [currentPage, currentUser]);

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
            fetchedPostCats
        ] = await Promise.all([
            DatabaseService.getConfig().catch(() => FALLBACK_CONFIG),
            DatabaseService.getPosts().catch(() => []),
            DatabaseService.getDocuments().catch(() => []),
            DatabaseService.getDocCategories().catch(() => []),
            DatabaseService.getGallery().catch(() => []),
            DatabaseService.getAlbums().catch(() => []),
            DatabaseService.getBlocks().catch(() => []),
            DatabaseService.getMenu().catch(() => []),
            DatabaseService.getStaff().catch(() => []),
            DatabaseService.getIntroductions().catch(() => []),
            DatabaseService.getPostCategories().catch(() => [])
        ]);

        setConfig(fetchedConfig);
        setPosts(fetchedPosts);
        setDocuments(fetchedDocs);
        setDocCategories(fetchedCats);
        setGalleryImages(fetchedGallery);
        setAlbums(fetchedAlbums);
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
    // Update URL cosmetic
    safePushState('/?page=admin-dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
    safePushState('/?page=login');
  };

  const navigate = (path: string, id?: string) => {
    // Admin check
    if (path.startsWith('admin')) {
       if (!currentUser) {
         setCurrentPage('login');
         safePushState('/?page=login');
         return;
       }
    }

    if (id) setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);

    // Update Browser URL for UX (Cosmetic Routing)
    let newUrl = '/';
    if (path === 'home') newUrl = '/';
    else if (path === 'login') newUrl = '/admin'; // Special case for login
    else newUrl = `/?page=${path}${id ? `&id=${id}` : ''}`;
    
    safePushState(newUrl);
  };

  // --- Rendering Logic ---

  if (loading || !config) {
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
      if (currentUser) return null; // Redirect handled by useEffect
      return <Login onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
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

  // Public Pages Layout
  const sidebarBlocks = blocks.filter(b => b.position === 'sidebar');

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header config={config} menuItems={menuItems} onNavigate={navigate} activePath={currentPage} />
      
      <main className="flex-grow w-full">
        {currentPage === 'home' && (
          <Home 
            posts={posts} 
            postCategories={postCategories} // Pass categories
            config={config} 
            gallery={galleryImages}
            blocks={blocks}
            introductions={introductions}
            onNavigate={navigate} 
          />
        )}

        {currentPage === 'intro' && <Introduction config={config} />}
        
        {currentPage === 'staff' && <Staff staffList={staffList} />}

        {currentPage === 'documents' && (
          <Documents 
              documents={documents} 
              categories={docCategories} 
              initialCategorySlug="official" 
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
          <div className="container mx-auto px-4 py-10">
            <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
                <div className="flex items-center mb-8 pb-2 border-b-2 border-blue-900">
                    <h2 className="text-2xl font-bold text-blue-900 uppercase">Tin tức & Sự kiện</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.filter(p => p.status === 'published').map(post => {
                    const cat = postCategories.find(c => c.slug === post.category);
                    return (
                    <div key={post.id} onClick={() => navigate('news-detail', post.id)} className="group cursor-pointer flex flex-col h-full">
                    <div className="overflow-hidden rounded mb-3 border border-gray-200">
                        <img src={post.thumbnail} className="h-48 w-full object-cover transform group-hover:scale-105 transition duration-500" alt={post.title}/>
                    </div>
                    <span className={`text-xs font-bold uppercase mb-1 block text-${cat?.color || 'blue'}-600`}>
                        {cat?.name || 'Tin tức'}
                    </span>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-gray-700 text-sm line-clamp-2 mb-2 flex-grow">{post.summary}</p>
                    <div className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">{post.date}</div>
                    </div>
                )})}
                </div>
            </div>
          </div>
        )}

        {currentPage === 'news-detail' && detailId && (
          <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {(() => {
                      const post = posts.find(p => p.id === detailId);
                      if (!post) return <div className="p-10 text-center bg-white rounded shadow">Bài viết không tồn tại</div>;
                      const cat = postCategories.find(c => c.slug === post.category);
                      return (
                        <article className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
                            <div className="mb-6">
                              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                              <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm border-b pb-4 border-gray-100">
                                <span className={`font-bold text-${cat?.color || 'blue'}-700`}>{(cat?.name || post.category).toUpperCase()}</span>
                                <span>|</span>
                                <span className="flex items-center gap-1">{post.date}</span>
                                <span>|</span>
                                <span>Tác giả: {post.author}</span>
                                <span>|</span>
                                <span>{post.views} lượt xem</span>
                              </div>
                            </div>
                            
                            <div className="font-semibold text-lg text-gray-800 mb-6 italic bg-gray-50 p-4 border-l-4 border-blue-500 rounded-r">
                              {post.summary}
                            </div>

                            <div 
                              className="prose prose-blue prose-lg max-w-none text-gray-900 leading-relaxed text-justify"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            
                            {post.attachments && post.attachments.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center bg-gray-100 p-2 rounded"><Paperclip size={18} className="mr-2"/> Tài liệu đính kèm</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {post.attachments.map(att => (
                                      <div key={att.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-blue-50 transition bg-white group">
                                          <div className="flex items-center overflow-hidden mr-3">
                                            <div className="bg-blue-100 p-2 rounded mr-3 text-blue-700">
                                                <FileText size={20}/>
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700 block">{att.name}</span>
                                                <span className="text-xs text-gray-500 uppercase">{att.fileType || 'FILE'}</span>
                                            </div>
                                          </div>
                                          <a href={att.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600">
                                              <Download size={20} />
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
                      onNavigate={navigate} 
                      currentPage="news-detail" 
                    />
                </div>
              </div>
          </div>
        )}
        
        {currentPage === 'contact' && (
            <div className="container mx-auto px-4 py-10">
                <div className="bg-white p-8 rounded shadow border border-gray-200">
                    <h2 className="text-2xl font-bold mb-6 text-blue-900 border-b pb-2 uppercase">Liên hệ công tác</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="mb-4 text-gray-800"><strong>Địa chỉ:</strong> {config?.address}</p>
                            <p className="mb-4 text-gray-800"><strong>Điện thoại:</strong> {config?.phone}</p>
                            <p className="mb-4 text-gray-800"><strong>Email:</strong> {config?.email}</p>
                            {config?.mapUrl && (
                                <div className="mt-4">
                                    <iframe src={config.mapUrl} width="100%" height="300" style={{border:0}} loading="lazy"></iframe>
                                </div>
                            )}
                        </div>
                        <div>
                            <form className="space-y-4">
                                <input type="text" placeholder="Họ và tên" className="w-full border p-3 rounded bg-gray-50 text-gray-900"/>
                                <input type="email" placeholder="Email" className="w-full border p-3 rounded bg-gray-50 text-gray-900"/>
                                <textarea rows={4} placeholder="Nội dung liên hệ" className="w-full border p-3 rounded bg-gray-50 text-gray-900"></textarea>
                                <button className="bg-blue-800 text-white px-6 py-3 rounded font-bold uppercase hover:bg-blue-900 transition">Gửi liên hệ</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
      
      {config && <Footer config={config} />}
    </div>
  );
};

export default App;
