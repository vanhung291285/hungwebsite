
import { supabase } from './supabaseClient';
import { Post, SchoolConfig, SchoolDocument, GalleryImage, GalleryAlbum, User, UserRole, MenuItem, DisplayBlock, DocumentCategory, StaffMember, IntroductionArticle, PostCategory, Video, VisitorStats } from '../types';

// Default Config Fallback
const DEFAULT_CONFIG: SchoolConfig = {
  name: 'TRƯỜNG PTDTBT TH VÀ THCS SUỐI LƯ',
  slogan: 'Dạy tốt - Học tốt - Rèn luyện tốt',
  logoUrl: '',
  bannerUrl: '',
  principalName: '',
  address: 'Xã Suối Lư, Huyện Điện Biên Đông, Tỉnh Điện Biên',
  phone: '',
  email: '',
  hotline: '',
  mapUrl: '',
  facebook: '',
  youtube: '',
  website: '',
  showWelcomeBanner: true,
  homeNewsCount: 6,
  homeShowProgram: true,
  primaryColor: '#1e3a8a',
  metaTitle: 'Trường PTDTBT TH và THCS Suối Lư',
  metaDescription: 'Cổng thông tin điện tử Trường Phổ thông dân tộc bán trú Tiểu học và Trung học cơ sở Suối Lư'
};

