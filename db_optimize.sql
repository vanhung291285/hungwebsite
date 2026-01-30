
-- ==============================================================================
-- SCRIPT TỐI ƯU HÓA DATABASE (INDEXING) - PHIÊN BẢN ĐÃ SỬA LỖI
-- Hướng dẫn: Copy vào Supabase SQL Editor và nhấn RUN
-- ==============================================================================

-- 1. Index cho bảng Posts (Bài viết)
-- Giúp lọc theo category, status và sắp xếp theo ngày nhanh hơn
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);

-- 2. Index cho bảng Documents (Văn bản)
-- Giúp lọc văn bản theo danh mục nhanh hơn
CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date DESC);

-- 3. Index cho bảng Staff (Cán bộ)
CREATE INDEX IF NOT EXISTS idx_staff_order ON staff_members(order_index);

-- 4. Index cho bảng Menu và Blocks
CREATE INDEX IF NOT EXISTS idx_menu_order ON menu_items(order_index);
CREATE INDEX IF NOT EXISTS idx_blocks_order ON display_blocks(order_index);

-- Lưu ý: Đã bỏ lệnh VACUUM ANALYZE để tránh lỗi chạy trong Transaction Block.
-- PostgreSQL Autovacuum sẽ tự động xử lý việc tối ưu hóa sau.
