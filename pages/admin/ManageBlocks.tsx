
import React, { useState, useEffect } from 'react';
import { DisplayBlock, PostCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, Eye, EyeOff, Database, Layers, Hash } from 'lucide-react';

export const ManageBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]); // Dynamic categories
  
  const [newBlock, setNewBlock] = useState<Partial<DisplayBlock>>({
    type: 'grid',
    position: 'main',
    itemCount: 4,
    isVisible: true,
    targetPage: 'all',
    htmlContent: 'all' // Default to show all categories
  });
  
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState('');
  const [tempItemCount, setTempItemCount] = useState<number>(0);

  // Combined options: System options + Dynamic Categories
  const getCategoryOptions = () => {
      const systemOptions = [
        { id: 'all', name: 'Tất cả (Mới nhất)' },
        { id: 'featured', name: '★ Tin Nổi Bật (Tiêu điểm)' },
      ];
      const dynamicOptions = categories.map(c => ({ id: c.slug, name: c.name }));
      return [...systemOptions, ...dynamicOptions];
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
      const [blks, cats] = await Promise.all([
          DatabaseService.getBlocks(),
          DatabaseService.getPostCategories()
      ]);
      setBlocks(blks.sort((a, b) => a.order - b.order));
      setCategories(cats);
  };

  const handleAdd = async () => {
    if (!newBlock.name) return alert("Vui lòng nhập tên khối");
    
    const samePosBlocks = blocks.filter(b => b.position === newBlock.position);
    const maxOrder = samePosBlocks.length > 0 ? Math.max(...samePosBlocks.map(b => b.order)) : 0;

    const block: DisplayBlock = {
      id: `block_${Date.now()}`,
      name: newBlock.name!,
      position: newBlock.position as any,
      type: newBlock.type as any,
      order: maxOrder + 1,
      itemCount: newBlock.itemCount || 4,
      isVisible: true,
      targetPage: newBlock.targetPage as any || 'all',
      // Store the Category Slug (e.g., 'news', 'featured') in htmlContent if it's a post block
      htmlContent: newBlock.type === 'html' ? '<p>Nội dung mặc định...</p>' : (newBlock.htmlContent || 'all')
    };
    
    await DatabaseService.saveBlock(block);
    await loadData(); // Reload blocks
    setNewBlock({ type: 'grid', position: 'main', itemCount: 4, isVisible: true, name: '', targetPage: 'all', htmlContent: 'all' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa khối này? Hành động không thể hoàn tác.")) {
      await DatabaseService.deleteBlock(id);
      await loadData();
    }
  };

  const toggleVisibility = async (id: string) => {
    const updatedBlocks = blocks.map(b => 
      b.id === id ? { ...b, isVisible: !b.isVisible } : b
    );
    const blockToUpdate = updatedBlocks.find(b => b.id === id);
    if (blockToUpdate) {
        await DatabaseService.saveBlock(blockToUpdate);
    }
    setBlocks(updatedBlocks);
  };

  const handleMove = async (block: DisplayBlock, direction: 'up' | 'down') => {
    const samePosBlocks = blocks
        .filter(b => b.position === block.position)
        .sort((a, b) => a.order - b.order);

    const index = samePosBlocks.findIndex(b => b.id === block.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === samePosBlocks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [samePosBlocks[index], samePosBlocks[targetIndex]] = [samePosBlocks[targetIndex], samePosBlocks[index]];

    samePosBlocks.forEach((b, idx) => { b.order = idx + 1; });

    const otherBlocks = blocks.filter(b => b.position !== block.position);
    setBlocks([...otherBlocks, ...samePosBlocks]);

    await DatabaseService.saveBlocksOrder(samePosBlocks);
  };

  const startEditContent = (block: DisplayBlock) => {
     setEditingContentId(block.id);
     setTempContent(block.htmlContent || 'all');
     setTempItemCount(block.itemCount || 5);
  };

  const saveContent = async (block: DisplayBlock) => {
     const updatedBlock = { 
        ...block, 
        htmlContent: tempContent,
        itemCount: tempItemCount
     };
     await DatabaseService.saveBlock(updatedBlock);
     await loadData();
     setEditingContentId(null);
  };

  const getCategoryName = (slug?: string) => {
      const options = getCategoryOptions();
      const cat = options.find(c => c.id === slug);
      return cat ? cat.name : 'Tất cả';
  };

  const renderBlockList = (position: 'main' | 'sidebar', title: string) => {
      const filteredBlocks = blocks
        .filter(b => b.position === position)
        .sort((a, b) => a.order - b.order);

      return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full">
            <h4 className="font-bold text-gray-700 mb-3 uppercase text-sm border-b pb-2 flex justify-between items-center">
                {title}
                <span className="text-xs font-normal text-gray-500 lowercase">{filteredBlocks.length} khối</span>
            </h4>
            <div className="space-y-3">
               {filteredBlocks.map((block, index) => (
                 <div key={block.id} className={`flex flex-col p-3 border rounded transition-all duration-200 ${!block.isVisible ? 'bg-gray-100 border-gray-200 opacity-75' : 'bg-gray-50 border-gray-300 hover:shadow-md hover:bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-3 overflow-hidden">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${block.isVisible ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-300 text-gray-600'}`}>{index + 1}</span>
                          <div className="min-w-0">
                             <div className="flex items-center gap-2">
                                <p className={`font-bold text-sm truncate ${!block.isVisible ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{block.name}</p>
                             </div>
                             
                             <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                                <span className="bg-gray-100 px-1 rounded border">{block.type}</span>
                                {block.targetPage !== 'all' && (
                                    <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-bold">{block.targetPage}</span>
                                )}
                                {/* Display Source Category if not HTML/Stats/Docs/Staff */}
                                {block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs' && block.type !== 'doc_cats' && block.type !== 'video' && block.type !== 'calendar' && block.type !== 'staff_list' && (
                                    <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                        <Layers size={10} className="mr-1"/> {getCategoryName(block.htmlContent)}
                                    </span>
                                )}
                                {block.type !== 'html' && block.type !== 'stats' && block.type !== 'doc_cats' && block.type !== 'video' && block.type !== 'calendar' && (
                                    <span className="flex items-center text-gray-600 font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                        <Hash size={10} className="mr-1"/> {block.itemCount}
                                    </span>
                                )}
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center space-x-1 shrink-0">
                          <button onClick={() => toggleVisibility(block.id)} className={`p-1.5 rounded transition ${block.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}>{block.isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                          <button onClick={() => handleMove(block, 'up')} disabled={index === 0} className={`p-1.5 rounded transition ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}><ArrowUp size={16}/></button>
                          <button onClick={() => handleMove(block, 'down')} disabled={index === filteredBlocks.length - 1} className={`p-1.5 rounded transition ${index === filteredBlocks.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}><ArrowDown size={16}/></button>
                          <button onClick={() => handleDelete(block.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16}/></button>
                       </div>
                    </div>

                    {/* Edit HTML Content */}
                    {block.type === 'html' && block.isVisible && (
                       <div className="mt-2 pt-2 border-t border-gray-200">
                          {editingContentId === block.id ? (
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">Mã HTML:</label>
                                <textarea className="w-full p-2 text-xs font-mono border rounded h-24 bg-white text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none" value={tempContent} onChange={e => setTempContent(e.target.value)}/>
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => setEditingContentId(null)} className="text-xs text-gray-500 px-2 py-1 hover:bg-gray-200 rounded">Hủy</button>
                                   <button onClick={() => saveContent(block)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded flex items-center hover:bg-blue-700 shadow-sm"><Check size={12} className="mr-1"/> Lưu HTML</button>
                                </div>
                             </div>
                          ) : (
                             <button onClick={() => startEditContent(block)} className="text-xs text-blue-600 flex items-center hover:underline font-medium"><Edit2 size={12} className="mr-1"/> Chỉnh sửa nội dung HTML</button>
                          )}
                       </div>
                    )}

                    {/* Edit Category Source & Item Count */}
                    {block.type !== 'html' && block.type !== 'stats' && block.type !== 'doc_cats' && block.type !== 'video' && block.type !== 'calendar' && block.isVisible && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            {editingContentId === block.id ? (
                                <div className="space-y-3 bg-indigo-50 p-2 rounded">
                                    {block.type !== 'docs' && block.type !== 'staff_list' && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-700 block mb-1">Nguồn tin / Chuyên mục:</label>
                                            <select 
                                                className="w-full p-1.5 text-xs border rounded bg-white text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                                                value={tempContent} 
                                                onChange={e => setTempContent(e.target.value)}
                                            >
                                                {getCategoryOptions().map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    
                                    <div>
                                         <label className="text-xs font-bold text-gray-700 block mb-1">Số lượng hiển thị:</label>
                                         <div className="flex items-center gap-2">
                                             <input 
                                                type="number" 
                                                min="1" max="50" 
                                                className="w-20 p-1.5 text-xs border rounded bg-white text-gray-900 font-bold text-center"
                                                value={tempItemCount}
                                                onChange={e => setTempItemCount(parseInt(e.target.value))}
                                             />
                                             <span className="text-xs text-gray-500">bài viết / mục</span>
                                         </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-1 border-t border-indigo-100">
                                        <button onClick={() => setEditingContentId(null)} className="text-xs text-gray-500 px-2 py-1 hover:bg-gray-200 rounded font-bold">Hủy</button>
                                        <button onClick={() => saveContent(block)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded flex items-center hover:bg-blue-700 shadow-sm font-bold"><Check size={12} className="mr-1"/> Lưu thay đổi</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => startEditContent(block)} className="text-xs text-gray-500 flex items-center hover:text-blue-600 font-medium group-hover:text-blue-600 transition">
                                    <Edit2 size={12} className="mr-1"/> 
                                    {block.type === 'staff_list' ? 'Cấu hình số lượng hiển thị' : (block.type === 'docs' ? 'Cấu hình số lượng hiển thị' : 'Cấu hình Chuyên mục & Số lượng')}
                                </button>
                            )}
                        </div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded text-sm text-indigo-800 shadow-sm">
        <strong>Module Cấu hình Giao diện & Sidebar:</strong> 
        <ul className="list-disc ml-5 mt-1 text-xs space-y-1">
            <li>Sử dụng các mũi tên để sắp xếp thứ tự hiển thị của các khối trên trang chủ.</li>
            <li>Tại mục <strong>"Nguồn tin / Chuyên mục"</strong>, hãy chọn đúng loại tin (Ví dụ: Tin tức, Thông báo, Tin nổi bật) để khối hiển thị đúng bài viết mong muốn.</li>
            <li>Nhấn vào biểu tượng con mắt để Ẩn/Hiện khối.</li>
            <li>Có thể tùy chỉnh <strong>Số lượng tin hiển thị</strong> cho từng khối bằng cách nhấn vào nút "Cấu hình".</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg"><Plus size={20} className="mr-2 text-indigo-600"/> Tạo khối hiển thị mới</h3>
         <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 mb-1">Tên khối hiển thị</label>
               <input type="text" value={newBlock.name || ''} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="VD: Tin Tức Mới"/>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Vị trí</label>
               <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" value={newBlock.position} onChange={e => setNewBlock({...newBlock, position: e.target.value as any})}>
                 <option value="main">Cột chính (Main)</option>
                 <option value="sidebar">Cột phải (Sidebar)</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Kiểu hiển thị</label>
               <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" value={newBlock.type} onChange={e => setNewBlock({...newBlock, type: e.target.value as any})}>
                 <option value="grid">Tin tức (Lưới 2-3 cột)</option>
                 <option value="list">Tin tức (Danh sách dọc)</option>
                 <option value="highlight">Tin tức (Nổi bật/Focus)</option>
                 <option value="hero">Slide ảnh lớn (Hero)</option>
                 <option value="staff_list">Danh sách Cán bộ (Mới)</option>
                 <option value="calendar">Lịch vạn niên / Lịch tháng</option>
                 <option value="doc_cats">Danh mục văn bản (Folder)</option>
                 <option value="video">Thư viện Video (Youtube)</option>
                 <option value="docs">Văn bản mới nhất</option>
                 <option value="stats">Thống kê truy cập</option>
                 <option value="html">Mã HTML Tùy chỉnh</option>
               </select>
            </div>
            <div>
                {/* Conditionally render Category Source or Target Page based on block type */}
                {newBlock.type !== 'html' && newBlock.type !== 'stats' && newBlock.type !== 'docs' && newBlock.type !== 'doc_cats' && newBlock.type !== 'video' && newBlock.type !== 'calendar' && newBlock.type !== 'staff_list' ? (
                     <>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nguồn tin / Chuyên mục</label>
                        <select 
                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" 
                            value={newBlock.htmlContent} 
                            onChange={e => setNewBlock({...newBlock, htmlContent: e.target.value})}
                        >
                            {getCategoryOptions().map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </>
                ) : (
                    <>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Trang hiển thị</label>
                        <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" value={newBlock.targetPage} onChange={e => setNewBlock({...newBlock, targetPage: e.target.value as any})}>
                            <option value="all">Tất cả các trang</option>
                            <option value="home">Chỉ trang chủ</option>
                            <option value="detail">Chỉ trang chi tiết</option>
                        </select>
                    </>
                )}
            </div>
            <div className="flex items-end">
               <button onClick={handleAdd} className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 text-sm shadow transition transform active:scale-95">Thêm khối</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
         {renderBlockList('main', 'Cột Chính (Main Column)')}
         {renderBlockList('sidebar', 'Cột Phải (Sidebar)')}
      </div>
    </div>
  );
};
