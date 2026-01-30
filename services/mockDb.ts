
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, Video } from '../types';

const STORAGE_KEYS = {
  POSTS: 'vinaedu_posts_v5', 
  CONFIG: 'vinaedu_config_v4', 
  DOCS: 'vinaedu_docs_v2', 
  DOC_CATS: 'vinaedu_doc_cats',
  USERS: 'vinaedu_users_v2',
  GALLERY: 'vinaedu_gallery_v2', 
  ALBUMS: 'vinaedu_albums_v1',   
  VIDEOS: 'vinaedu_videos_v1', // NEW
  MENU: 'vinaedu_menu_v2', 
  BLOCKS: 'vinaedu_blocks_v3', 
  INIT: 'vinaedu_initialized_v20', // Bumped version
  SESSION: 'vinaedu_session_user'
};

const DEFAULT_CONFIG: SchoolConfig = {
  // General
  name: 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan: 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logoUrl: '',
  faviconUrl: '', 
  bannerUrl: 'https://i.imgur.com/8QZq1jS.jpeg',
  principalName: '',
  
  // Contact
  address: 'Xã Suối Lư, Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '',
  hotline: '',
  email: '',
  mapUrl: '',

  // Social
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  website: '',

  // Display
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a', 

  // SEO
  metaTitle: 'Trường PTDTBT TH và THCS Suối Lư',
  metaDescription: 'Cổng thông tin điện tử chính thức của Trường PTDTBT TH và THCS Suối Lư.'
};

const DEFAULT_DOC_CATS: DocumentCategory[] = [
  { id: 'cat_official', name: 'Công khai cơ sở giáo dục', slug: 'official', description: 'Quyết định, thông báo chính thức', order: 1 },
  { id: 'cat_plans', name: 'Kế hoạch', slug: 'plans', description: 'Kế hoạch năm học, tháng', order: 2 },
  { id: 'cat_resource', name: 'Tài liệu học tập', slug: 'resource', description: 'Đề cương, bài giảng', order: 3 },
  { id: 'cat_reports', name: 'Báo cáo - Tờ trình', slug: 'reports', description: 'Báo cáo sơ kết, tổng kết', order: 4 },
  { id: 'cat_decisions', name: 'Quyết định', slug: 'decisions', description: 'Quyết định khen thưởng, kỷ luật', order: 5 },
  { id: 'cat_timetable', name: 'Thời khóa biểu', slug: 'timetable', description: 'Lịch học các khối lớp', order: 6 },
];

const DEFAULT_DOCS: SchoolDocument[] = [
  { 
      id: '1', 
      number: '125/QĐ-THPT', 
      title: 'Quyết định về việc thành lập Ban chỉ đạo thi THPT Quốc gia 2024', 
      date: '2024-05-10', 
      categoryId: 'cat_decisions', 
      downloadUrl: '#' 
  },
  { 
      id: '2', 
      number: 'TB-01', 
      title: 'Thời khóa biểu học kỳ 1 năm học 2024-2025 (Chính thức)', 
      date: '2024-08-15', 
      categoryId: 'cat_timetable', 
      downloadUrl: '#' 
  },
];

const DEFAULT_VIDEOS: Video[] = [
  { id: 'v1', title: 'Giới thiệu Trường', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', youtubeId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', isVisible: true, order: 1 }
];

