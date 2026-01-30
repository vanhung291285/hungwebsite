
-- ==============================================================================
-- SCRIPT TẠO BẢNG VIDEOS CHO MODULE THƯ VIỆN VIDEO
-- Hướng dẫn: Copy toàn bộ nội dung này vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Tạo bảng videos nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bật tính năng bảo mật dòng (Row Level Security - RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 3. Xóa các policy cũ (nếu có) để tránh lỗi trùng lặp
DROP POLICY IF EXISTS "Public Read Videos" ON videos;
DROP POLICY IF EXISTS "Auth Manage Videos" ON videos;

-- 4. Tạo Policy cho phép mọi người (Guest) XEM danh sách video
CREATE POLICY "Public Read Videos" ON videos 
FOR SELECT 
USING (true);

-- 5. Tạo Policy cho phép Admin (đã đăng nhập) được phép THÊM, SỬA, XÓA
CREATE POLICY "Auth Manage Videos" ON videos 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 6. Kiểm tra lại kết quả
SELECT * FROM videos;
