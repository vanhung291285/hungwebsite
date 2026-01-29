
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
import { Dashboard } from './pages/admin/Dashboard';
import { DatabaseService } from './services/database'; 
import { supabase } from './services/supabaseClient';
import { PageRoute, Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, DisplayBlock, MenuItem, DocumentCategory, StaffMember } from './types';
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
  primaryColor: '#1e3a8a',
  metaTitle: 'Trường học',
  metaDescription: ''
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [detailId, setDetailId] = useState<string | undefined>(undefined);
  
  // Data State
  const [posts, setPosts] = useState<Post[]>([]);
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

    return () => subscription.unsubscribe();
  }, []);

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
            fetchedStaff
        ] = await Promise.all([
            DatabaseService.getConfig().catch(() => FALLBACK_CONFIG),
            DatabaseService.getPosts().catch(() => []),
            DatabaseService.getDocuments().catch(() => []),
            DatabaseService.getDocCategories().catch(() => []),
            DatabaseService.getGallery().catch(() => []),
            DatabaseService.getAlbums().catch(() => []),
            DatabaseService.getBlocks().catch(() => []),
            DatabaseService.getMenu().catch(() => []),
            DatabaseService.getStaff().catch(() => [])
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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const navigate = (path: string, id?: string) => {
    if (path.startsWith('admin')) {
       if (!currentUser) {
         setCurrentPage('login');
         return;
       }
    }
    if (id) setDetailId(id);
    setCurrentPage(path as PageRoute);
    window.scrollTo(0, 0);
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
        {currentPage === 'admin-news' && <ManageNews posts={posts} refreshData={refreshData} />}
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
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-slate-800">
      <Header config={config} menuItems={menuItems} onNavigate={navigate} activePath={currentPage} />
      
      <main className="flex-grow">
        {currentPage === 'home' && (
          <Home 
            posts={posts} 
            config={config} 
            gallery={galleryImages}
            blocks={blocks}
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
            <div className="flex items-center mb-8 pb-2 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-blue-900 uppercase">Tin tức & Sự kiện</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.filter(p => p.status === 'published').map(post => (
                <div key={post.id} onClick={() => navigate('news-detail', post.id)} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-lg mb-3">
                      <img src={post.thumbnail} className="h-56 w-full object-cover transform group-hover:scale-105 transition duration-500" alt={post.title}/>
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase mb-1 block">
                      {post.category === 'news' ? 'Tin tức' : post.category === 'announcement' ? 'Thông báo' : 'Hoạt động'}
                  </span>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-700 leading-snug">{post.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.summary}</p>
                  <div className="text-xs text-gray-400 mt-2">{post.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'news-detail' && detailId && (
          <div className="container mx-auto px-4 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {(() => {
                      const post = posts.find(p => p.id === detailId);
                      if (!post) return <div>Bài viết không tồn tại</div>;
                      return (
                        <article className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                            <div className="mb-6">
                              <button onClick={() => navigate('news')} className="text-blue-600 hover:underline text-sm mb-2">← Quay lại danh sách</button>
                              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-8 border-b pb-4 bg-gray-50 p-3 rounded">
                              <span className="font-semibold text-blue-800">{post.author}</span>
                              <span>|</span>
                              <span>{post.date}</span>
                              <span>|</span>
                              <span>{post.views} lượt xem</span>
                            </div>
                            
                            <div className="font-bold text-lg text-gray-700 mb-6 italic border-l-4 border-gray-300 pl-4 bg-gray-50 p-4 rounded">
                              {post.summary}
                            </div>

                            <div 
                              className="prose prose-blue max-w-none text-gray-800 leading-relaxed text-justify"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            
                            {post.attachments && post.attachments.length > 0 && (
                              <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center"><Paperclip size={18} className="mr-2"/> Tài liệu đính kèm</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {post.attachments.map(att => (
                                      <div key={att.id} className="flex items-center justify-between p-3 border rounded hover:bg-blue-50 transition bg-gray-50">
                                          <div className="flex items-center overflow-hidden mr-3">
                                            <div className="bg-blue-200 p-2 rounded mr-3 text-blue-800">
                                                <FileText size={20}/>
                                            </div>
                                            <span className="text-sm font-medium text-blue-900 truncate">{att.name}</span>
                                          </div>
                                          <Download size={18} className="text-gray-500" />
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
                <h2 className="text-2xl font-bold mb-4">Liên hệ</h2>
                <p>Nội dung liên hệ...</p>
            </div>
        )}

      </main>
      
      {config && <Footer config={config} />}
    </div>
  );
};

export default App;