const DEFAULT_BLOCKS: DisplayBlock[] = [
  // Main Content Blocks
  { id: 'block_hero', name: 'Slide Tin Nổi Bật', position: 'main', type: 'hero', order: 1, itemCount: 3, isVisible: true, targetPage: 'home' },
  { id: 'block_latest', name: 'Tin tức - Sự kiện', position: 'main', type: 'grid', order: 2, itemCount: 6, isVisible: true, targetPage: 'home' },
  { id: 'block_activity', name: 'Hoạt động Ngoại khóa', position: 'main', type: 'highlight', order: 3, itemCount: 4, isVisible: true, targetPage: 'home' },
  
  // Sidebar Blocks
  { id: 'block_calendar', name: 'LỊCH THÁNG', position: 'sidebar', type: 'calendar', order: 0, itemCount: 1, isVisible: true, targetPage: 'all' }, // NEW CALENDAR BLOCK
  { id: 'block_doc_cats', name: 'DANH MỤC VĂN BẢN', position: 'sidebar', type: 'doc_cats', order: 1, itemCount: 10, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_latest', name: 'TIN MỚI NHẤT', position: 'sidebar', type: 'list', order: 2, itemCount: 5, isVisible: true, targetPage: 'all' },
  { id: 'block_video', name: 'THƯ VIỆN VIDEO', position: 'sidebar', type: 'video', order: 3, itemCount: 1, isVisible: true, targetPage: 'all' },
  { id: 'block_sidebar_docs', name: 'Văn bản mới nhất', position: 'sidebar', type: 'docs', order: 4, itemCount: 5, isVisible: true, targetPage: 'all' },
  { 
    id: 'block_sidebar_html', 
    name: 'Liên kết website', 
    position: 'sidebar', 
    type: 'html', 
    order: 5, 
    itemCount: 1, 
    isVisible: true, 
    targetPage: 'all',
    htmlContent: '<ul class="space-y-2"><li class="border-b pb-1"><a href="https://moet.gov.vn/" class="text-blue-700 hover:underline" target="_blank">Bộ Giáo dục & Đào tạo</a></li><li class="border-b pb-1"><a href="http://sogddt.dienbien.gov.vn/" class="text-blue-700 hover:underline" target="_blank">Sở GD&ĐT Điện Biên</a></li></ul>'
  },
  { id: 'block_stats', name: 'Thống kê truy cập', position: 'sidebar', type: 'stats', order: 6, itemCount: 1, isVisible: true, targetPage: 'all' },
];

const DEFAULT_POSTS: Post[] = [
  {
    id: '1',
    title: 'Lễ Khai giảng năm học mới 2024-2025',
    slug: 'le-khai-giang-nam-hoc-moi-2024-2025',
    summary: 'Hòa chung không khí tưng bừng của cả nước, sáng ngày 5/9, thầy và trò nhà trường đã long trọng tổ chức Lễ khai giảng.',
    content: '<p>Nội dung bài viết...</p>',
    thumbnail: 'https://picsum.photos/800/400?random=1',
    imageCaption: 'Toàn cảnh lễ khai giảng',
    author: 'Ban Truyền Thông',
    date: '2024-09-05',
    category: 'news',
    tags: ['khai giảng'],
    views: 1250,
    status: 'published',
    isFeatured: true,
    showOnHome: true,
    blockIds: ['block_hero', 'block_latest'],
    attachments: []
  }
];

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', fullName: 'Quản trị viên', role: UserRole.ADMIN, email: 'admin@school.edu.vn' },
];

const DEFAULT_MENU: MenuItem[] = [
  { id: '1', label: 'Trang chủ', path: 'home', order: 1 },
  { id: '2', label: 'Giới thiệu', path: 'intro', order: 2 },
  { id: '6', label: 'Đội ngũ GV', path: 'staff', order: 3 },
  { id: '3', label: 'Tin tức', path: 'news', order: 4 },
  { id: '4', label: 'Văn bản', path: 'documents', order: 5 },
  { id: '5', label: 'Thư viện', path: 'gallery', order: 6 },
];

const DEFAULT_ALBUMS: GalleryAlbum[] = [
  { id: 'album_1', title: 'Hoạt động Khai giảng 2024', description: 'Hình ảnh lễ khai giảng năm học mới', thumbnail: 'https://picsum.photos/600/400?random=10', createdDate: '2024-09-05' },
];

const DEFAULT_GALLERY: GalleryImage[] = [
   { id: '1', url: 'https://picsum.photos/600/400?random=10', caption: 'Khai giảng 1', albumId: 'album_1' },
];

