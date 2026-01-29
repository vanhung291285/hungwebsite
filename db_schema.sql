
-- ==============================================================================
-- SCRIPT SỬA LỖI MODULE CÁN BỘ (STAFF)
-- Hướng dẫn: Copy vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Đảm bảo bảng tồn tại và có đủ cột
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position TEXT,
  party_date DATE,
  email TEXT,
  avatar_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bổ sung các cột nếu bảng đã tạo từ trước nhưng thiếu
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS party_date DATE;
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE staff_members ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. RESET QUYỀN TRUY CẬP (RLS)
-- Bước này cực kỳ quan trọng để cho phép Thêm/Sửa/Xóa
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Xóa policy cũ để tránh lỗi trùng tên
DROP POLICY IF EXISTS "Public Read Staff" ON staff_members;
DROP POLICY IF EXISTS "Auth Write Staff" ON staff_members;
DROP POLICY IF EXISTS "Auth Allow All Staff" ON staff_members;

-- Tạo lại Policy:
-- Cho phép tất cả mọi người XEM
CREATE POLICY "Public Read Staff" ON staff_members 
FOR SELECT USING (true);

-- Cho phép người dùng đã đăng nhập (Admin) thực hiện MỌI thao tác (Thêm, Sửa, Xóa)
CREATE POLICY "Auth Allow All Staff" ON staff_members 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Kiểm tra lại dữ liệu
SELECT * FROM staff_members LIMIT 5;
