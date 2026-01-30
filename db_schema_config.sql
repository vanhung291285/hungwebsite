
-- ==============================================================================
-- SCRIPT SỬA LỖI LƯU CẤU HÌNH WEBSITE (CONFIG)
-- Hướng dẫn: Copy toàn bộ nội dung này vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Đảm bảo bảng tồn tại
CREATE TABLE IF NOT EXISTS school_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  slogan TEXT,
  logo_url TEXT,
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
  home_news_count INTEGER DEFAULT 6,
  home_show_program BOOLEAN DEFAULT true,
  primary_color TEXT DEFAULT '#1e3a8a',
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bổ sung các cột mới (nếu database cũ chưa có)
ALTER TABLE school_config ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE school_config ADD COLUMN IF NOT EXISTS home_news_count INTEGER DEFAULT 6;
ALTER TABLE school_config ADD COLUMN IF NOT EXISTS home_show_program BOOLEAN DEFAULT true;
ALTER TABLE school_config ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1e3a8a';

-- 3. CẤU HÌNH QUYỀN TRUY CẬP (RLS) - QUAN TRỌNG NHẤT
ALTER TABLE school_config ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Public Read Config" ON school_config;
DROP POLICY IF EXISTS "Auth Update Config" ON school_config;
DROP POLICY IF EXISTS "Auth Insert Config" ON school_config;
DROP POLICY IF EXISTS "Everyone Read Config" ON school_config;

-- Tạo Policy mới:
-- Cho phép TẤT CẢ mọi người (kể cả khách) XEM cấu hình
CREATE POLICY "Public Read Config" ON school_config 
FOR SELECT 
USING (true);

-- Cho phép ADMIN (đã đăng nhập) được phép SỬA (UPDATE)
CREATE POLICY "Auth Update Config" ON school_config 
FOR UPDATE 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- Cho phép ADMIN được phép THÊM (INSERT) - đề phòng trường hợp bảng rỗng
CREATE POLICY "Auth Insert Config" ON school_config 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 4. Tạo dòng dữ liệu mặc định nếu bảng đang rỗng
INSERT INTO school_config (name, slogan, address)
SELECT 'Trường Mẫu', 'Chưa cấu hình', 'Việt Nam'
WHERE NOT EXISTS (SELECT 1 FROM school_config);

-- Kiểm tra kết quả
SELECT * FROM school_config;
