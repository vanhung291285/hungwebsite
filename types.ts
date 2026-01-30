
export enum UserRole {
  ADMIN = 'ADMIN',   // Quản trị viên cao cấp
  EDITOR = 'EDITOR', // Biên tập viên
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  email: string;
}

export interface DisplayBlock {
  id: string;
  name: string;
  position: 'main' | 'sidebar';
  type: 'hero' | 'grid' | 'list' | 'highlight' | 'docs' | 'html' | 'stats' | 'doc_cats' | 'video' | 'calendar' | 'staff_list'; 
  order: number;
  itemCount: number;
  isVisible: boolean;
  htmlContent?: string; 
  targetPage: 'all' | 'home' | 'detail'; 
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'file' | 'link';
  fileType?: string;
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  color: string; // e.g., 'blue', 'red', 'green', 'indigo'
  order: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  thumbnail: string;
  imageCaption?: string;
  author: string;
  date: string;
  category: string; // Changed from union type to string (slug)
  additionalCategories?: string[];
  tags: string[];
  views: number;
  status: 'draft' | 'published' | 'scheduled'; 
  publishedAt?: string; 
  isFeatured: boolean;
  showOnHome: boolean;
  blockIds: string[];
  attachments: Attachment[];
}

export interface IntroductionArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  order: number;
  isVisible: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string; // unique identifier for routing/filtering
  description?: string;
  order: number; // Added order field
}

export interface SchoolDocument {
  id: string;
  number: string;
  title: string;
  date: string;
  categoryId: string; // Changed from fixed type to categoryId
  downloadUrl: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  createdDate: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  albumId: string; // Link to album
}

export interface Video {
  id: string;
  title: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail: string; // Auto-generated from youtube
  isVisible: boolean;
  order: number;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
}

export interface SchoolConfig {
  name: string;
  slogan: string;
  logoUrl: string;
  faviconUrl?: string; // NEW FIELD for Favicon
  bannerUrl: string;
  principalName: string;
  address: string;
  phone: string;
  email: string;
  hotline: string;
  mapUrl: string;
  facebook: string;
  youtube: string;
  website: string;
  showWelcomeBanner: boolean; // Controls Hero Block visibility
  homeNewsCount: number;      // NEW: Controls Grid Block item count globally
  homeShowProgram: boolean;   // NEW: Controls Category/Highlight Blocks visibility
  primaryColor: string;
  metaTitle: string;
  metaDescription: string;
}

export interface StatData {
  name: string;
  value: number;
}

export interface StaffMember {
  id: string;
  fullName: string;
  position: string;
  partyDate?: string; // Ngày vào đảng
  email: string;
  avatarUrl: string;
  order: number;
}

export interface VisitorStats {
  online: number;
  today: number;
  month: number;
  total: number;
}

export type PageRoute = 
  | 'home' 
  | 'intro'           
  | 'news' 
  | 'news-detail' 
  | 'documents'       
  | 'resources'       
  | 'gallery'         
  | 'contact' 
  | 'staff'           
  | 'login' 
  | 'register'        // ADDED REGISTER ROUTE
  | 'admin-dashboard' 
  | 'admin-news' 
  | 'admin-categories' 
  | 'admin-blocks'
  | 'admin-docs'
  | 'admin-gallery'
  | 'admin-videos' 
  | 'admin-users'
  | 'admin-staff'
  | 'admin-intro'
  | 'admin-menu'
  | 'admin-settings';