export const DatabaseService = {
  // --- CONFIG ---
  getConfig: async (): Promise<SchoolConfig> => {
    try {
        const { data, error } = await supabase.from('school_config').select('*').limit(1).single();
        if (error || !data) return DEFAULT_CONFIG;
        
        return {
           name: data.name,
           slogan: data.slogan,
           logoUrl: data.logo_url,
           faviconUrl: data.favicon_url,
           bannerUrl: data.banner_url,
           principal_name: data.principal_name,
           address: data.address,
           phone: data.phone,
           email: data.email,
           hotline: data.hotline,
           mapUrl: data.map_url,
           facebook: data.facebook,
           youtube: data.youtube,
           website: data.website,
           showWelcomeBanner: data.show_welcome_banner,
           homeNewsCount: data.home_news_count !== undefined ? data.home_news_count : 6,
           homeShowProgram: data.home_show_program !== undefined ? data.home_show_program : true,
           primaryColor: data.primary_color,
           metaTitle: data.meta_title,
           metaDescription: data.meta_description
        } as any;
    } catch {
        return DEFAULT_CONFIG;
    }
  },

  saveConfig: async (config: SchoolConfig) => {
    const dbConfig = {
       name: config.name,
       slogan: config.slogan,
       logo_url: config.logoUrl,
       favicon_url: config.faviconUrl,
       banner_url: config.bannerUrl,
       principal_name: config.principalName,
       address: config.address,
       phone: config.phone,
       email: config.email,
       hotline: config.hotline,
       map_url: config.mapUrl,
       facebook: config.facebook,
       youtube: config.youtube,
       website: config.website,
       show_welcome_banner: config.showWelcomeBanner,
       home_news_count: config.homeNewsCount,
       home_show_program: config.homeShowProgram,
       primary_color: config.primaryColor,
       meta_title: config.metaTitle,
       meta_description: config.metaDescription
    };

    const { data, error: selectError } = await supabase.from('school_config').select('id').limit(1);
    
    if (selectError) throw new Error("Lỗi kết nối CSDL (Select Config): " + selectError.message);

    let result;
    if (data && data.length > 0) {
       result = await supabase.from('school_config').update(dbConfig).eq('id', data[0].id);
    } else {
       result = await supabase.from('school_config').insert(dbConfig);
    }

    if (result.error) {
        throw new Error(result.error.message);
    }
  },

  // --- POST CATEGORIES ---
  getPostCategories: async (): Promise<PostCategory[]> => {
     const { data } = await supabase.from('post_categories').select('*').order('order_index', { ascending: true });
     if (!data || data.length === 0) return [];
     return data.map((c: any) => ({
         id: c.id,
         name: c.name,
         slug: c.slug,
         color: c.color,
         order: c.order_index
     }));
  },

  savePostCategory: async (cat: PostCategory) => {
      const dbCat = {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          order_index: cat.order
      };
      
      let result;
      if (cat.id && cat.id.length > 10) {
          result = await supabase.from('post_categories').update(dbCat).eq('id', cat.id);
      } else {
          result = await supabase.from('post_categories').insert(dbCat);
      }
      if (result.error) throw new Error(result.error.message);
  },

  deletePostCategory: async (id: string) => {
      const { error } = await supabase.from('post_categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
  },

  // --- POSTS (OPTIMIZED) ---
  // Lấy danh sách bài viết (KHÔNG lấy nội dung HTML nặng)
  getPosts: async (limit: number = 100): Promise<Post[]> => {
    // Select cụ thể các trường cần thiết cho việc hiển thị danh sách, BỎ QUA content và attachments
    const { data } = await supabase
        .from('posts')
        .select('id, title, slug, summary, thumbnail, image_caption, author, date, category, views, status, is_featured, show_on_home, block_ids, tags') 
        .order('date', { ascending: false }) // Sắp xếp theo ngày người dùng nhập
        .order('created_at', { ascending: false }) // Fallback
        .limit(limit);

    return (data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      content: '', // Không tải content ở list view để tối ưu tốc độ
      thumbnail: p.thumbnail,
      imageCaption: p.image_caption,
      author: p.author,
      date: p.date,
      category: p.category,
      views: p.views,
      status: p.status,
      isFeatured: p.is_featured,
      showOnHome: p.show_on_home,
      blockIds: p.block_ids || [],
      tags: p.tags || [],
      attachments: [] // Không tải attachments ở list view
    }));
  },

  // Lấy chi tiết 1 bài viết (Bao gồm Content và Attachments)
  getPostById: async (id: string): Promise<Post | null> => {
      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error || !data) return null;
      
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content, // Load Full Content
        thumbnail: data.thumbnail,
        imageCaption: data.image_caption,
        author: data.author,
        date: data.date,
        category: data.category,
        views: data.views,
        status: data.status,
        isFeatured: data.is_featured,
        showOnHome: data.show_on_home,
        blockIds: data.block_ids || [],
        tags: data.tags || [],
        attachments: data.attachments || [] // Load Attachments
      };
  },

  incrementPostView: async (id: string) => {
      // Gọi RPC hoặc update đơn giản (lưu ý: update trực tiếp client side có thể bị race condition nhẹ nhưng chấp nhận được ở mức độ này)
      // Để tối ưu, chỉ nên gọi cái này sau vài giây người dùng đọc bài
      const { data } = await supabase.from('posts').select('views').eq('id', id).single();
      if (data) {
          await supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', id);
      }
  },

  savePost: async (post: Post) => {
    const dbPost = {
       title: post.title,
       slug: post.slug,
       summary: post.summary,
       content: post.content,
       thumbnail: post.thumbnail,
       image_caption: post.imageCaption,
       author: post.author,
       date: post.date,
       category: post.category,
       views: post.views,
       status: post.status,
       is_featured: post.isFeatured,
       show_on_home: post.showOnHome,
       block_ids: post.blockIds,
       tags: post.tags,
       attachments: post.attachments
    };

    let error;
    if (post.id && post.id.length > 10) { 
       const res = await supabase.from('posts').update(dbPost).eq('id', post.id);
       error = res.error;
    } else {
       const res = await supabase.from('posts').insert(dbPost);
       error = res.error;
    }
    if (error) throw error;
  },

  deletePost: async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
  },

  // --- INTRODUCTIONS ---
  getIntroductions: async (): Promise<IntroductionArticle[]> => {
    const { data } = await supabase.from('school_introductions').select('*').order('order_index', { ascending: true });
    return (data || []).map((i: any) => ({
      id: i.id,
      title: i.title,
      slug: i.slug,
      content: i.content,
      imageUrl: i.image_url,
      order: i.order_index,
      isVisible: i.is_visible
    }));
  },

  saveIntroduction: async (intro: IntroductionArticle) => {
    const dbIntro = {
       title: intro.title,
       slug: intro.slug,
       content: intro.content,
       image_url: intro.imageUrl,
       order_index: intro.order,
       is_visible: intro.isVisible
    };
    let error;
    if (intro.id && intro.id.length > 10) {
       const res = await supabase.from('school_introductions').update(dbIntro).eq('id', intro.id);
       error = res.error;
    } else {
       const res = await supabase.from('school_introductions').insert(dbIntro);
       error = res.error;
    }
    if (error) throw error;
  },

  deleteIntroduction: async (id: string) => {
     await supabase.from('school_introductions').delete().eq('id', id);
  },


  // --- DOCUMENTS ---
  getDocuments: async (): Promise<SchoolDocument[]> => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    return (data || []).map((d: any) => ({
        id: d.id,
        number: d.number,
        title: d.title,
        date: d.date,
        categoryId: d.category_id,
        downloadUrl: d.download_url
    }));
  },

  saveDocument: async (doc: SchoolDocument) => {
    const dbDoc = {
       number: doc.number,
       title: doc.title,
       date: doc.date,
       download_url: doc.downloadUrl,
       category_id: doc.categoryId
    };
    let error;
    if (doc.id && doc.id.length > 10) {
        const res = await supabase.from('documents').update(dbDoc).eq('id', doc.id);
        error = res.error;
    } else {
        const res = await supabase.from('documents').insert(dbDoc);
        error = res.error;
    }
    if (error) throw error;
  },

  deleteDocument: async (id: string) => {
     await supabase.from('documents').delete().eq('id', id);
  },

  getDocCategories: async (): Promise<DocumentCategory[]> => {
    const { data } = await supabase.from('document_categories').select('*').order('order_index', { ascending: true });
    return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        order: c.order_index || 0
    }));
  },

  saveDocCategory: async (cat: DocumentCategory) => {
     const dbCat = { 
       name: cat.name, 
       slug: cat.slug, 
       description: cat.description,
       order_index: cat.order 
     };
     
     let error;
     if (cat.id && cat.id.length > 10 && !cat.id.startsWith('cat_')) {
        const res = await supabase.from('document_categories').update(dbCat).eq('id', cat.id);
        error = res.error;
     } else {
        const res = await supabase.from('document_categories').insert(dbCat);
        error = res.error;
     }

     if (error) throw error;
  },

  saveDocCategoriesOrder: async (cats: DocumentCategory[]) => {
      for (const c of cats) {
          if (c.id && c.id.length > 10 && !c.id.startsWith('cat_')) {
             const { error } = await supabase.from('document_categories').update({ order_index: c.order }).eq('id', c.id);
             if (error) throw error;
          }
      }
  },

  deleteDocCategory: async (id: string) => {
     await supabase.from('document_categories').delete().eq('id', id);
  },

  // --- GALLERY ---
  getAlbums: async (): Promise<GalleryAlbum[]> => {
    const { data } = await supabase.from('gallery_albums').select('*').order('created_at', { ascending: false });
    return (data || []).map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        thumbnail: a.thumbnail,
        createdDate: a.created_date
    }));
  },

  saveAlbum: async (album: GalleryAlbum) => {
    const dbAlbum = {
        title: album.title,
        description: album.description,
        thumbnail: album.thumbnail,
        created_date: album.createdDate
    };
    if (album.id && album.id.length > 10 && !album.id.startsWith('album_')) {
        await supabase.from('gallery_albums').update(dbAlbum).eq('id', album.id);
    } else {
        await supabase.from('gallery_albums').insert(dbAlbum);
    }
  },

  deleteAlbum: async (id: string) => {
     await supabase.from('gallery_albums').delete().eq('id', id);
  },

  getGallery: async (): Promise<GalleryImage[]> => {
     const { data } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
     return (data || []).map((i: any) => ({
         id: i.id,
         url: i.url,
         caption: i.caption,
         albumId: i.album_id
     }));
  },

  saveImage: async (img: GalleryImage) => {
     const dbImg = { url: img.url, caption: img.caption, album_id: img.albumId };
     await supabase.from('gallery_images').insert(dbImg);
  },

  deleteImage: async (id: string) => {
     await supabase.from('gallery_images').delete().eq('id', id);
  },

  // --- VIDEOS ---
  getVideos: async (): Promise<Video[]> => {
    const { data } = await supabase.from('videos').select('*').order('order_index', { ascending: true });
    return (data || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        youtubeUrl: v.youtube_url,
        youtubeId: v.youtube_id,
        thumbnail: v.thumbnail,
        isVisible: v.is_visible,
        order: v.order_index
    }));
  },

  saveVideo: async (video: Video) => {
    const dbVideo = {
        title: video.title,
        youtube_url: video.youtubeUrl,
        youtube_id: video.youtubeId,
        thumbnail: video.thumbnail,
        is_visible: video.isVisible,
        order_index: video.order
    };
    if (video.id && video.id.length > 10) {
        await supabase.from('videos').update(dbVideo).eq('id', video.id);
    } else {
        await supabase.from('videos').insert(dbVideo);
    }
  },

  deleteVideo: async (id: string) => {
    await supabase.from('videos').delete().eq('id', id);
  },

  // --- BLOCKS & MENU ---
  getBlocks: async (): Promise<DisplayBlock[]> => {
      const { data } = await supabase.from('display_blocks').select('*').order('order_index', { ascending: true });
      return (data || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          position: b.position,
          type: b.type,
          order: b.order_index,
          itemCount: b.item_count,
          isVisible: b.is_visible,
          htmlContent: b.html_content,
          targetPage: b.target_page
      }));
  },

  saveBlock: async (block: DisplayBlock) => {
      const dbBlock = {
          name: block.name,
          position: block.position,
          type: block.type,
          order_index: block.order,
          item_count: block.itemCount,
          is_visible: block.isVisible,
          html_content: block.htmlContent,
          target_page: block.targetPage
      };
      if (block.id && block.id.length > 10 && !block.id.startsWith('block_')) {
          await supabase.from('display_blocks').update(dbBlock).eq('id', block.id);
      } else {
          await supabase.from('display_blocks').insert(dbBlock);
      }
  },
  
  saveBlocksOrder: async (blocks: DisplayBlock[]) => {
      for (const b of blocks) {
          if (b.id && !b.id.startsWith('block_')) {
             await supabase.from('display_blocks').update({ order_index: b.order }).eq('id', b.id);
          }
      }
  },

  deleteBlock: async (id: string) => {
      await supabase.from('display_blocks').delete().eq('id', id);
  },

  getMenu: async (): Promise<MenuItem[]> => {
      const { data } = await supabase.from('menu_items').select('*').order('order_index', { ascending: true });
      return (data || []).map((m: any) => ({
          id: m.id,
          label: m.label,
          path: m.path,
          order: m.order_index
      }));
  },

  saveMenu: async (items: MenuItem[]) => {
      for (const m of items) {
          const dbMenu = { label: m.label, path: m.path, order_index: m.order };
          if (m.id && m.id.length > 10 && !m.id.startsWith('menu_')) {
              await supabase.from('menu_items').update(dbMenu).eq('id', m.id);
          } else {
              await supabase.from('menu_items').insert(dbMenu);
          }
      }
  },
  
  deleteMenu: async (id: string) => {
      await supabase.from('menu_items').delete().eq('id', id);
  },

  // --- USERS & REGISTRATION ---
  getUsers: async (): Promise<User[]> => {
      const { data } = await supabase.from('user_profiles').select('*');
      return (data || []).map((u: any) => ({
          id: u.id,
          username: u.username,
          fullName: u.full_name,
          role: u.role as UserRole,
          email: u.username + '@school.edu.vn'
      }));
  },

  saveUser: async (user: User) => {
      const dbUser = {
          id: user.id.length < 10 ? undefined : user.id, // ID must match auth ID if provided
          username: user.username,
          full_name: user.fullName,
          role: user.role
      };
      // Note: Usually we use upsert with ID from auth.
      if (user.id && user.id.length > 10) {
          await supabase.from('user_profiles').upsert(dbUser);
      }
  },

  registerUserProfile: async (userId: string, fullName: string, username: string) => {
      const { error } = await supabase.from('user_profiles').insert({
          id: userId,
          full_name: fullName,
          username: username,
          role: 'GUEST'
      });
      if (error) throw error;
  },

  deleteUser: async (id: string) => {
      await supabase.from('user_profiles').delete().eq('id', id);
  },

  // --- STAFF ---
  getStaff: async (): Promise<StaffMember[]> => {
    const { data } = await supabase.from('staff_members').select('*').order('order_index', { ascending: true });
    return (data || []).map((s: any) => ({
        id: s.id,
        fullName: s.full_name,
        position: s.position,
        partyDate: s.party_date,
        email: s.email,
        avatarUrl: s.avatar_url,
        order: s.order_index
    }));
  },

  saveStaff: async (staff: StaffMember) => {
    const dbStaff = {
        full_name: staff.fullName,
        position: staff.position,
        party_date: staff.partyDate || null, 
        email: staff.email,
        avatar_url: staff.avatarUrl,
        order_index: staff.order
    };
    
    let result;
    if (staff.id && staff.id.length > 10) {
        result = await supabase.from('staff_members').update(dbStaff).eq('id', staff.id);
    } else {
        result = await supabase.from('staff_members').insert(dbStaff);
    }

    if (result.error) {
        console.error("Error saving staff:", result.error);
        throw new Error(result.error.message);
    }
  },

  deleteStaff: async (id: string) => {
    const { error } = await supabase.from('staff_members').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- REAL VISITOR STATISTICS ---
  // Gọi hàm này khi App load để tăng view (1 lần/session)
  incrementPageView: async () => {
      await supabase.rpc('increment_page_view');
  },

  // Lấy dữ liệu thống kê tổng hợp từ DB
  getVisitorStats: async (): Promise<VisitorStats> => {
      try {
          // Lấy thống kê hôm nay
          const today = new Date().toISOString().split('T')[0];
          const { data: todayData } = await supabase
              .from('daily_stats')
              .select('visit_count')
              .eq('date', today)
              .maybeSingle(); // maybeSingle trả về null nếu không có dòng nào, không lỗi

          const todayCount = todayData ? todayData.visit_count : 0;

          // Lấy thống kê tháng này
          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
          const { data: monthData } = await supabase
              .from('daily_stats')
              .select('visit_count')
              .gte('date', startOfMonth);
          
          const monthCount = monthData ? monthData.reduce((sum, row) => sum + row.visit_count, 0) : 0;

          // Lấy tổng truy cập (toàn thời gian)
          const { data: totalData } = await supabase
              .from('daily_stats')
              .select('visit_count');
          
          const totalCount = totalData ? totalData.reduce((sum, row) => sum + row.visit_count, 0) : 0;

          return {
              online: 0, // Online tính riêng bằng Realtime Presence bên Frontend
              today: todayCount,
              month: monthCount,
              total: totalCount
          };
      } catch (error) {
          console.error("Error fetching stats:", error);
          return { online: 0, today: 0, month: 0, total: 0 };
      }
  }
};
