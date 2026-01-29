import React, { useState, useEffect } from 'react';
import { DisplayBlock } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit2, Check, Eye, EyeOff, Database } from 'lucide-react';

export const ManageBlocks: React.FC = () => {
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
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

  // Categories for mapping
  const categories = [
    { id: 'all', name: 'Tất cả (Mới nhất)' },
    { id: 'news', name: 'Tin Tức & Sự kiện' },
    { id: 'announcement', name: 'Thông báo' },
    { id: 'activity', name: 'Hoạt động phong trào' },
    { id: 'professional', name: 'Hoạt động chuyên môn' },
  ];

  useEffect(() => {
    DatabaseService.getBlocks().then(res => setBlocks(res.sort((a, b) => a.order - b.order)));
  }, []);

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
      // If type is HTML, use default text, otherwise use the selected category slug stored in htmlContent
      htmlContent: newBlock.type === 'html' ? '<p>Nội dung mặc định...</p>' : (newBlock.htmlContent || 'all')
    };
    
    await DatabaseService.saveBlock(block);
    setBlocks(prev => [...prev, block]);
    setNewBlock({ type: 'grid', position: 'main', itemCount: 4, isVisible: true, name: '', targetPage: 'all', htmlContent: 'all' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa khối này? Hành động không thể hoàn tác.")) {
      await DatabaseService.deleteBlock(id);
      setBlocks(prev => prev.filter(b => b.id !== id));
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
    const newGlobalBlocks = [...otherBlocks, ...samePosBlocks];

    await DatabaseService.saveBlocksOrder(samePosBlocks); // Only save changed ones
    setBlocks(newGlobalBlocks);
  };

  const startEditContent = (block: DisplayBlock) => {
     setEditingContentId(block.id);
     setTempContent(block.htmlContent || '');
  };

  const saveContent = async (block: DisplayBlock) => {
     const updatedBlock = { ...block, htmlContent: tempContent };
     await DatabaseService.saveBlock(updatedBlock);
     setBlocks(prev => prev.map(b => b.id === block.id ? updatedBlock : b));
     setEditingContentId(null);
  };

  const getCategoryName = (slug?: string) => {
      const cat = categories.find(c => c.id === slug);
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
                             <p className={`font-bold text-sm truncate ${!block.isVisible ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{block.name}</p>
                             <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                                <span className="bg-gray-100 px-1 rounded border">{block.type}</span>
                                {block.targetPage !== 'all' && (
                                    <span className="bg-yellow-100 text-yellow-800 px-1 rounded font-bold">{block.targetPage}</span>
                                )}
                                {/* Display Source Category if not HTML/Stats/Docs */}
                                {block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs' && (
                                    <span className="flex items-center text-blue-600 font-medium">
                                        <Database size={10} className="mr-1"/> {getCategoryName(block.htmlContent)}
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

                    {/* Edit Category Source (Reuse HTML field for category slug) */}
                    {block.type !== 'html' && block.type !== 'stats' && block.type !== 'docs' && block.isVisible && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            {editingContentId === block.id ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500">Nguồn dữ liệu bài viết:</label>
                                    <select 
                                        className="w-full p-2 text-xs border rounded bg-white text-gray-900 outline-none"
                                        value={tempContent} 
                                        onChange={e => setTempContent(e.target.value)}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingContentId(null)} className="text-xs text-gray-500 px-2 py-1 hover:bg-gray-200 rounded">Hủy</button>
                                        <button onClick={() => saveContent(block)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded flex items-center hover:bg-blue-700 shadow-sm"><Check size={12} className="mr-1"/> Lưu Nguồn</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => startEditContent(block)} className="text-xs text-gray-500 flex items-center hover:text-blue-600 font-medium">
                                    <Edit2 size={12} className="mr-1"/> Thay đổi nguồn dữ liệu
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
            <li>Sử dụng các mũi tên để sắp xếp thứ tự hiển thị.</li>
            <li>Nhấn vào biểu tượng con mắt để Ẩn/Hiện khối.</li>
            <li><strong>Mới:</strong> Chọn "Nguồn dữ liệu" để khối tự động lấy bài viết từ chuyên mục tương ứng.</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg"><Plus size={20} className="mr-2 text-indigo-600"/> Tạo khối hiển thị mới</h3>
         <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
               <label className="block text-xs font-bold text-gray-500 mb-1">Tên khối</label>
               <input type="text" value={newBlock.name || ''} onChange={e => setNewBlock({...newBlock, name: e.target.value})} className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none"/>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Vị trí</label>
               <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" value={newBlock.position} onChange={e => setNewBlock({...newBlock, position: e.target.value as any})}>
                 <option value="main">Cột chính (Main)</option>
                 <option value="sidebar">Cột phải (Sidebar)</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Loại Block</label>
               <select className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" value={newBlock.type} onChange={e => setNewBlock({...newBlock, type: e.target.value as any})}>
                 <option value="grid">Tin tức (Lưới)</option>
                 <option value="list">Tin tức (Danh sách)</option>
                 <option value="highlight">Tin tức (Nổi bật)</option>
                 <option value="hero">Slide ảnh (Hero)</option>
                 <option value="stats">Thống kê truy cập</option>
                 <option value="docs">Tài liệu mới</option>
                 <option value="html">Văn bản / HTML</option>
               </select>
            </div>
            <div>
                {/* Conditionally render Data Source or Target Page based on block type */}
                {newBlock.type !== 'html' && newBlock.type !== 'stats' && newBlock.type !== 'docs' ? (
                     <>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nguồn dữ liệu</label>
                        <select 
                            className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200 outline-none" 
                            value={newBlock.htmlContent} 
                            onChange={e => setNewBlock({...newBlock, htmlContent: e.target.value})}
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </>
                ) : (
                    <>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Hiển thị tại</label>
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