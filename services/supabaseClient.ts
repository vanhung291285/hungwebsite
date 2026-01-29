
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://npvvzrqbrsuoalwxfhyx.supabase.co';
// API Key được cung cấp. Lưu ý: Trong môi trường thực tế, nên dùng biến môi trường.
const SUPABASE_KEY = 'sb_publishable_hBXTyVjSbE4gRR_Fd2ZwhQ_L0rKSuVy';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
