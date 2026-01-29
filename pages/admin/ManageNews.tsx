
import React, { useState, useEffect, useRef } from 'react';
import { Post, DisplayBlock, Attachment, PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { generateSchoolContent } from '../../services/geminiService';
import { 
  Plus, Edit, Trash2, Search, Save, Loader2, Image, Bold, Italic, List, Type, 
  RotateCcw, UploadCloud, Check
} from 'lucide-react';

interface ManageNewsProps {
  posts: Post[];
  categories: PostCategory[]; 
  refreshData: () => void;
}

export const ManageNews: React.FC<ManageNewsProps> = ({ posts, categories, refreshData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Attachments State
  const [attachUrl, setAttachUrl] = useState('');
  const [attachName, setAttachName] = useState('');

  // Editor Ref
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = (post: Post) => {
    setCurrentPost({ ...post, blockIds: post.blockIds || [], attachments: post.attachments || [] });
    setTagsInput(post.tags ? post.tags.join(', ') : '');
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentPost({
      title: '',
      slug: '',
      summary: '',
      content: '',
      thumbnail: '',
      imageCaption: '',
      category: categories[0]?.slug || 'news', 
      author: 'Admin',
      views: 0,
      status: 'published',
      isFeatured: false,
      showOnHome: true,
      blockIds: [],
      attachments: [],
      tags: [],
      date: new Date().toISOString().split('T')[0]
    });
    setTagsInput('');
    setIsEditing(true);
  };

  const generateSlug = () => {
    if (!currentPost.title) return;
    const slug = currentPost.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    setCurrentPost(prev => ({ ...prev, slug }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (x) => {
        if (x.target?.result) {
          setCurrentPost(prev => ({ ...prev, thumbnail: x.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- EDITOR FUNCTIONS ---
  const insertTag = (startTag: string, endTag: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    // Lấy vị trí con trỏ hiện tại hoặc thêm vào cuối nếu không xác định
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + startTag + selection + endTag + after;
    setCurrentPost(prev => ({ ...prev, content: newText }));
    
    // Khôi phục focus cho textarea sau khi chèn
    setTimeout(() => {
        textarea.focus();
        // Di chuyển con trỏ ra sau thẻ vừa chèn (ước lượng)
        const newCursorPos = start + startTag.length + selection.length + endTag.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertImageToContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (x) => {
      if (x.target?.result) {
        const imgTag = `<img src="${x.target.result}" style="max-width: 100%; height: auto; border-radius: 4px; margin: 10px 0;" alt="Image"/>`;
        insertTag(imgTag);
      }
    };
    reader.readAsDataURL(file);
  };

  const EditorToolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
       <div className="flex items-center space-x-1 mr-2 border-r pr-2 border-gray-300">
         <button onClick={() => insertTag('<b>', '</b>')} className="p-1.5 hover:bg-gray-200 rounded" title="In đậm"><Bold size={16}/></button>
         <button onClick={() => insertTag('<i>', '</i>')} className="p-1.5 hover:bg-gray-200 rounded" title="In nghiêng"><Italic size={16}/></button>
       </div>
       <div className="flex items-center space-x-1 mr-2 border-r pr-2 border-gray-300">
         <button onClick={() => insertTag('<h3>', '</h3>')} className="p-1.5 hover:bg-gray-200 rounded" title="Tiêu đề H3"><Type size={16}/></button>
         <button onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} className="p-1.5 hover:bg-gray-200 rounded" title="Danh sách"><List size={16}/></button>
       </div>
       <div className="flex items-center space-x-1 text-gray-700">
          <label className="p-1.5 hover:bg-gray-200 rounded cursor-pointer flex items-center" title="Chèn ảnh">
             <Image size={16}/>
             <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        insertImageToContent(e.target.files[0]);
                        e.target.value = ''; // Reset input để chọn lại được file cũ
                    }
                }} 
             />
          </label>
       </div>
    </div>
  );

  const handleSave = async () => {
    if (currentPost.title && currentPost.content) {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
      
      try {
        await DatabaseService.savePost({
            ...currentPost,
            tags: tags,
            slug: currentPost.slug || 'no-slug',
            attachments: currentPost.attachments || []
        } as Post);
        
        refreshData();
        setIsEditing(false);
      } catch (e) {
        alert("Lỗi khi lưu bài viết: " + e);
      }
    } else {
      alert("Vui lòng nhập tiêu đề và nội dung");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      await DatabaseService.deletePost(id);
      refreshData();
    }
  };

  const handleGenerateAI = async () => {
    if (!currentPost.title) return alert("Nhập tiêu đề trước");
    setIsGenerating(true);
    const content = await generateSchoolContent(currentPost.title, 'news');
    const htmlContent = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>');
      
    setCurrentPost(prev => ({
      ...prev,
      content: htmlContent,
      summary: content.slice(0, 150) + "..."
    }));
    setIsGenerating(false);
  };

  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  if (isEditing) {
    return (
      <div className="bg-slate-50 min-h-screen p-4 animate-fade-in font-sans text-sm">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Action Bar */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded shadow-sm sticky top-0 z-20 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <Plus size={18} className="mr-2 text-green-600"/>
              {currentPost.id ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
            </h2>
            <div className="flex gap-2">
               <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 text-gray-700 hover:bg-gray-100 rounded border border-gray-300 bg-white font-medium">Hủy bỏ</button>
               <button onClick={handleSave} className="px-4 py-1.5 bg-blue-700 text-white rounded font-bold hover:bg-blue-800 shadow-sm flex items-center">
                 <Save size={16} className="mr-2" /> Lưu bài viết
               </button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT COLUMN - MAIN CONTENT */}
            <div className="flex-1 bg-white p-6 rounded shadow-sm border border-gray-200">
               
               {/* Title */}
               <div className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <label className="col-span-12 md:col-span-2 font-bold text-gray-700">Tiêu đề: <span className="text-red-500">*</span></label>
                  <div className="col-span-12 md:col-span-10">
                     <input 
                       type="text" 
                       className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900"
                       value={currentPost.title}
                       onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                       onBlur={generateSlug}
                     />
                     <div className="text-xs text-red-500 mt-1">Số ký tự: {currentPost.title?.length || 0}. Nên nhập tối đa 65 ký tự</div>
                  </div>
               </div>

               {/* Slug */}
               <div className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <label className="col-span-12 md:col-span-2 font-bold text-gray-700">Liên kết tĩnh:</label>
                  <div className="col-span-12 md:col-span-10 flex gap-2">
                     <input 
                        type="text" 
                        className="flex-1 border border-gray-300 p-2 rounded bg-gray-50 text-gray-600 outline-none"
                        value={currentPost.slug}
                        readOnly
                     />
                     <button onClick={generateSlug} className="p-2 border border-gray-300 rounded hover:bg-gray-100" title="Tạo lại slug"><RotateCcw size={16}/></button>
                  </div>
               </div>

               {/* Thumbnail */}
               <div className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <label className="col-span-12 md:col-span-2 font-bold text-gray-700">Hình minh họa:</label>
                  <div className="col-span-12 md:col-span-10 flex gap-2">
                     <input 
                        type="text" 
                        className="flex-1 border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none"
                        value={currentPost.thumbnail}
                        onChange={e => setCurrentPost({...currentPost, thumbnail: e.target.value})}
                        placeholder="https://..."
                     />
                     <label className="bg-cyan-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-cyan-600 text-xs font-bold flex items-center shadow-sm">
                        <UploadCloud size={16} className="mr-1"/> Browse server
                        <input type="file" className="hidden" onChange={handleImageUpload}/>
                     </label>
                  </div>
               </div>

               {/* Caption */}
               <div className="grid grid-cols-12 gap-4 mb-4 items-center">
                  <label className="col-span-12 md:col-span-2 font-bold text-gray-700">Chú thích cho hình:</label>
                  <div className="col-span-12 md:col-span-10">
                     <input 
                        type="text" 
                        className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 outline-none"
                        value={currentPost.imageCaption || ''}
                        onChange={e => setCurrentPost({...currentPost, imageCaption: e.target.value})}
                     />
                  </div>
               </div>

               {/* Summary */}
               <div className="mb-6">
                  <label className="block font-bold text-gray-700 mb-2">Giới thiệu ngắn gọn <span className="text-xs font-normal italic text-gray-500">(Hiển thị đối với mọi đối tượng kể cả khi không được phân quyền)</span></label>
                  <textarea 
                     rows={3} 
                     className="w-full border border-gray-300 p-3 rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                     value={currentPost.summary}
                     onChange={e => setCurrentPost({...currentPost, summary: e.target.value})}
                  ></textarea>
               </div>

               {/* Content */}
               <div>
                  <div className="flex justify-between items-end mb-2">
                     <label className="font-bold text-gray-700">Nội dung chi tiết <span className="text-red-500">*</span> <span className="text-xs font-normal italic text-gray-500">(Chỉ hiển thị đối với những đối tượng được phép xem)</span></label>
                     <button onClick={handleGenerateAI} disabled={isGenerating} className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded font-bold border border-purple-200 hover:bg-purple-200 flex items-center">
                        {isGenerating ? <Loader2 size={12} className="animate-spin mr-1"/> : 'AI Hỗ trợ'}
                     </button>
                  </div>
                  <div className="border border-gray-300 rounded overflow-hidden">
                     <EditorToolbar />
                     <textarea 
                         ref={editorRef} 
                         rows={20} 
                         className="w-full p-4 bg-white text-gray-900 focus:outline-none font-sans"
                         value={currentPost.content}
                         onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                     />
                  </div>
               </div>

            </div>

            {/* RIGHT COLUMN - SIDEBAR SETTINGS */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
               
               {/* Categories - DYNAMIC */}
               <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase border-b pb-2">Chuyên mục của bài viết: <span className="text-red-500">*</span></h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                     {categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                           <input 
                              type="radio" 
                              name="category" 
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              checked={currentPost.category === cat.slug} 
                              onChange={() => setCurrentPost({...currentPost, category: cat.slug})} 
                           />
                           <span className="text-sm text-gray-700 flex items-center">
                               <span className={`w-2 h-2 rounded-full mr-2 bg-${cat.color}-600`}></span>
                               {cat.name}
                           </span>
                        </label>
                     ))}
                  </div>
                  {categories.length === 0 && <p className="text-xs text-red-500">Chưa có chuyên mục nào. Vui lòng tạo chuyên mục trước.</p>}
               </div>

               {/* Groups */}
               <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase border-b pb-2">Bài viết thuộc các nhóm tin:</h4>
                  <label className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                     <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={currentPost.isFeatured} 
                        onChange={e => setCurrentPost({...currentPost, isFeatured: e.target.checked})} 
                     />
                     <span className="text-sm text-gray-700">Tin mới / Nổi bật</span>
                  </label>
               </div>

               {/* Tags */}
               <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase border-b pb-2">Các tag cho bài viết:</h4>
                  <input 
                     type="text" 
                     placeholder="Nhập từ khóa..." 
                     className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                     value={tagsInput}
                     onChange={e => setTagsInput(e.target.value)}
                  />
               </div>

               {/* Features */}
               <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase border-b pb-2">Tính năng mở rộng:</h4>
                  <div className="space-y-2 text-sm">
                     <label className="flex gap-2 items-center cursor-pointer text-gray-700">
                        <input 
                           type="checkbox" 
                           className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                           checked={currentPost.showOnHome} 
                           onChange={e => setCurrentPost({...currentPost, showOnHome: e.target.checked})} 
                        /> 
                        Hiển thị trên trang chủ
                     </label>
                     <label className="flex gap-2 items-center cursor-pointer text-gray-700">
                        <input 
                           type="checkbox" 
                           className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                           checked={currentPost.status === 'published'} 
                           onChange={e => setCurrentPost({...currentPost, status: e.target.checked ? 'published' : 'draft'})} 
                        /> 
                        Cho phép hiển thị (Xuất bản)
                     </label>
                  </div>
               </div>

               {/* Author */}
               <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 text-xs uppercase border-b pb-2">Tác giả bài viết:</h4>
                  <input 
                     type="text" 
                     className="w-full border border-gray-300 p-2 rounded text-sm bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
                     value={currentPost.author}
                     onChange={e => setCurrentPost({...currentPost, author: e.target.value})}
                  />
               </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // List View
  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý tin tức - sự kiện</h2>
        <button onClick={handleCreate} className="bg-blue-700 text-white px-5 py-2.5 rounded shadow-sm flex items-center space-x-2 hover:bg-blue-800 transition font-bold">
          <Plus size={20} /><span>Thêm bài mới</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4 bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm font-bold uppercase"><th className="px-6 py-4">Trạng thái</th><th className="px-6 py-4">Tiêu đề</th><th className="px-6 py-4">Chuyên mục</th><th className="px-6 py-4">Ngày đăng</th><th className="px-6 py-4 text-right">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map(post => {
                  const cat = categories.find(c => c.slug === post.category);
                  return (
                  <tr key={post.id} className="hover:bg-blue-50 transition">
                    <td className="px-6 py-4">
                      {post.status === 'published' ? <span className="text-green-700 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đã xuất bản</span> : <span className="text-gray-600 text-xs font-bold bg-gray-200 px-2 py-1 rounded">Bản nháp</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{post.title}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                        <span className={`text-${cat?.color || 'gray'}-700 bg-${cat?.color || 'gray'}-50 px-2 py-1 rounded border border-${cat?.color || 'gray'}-200`}>
                            {cat?.name || post.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{post.date}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                    </td>
                  </tr>
              )})}
            </tbody>
          </table>
      </div>
    </div>
  );
};
