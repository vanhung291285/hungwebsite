
-- ==============================================================================
-- SCRIPT TẠO HỆ THỐNG THỐNG KÊ TRUY CẬP THỰC
-- Hướng dẫn: Copy toàn bộ nội dung này vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Tạo bảng daily_stats để lưu lượt truy cập theo ngày
CREATE TABLE IF NOT EXISTS daily_stats (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bật RLS
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- 3. Tạo Policy
-- Cho phép ai cũng xem được thống kê
CREATE POLICY "Public Read Stats" ON daily_stats FOR SELECT USING (true);
-- Cho phép Service Role hoặc hàm RPC cập nhật (Policy update công khai có rủi ro, ta dùng RPC bên dưới)

-- 4. Tạo hàm RPC (Remote Procedure Call) để tăng lượt truy cập an toàn (Atomic Increment)
-- Hàm này sẽ được gọi từ Client, tự động xử lý việc tạo dòng mới nếu ngày hôm nay chưa có
CREATE OR REPLACE FUNCTION increment_page_view()
RETURNS void AS $$
BEGIN
  INSERT INTO daily_stats (date, visit_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date)
  DO UPDATE SET visit_count = daily_stats.visit_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Cho phép Public gọi hàm RPC này
GRANT EXECUTE ON FUNCTION increment_page_view TO anon, authenticated, service_role;

-- 6. Tạo dữ liệu giả lập cho quá khứ (để nhìn cho đẹp, có thể bỏ qua)
INSERT INTO daily_stats (date, visit_count) VALUES 
('2023-01-01', 1250000), -- Tổng tích lũy cũ
(CURRENT_DATE - INTERVAL '1 day', 450)
ON CONFLICT (date) DO NOTHING;
