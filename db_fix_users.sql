
-- ==============================================================================
-- SCRIPT SỬA LỖI ĐĂNG KÝ THÀNH VIÊN (FIX RLS ERROR)
-- Hướng dẫn: Copy toàn bộ nội dung này vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Tạo bảng user_profiles nếu chưa có (để chắc chắn)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'GUEST',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tạo Function xử lý khi có người dùng mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, username, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'username', 
    'GUEST'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Tạo Trigger kích hoạt Function trên
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Cấu hình lại quyền bảo mật (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Xóa các policy cũ để tránh xung đột
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Tạo Policy mới:
-- Cho phép mọi người xem thông tin (cần thiết để hiển thị tên tác giả bài viết)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

-- Cho phép người dùng tự cập nhật thông tin của chính mình
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Lưu ý: Không cần Policy INSERT vì Trigger (bước 2) đã chạy với quyền SECURITY DEFINER (quyền admin).
