
-- Chạy toàn bộ Script này trong SQL Editor của Supabase để tạo cấu trúc bảng

-- 1. Bảng Cấu hình trường học (Lưu 1 dòng duy nhất)
CREATE TABLE school_config (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  slogan TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  banner_url TEXT,
  principal_name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  hotline TEXT,
  map_url TEXT,
  facebook TEXT,
  youtube TEXT,
  website TEXT,
  show_welcome_banner BOOLEAN DEFAULT true,
  primary_color TEXT,
  meta_title TEXT,
  meta_description TEXT
);

-- Insert dữ liệu mặc định
INSERT INTO school_config (name, slogan, primary_color) VALUES ('Trường Mẫu', 'Dạy tốt - Học tốt', '#1e3a8a');

-- 2. Bảng Danh mục tài liệu
CREATE TABLE document_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Tài liệu
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT, -- Số hiệu
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  download_url TEXT,
  category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Tin tức / Bài viết
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT,
  content TEXT,
  thumbnail TEXT,
  image_caption TEXT,
  author TEXT,
  date DATE DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('news', 'announcement', 'activity', 'professional')),
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  is_featured BOOLEAN DEFAULT false,
  show_on_home BOOLEAN DEFAULT true,
  
  -- Lưu mảng JSON
  tags JSONB DEFAULT '[]'::jsonb, 
  block_ids JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Albums Ảnh
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng Ảnh trong Album
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng Menu
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  path TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- 8. Bảng Khối hiển thị (Blocks)
CREATE TABLE display_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT CHECK (position IN ('main', 'sidebar')),
  type TEXT CHECK (type IN ('hero', 'grid', 'list', 'highlight', 'docs', 'html', 'stats')),
  order_index INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 5,
  is_visible BOOLEAN DEFAULT true,
  html_content TEXT,
  target_page TEXT DEFAULT 'all'
);

-- 9. Bảng Users
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('ADMIN', 'EDITOR', 'GUEST')) DEFAULT 'GUEST'
);

-- 10. Bảng Danh sách cán bộ (NEW)
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date DATE,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bật Row Level Security (RLS) để bảo mật
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- (Thêm policy cho phép đọc public, ghi cho admin - ở đây cho phép public để test dễ dàng)
CREATE POLICY "Public Read Posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Public Read Config" ON school_config FOR SELECT USING (true);
CREATE POLICY "Public Read Docs" ON documents FOR SELECT USING (true);
CREATE POLICY "Public Read Cats" ON document_categories FOR SELECT USING (true);
CREATE POLICY "Public Read Menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public Read Blocks" ON display_blocks FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public Read Albums" ON gallery_albums FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON staff_members FOR SELECT USING (true);

-- Chính sách Ghi (Insert/Update/Delete) nên chỉ dành cho Authenticated Users
CREATE POLICY "Auth Write Posts" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Docs" ON documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Config" ON school_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Staff" ON staff_members FOR ALL USING (auth.role() = 'authenticated');