export const MockDb = {
  init: () => {
    if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(DEFAULT_DOCS));
      localStorage.setItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(DEFAULT_DOC_CATS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(DEFAULT_GALLERY));
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(DEFAULT_ALBUMS));
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(DEFAULT_MENU));
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(DEFAULT_BLOCKS));
      localStorage.setItem(STORAGE_KEYS.INIT, 'true');
    }
  },

  getConfig: (): SchoolConfig => JSON.parse(localStorage.getItem(STORAGE_KEYS.CONFIG) || '{}'),
  saveConfig: (config: SchoolConfig) => { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)); },

  // Auth
  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },
  logout: () => { localStorage.removeItem(STORAGE_KEYS.SESSION); },
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  saveUser: (user: User) => {
    const users = MockDb.getUsers();
    if (!user.password) user.password = '123456'; 
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) { user.password = users[index].password; users[index] = user; } 
    else { users.push(user); }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  deleteUser: (id: string) => {
      const users = MockDb.getUsers().filter(u => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // Posts
  getPosts: (): Post[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]'),
  savePost: (post: Post) => {
    const posts = MockDb.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) posts[index] = post; else posts.unshift(post);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },
  deletePost: (id: string) => {
    const posts = MockDb.getPosts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  // Blocks
  getBlocks: (): DisplayBlock[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKS) || '[]'),
  saveBlock: (block: DisplayBlock) => {
    const blocks = MockDb.getBlocks();
    const index = blocks.findIndex(b => b.id === block.id);
    if (index >= 0) blocks[index] = block; else blocks.push(block);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  },
  deleteBlock: (id: string) => {
    const blocks = MockDb.getBlocks().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
  },
  saveBlocksOrder: (blocks: DisplayBlock[]) => { localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks)); },

  // Docs
  getDocCategories: (): DocumentCategory[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DOC_CATS) || '[]'),
  saveDocCategory: (cat: DocumentCategory) => {
    const cats = MockDb.getDocCategories();
    const index = cats.findIndex(c => c.id === cat.id);
    if (index >= 0) cats[index] = cat; else cats.push(cat);
    localStorage.setItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(cats));
  },
  deleteDocCategory: (id: string) => {
    const cats = MockDb.getDocCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOC_CATS, JSON.stringify(cats));
  },
  getDocuments: (categoryId?: string) => {
     const docs: SchoolDocument[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS) || '[]');
     return categoryId ? docs.filter(d => d.categoryId === categoryId) : docs;
  },
  saveDocument: (doc: any) => {
      const docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS) || '[]');
      const index = docs.findIndex((d:any) => d.id === doc.id);
      if (index >= 0) docs[index] = doc; else docs.unshift(doc);
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  },
  deleteDocument: (id: string) => {
      const docs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCS) || '[]').filter((d:any) => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  },
  
  // Gallery
  getAlbums: (): GalleryAlbum[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ALBUMS) || '[]'),
  saveAlbum: (album: GalleryAlbum) => {
      const albums = MockDb.getAlbums();
      const index = albums.findIndex(a => a.id === album.id);
      if (index >= 0) albums[index] = album; else albums.unshift(album);
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  },
  deleteAlbum: (id: string) => {
      const albums = MockDb.getAlbums().filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  },
  getGallery: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]'),
  saveImage: (img: any) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]');
      images.unshift(img);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
  },
  deleteImage: (id: string) => {
      const images = JSON.parse(localStorage.getItem(STORAGE_KEYS.GALLERY) || '[]').filter((i:any) => i.id !== id);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
  },

  // Videos
  getVideos: (): Video[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEOS) || '[]'),
  saveVideo: (video: Video) => {
      const videos = MockDb.getVideos();
      const index = videos.findIndex(v => v.id === video.id);
      if (index >= 0) videos[index] = video; else videos.push(video);
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  },
  deleteVideo: (id: string) => {
      const videos = MockDb.getVideos().filter(v => v.id !== id);
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  },

  getMenu: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU) || '[]'),
  saveMenu: (items: any) => localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items)),
};
