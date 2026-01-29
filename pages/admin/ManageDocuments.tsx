
import React, { useState, useRef } from 'react';
import { SchoolDocument, DocumentCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Settings, List, FolderOpen, UploadCloud, FileText, CheckCircle, X, Edit, Save, ArrowUp, ArrowDown } from 'lucide-react';

interface ManageDocumentsProps {
  documents: SchoolDocument[];
  categories: DocumentCategory[];
  refreshData: () => void;
}

export const ManageDocuments: React.FC<ManageDocumentsProps> = ({ documents, categories, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'categories'>('docs');

  // Upload Mode State
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for New Document
  const [newDoc, setNewDoc] = useState<Partial<SchoolDocument>>({ 
    date: new Date().toISOString().split('T')[0],
    downloadUrl: '',
    categoryId: categories[0]?.id || ''
  });

  // State for Categories
  const [newCat, setNewCat] = useState<Partial<DocumentCategory>>({ name: '', slug: '', description: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // --- DOCUMENT HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("File quá lớn! Vì đây là bản Demo, vui lòng chọn file dưới 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (x) => {
            if (x.target?.result) {
                setNewDoc(prev => ({ 
                    ...prev, 
                    downloadUrl: x.target!.result as string,
                    title: prev.title || file.name.split('.')[0]
                }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAddDoc = async () => {
    if (!newDoc.title || !newDoc.number) {
      alert("Vui lòng nhập Số hiệu và Trích yếu.");
      return;
    }
    if (!newDoc.categoryId) {
        alert("Vui lòng chọn loại văn bản.");
        return;
    }
    if (!newDoc.downloadUrl) {
        alert("Vui lòng cung cấp đường dẫn tài liệu hoặc tải file lên.");
        return;
    }

    const doc: SchoolDocument = {
      id: Date.now().toString(),
      number: newDoc.number!,
      title: newDoc.title!,
      date: newDoc.date!,
      categoryId: newDoc.categoryId,
      downloadUrl: newDoc.downloadUrl
    };
    
    try {
        await DatabaseService.saveDocument(doc);
        setNewDoc({ 
            categoryId: categories[0]?.id || '', 
            date: new Date().toISOString().split('T')[0], 
            title: '', 
            number: '', 
            downloadUrl: '' 
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        refreshData();
    } catch (e) {
        alert("Lỗi khi lưu văn bản");
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm("Xóa văn bản này?")) {
      await DatabaseService.deleteDocument(id);
      refreshData();
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCat = async () => {
    if (!newCat.name || !newCat.slug) return alert("Vui lòng nhập tên và mã định danh");
    
    // Calculate new order if creating (last + 1)
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;
    
    await DatabaseService.saveDocCategory({
        id: editingCatId ? editingCatId : `cat_${Date.now()}`,
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description || '',
        order: editingCatId ? (categories.find(c => c.id === editingCatId)?.order || 0) : maxOrder + 1
    });

    setNewCat({ name: '', slug: '', description: '' });
    setEditingCatId(null);
    refreshData();
  };

  const handleEditCat = (cat: DocumentCategory) => {
    setNewCat({ name: cat.name, slug: cat.slug, description: cat.description });
    setEditingCatId(cat.id);
  };

  const handleCancelEditCat = () => {
    setNewCat({ name: '', slug: '', description: '' });
    setEditingCatId(null);
  };

  const handleDeleteCat = async (id: string) => {
      const hasDocs = documents.some(d => d.categoryId === id);
      if (hasDocs) return alert("Không thể xóa loại văn bản này vì đang chứa tài liệu. Hãy xóa tài liệu hoặc chuyển sang danh mục khác trước.");
      
      if (confirm("Bạn chắc chắn muốn xóa loại văn bản này?")) {
          await DatabaseService.deleteDocCategory(id);
          if (editingCatId === id) handleCancelEditCat();
          refreshData();
      }
  };

  const handleMoveCat = async (cat: DocumentCategory, direction: 'up' | 'down') => {
      const sortedCats = [...categories].sort((a,b) => a.order - b.order);
      const index = sortedCats.findIndex(c => c.id === cat.id);
      
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === sortedCats.length - 1) return;
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap order
      [sortedCats[index], sortedCats[targetIndex]] = [sortedCats[targetIndex], sortedCats[index]];
      
      // Re-assign order numbers to sequential
      sortedCats.forEach((c, idx) => c.order = idx + 1);
      
      await DatabaseService.saveDocCategoriesOrder(sortedCats);
      refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded text-sm text-blue-900 flex justify-between items-center">
         <div>
            <strong>Module Văn bản & Tài liệu:</strong> Quản lý các tài liệu công khai trên cổng thông tin.
         </div>
         <div className="flex space-x-2">
            <button 
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
            >
                <List size={14} className="mr-1"/> Danh sách văn bản
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1 rounded text-xs font-bold flex items-center ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'}`}
            >
                <Settings size={14} className="mr-1"/> Cấu hình Loại văn bản
            </button>
         </div>
      </div>

      {/* TAB: DOCUMENTS LIST */}
      {activeTab === 'docs' && (
      <>
        {/* Add New Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center border-b pb-2"><Plus size={20} className="mr-2 text-blue-600"/> Thêm mới văn bản/tài liệu</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Loại văn bản <span className="text-red-500">*</span></label>
                    <select 
                    className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newDoc.categoryId}
                    onChange={e => setNewDoc({...newDoc, categoryId: e.target.value})}
                    >
                    <option value="">-- Chọn loại --</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Số hiệu / Mã</label>
                    <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                    placeholder="VD: 123/QĐ-BGH"
                    value={newDoc.number || ''}
                    onChange={e => setNewDoc({...newDoc, number: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Ngày ban hành</label>
                    <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newDoc.date}
                    onChange={e => setNewDoc({...newDoc, date: e.target.value})}
                    />
                </div>
                
                {/* File Upload / Link Selection Area */}
                <div className="md:col-span-3">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-bold text-gray-900">Nguồn tài liệu</label>
                        <div className="flex text-xs border rounded overflow-hidden">
                            <button 
                                onClick={() => setUploadMode('link')}
                                className={`px-3 py-1 font-medium ${uploadMode === 'link' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                Link Online
                            </button>
                            <button 
                                onClick={() => setUploadMode('file')}
                                className={`px-3 py-1 font-medium ${uploadMode === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                Tải từ máy tính
                            </button>
                        </div>
                    </div>

                    {uploadMode === 'link' ? (
                        <div className="flex animate-fade-in">
                            <div className="bg-gray-100 border border-r-0 border-gray-300 rounded-l p-2 flex items-center justify-center">
                                <LinkIcon size={16} className="text-gray-600"/>
                            </div>
                            <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-r p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                            placeholder="https://drive.google.com/..."
                            value={newDoc.downloadUrl || ''}
                            onChange={e => setNewDoc({...newDoc, downloadUrl: e.target.value})}
                            />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <label 
                                className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition ${
                                    newDoc.downloadUrl && newDoc.downloadUrl.startsWith('data:') 
                                        ? 'border-green-400 bg-green-50' 
                                        : 'border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-400'
                                }`}
                            >
                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                    {newDoc.downloadUrl && newDoc.downloadUrl.startsWith('data:') ? (
                                        <>
                                            <CheckCircle className="w-8 h-8 text-green-500 mb-1" />
                                            <p className="text-sm text-green-700 font-bold">Đã chọn file thành công!</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-gray-400 mb-1" />
                                            <p className="text-sm text-gray-500"><span className="font-bold">Nhấn để tải lên</span> hoặc kéo thả file</p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    onChange={handleFileUpload} 
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Trích yếu nội dung (Tiêu đề)</label>
                    <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-500"
                    placeholder="Nhập nội dung tóm tắt văn bản..."
                    value={newDoc.title || ''}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                    />
                </div>

                <div className="md:col-span-4 flex justify-end">
                    <button onClick={handleAddDoc} className="bg-blue-700 text-white font-bold py-2.5 px-6 rounded hover:bg-blue-800 transition shadow flex items-center">
                        <Plus size={18} className="mr-2" /> Lưu dữ liệu
                    </button>
                </div>
            </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-300">
            <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-900 font-bold uppercase text-sm border-b border-gray-200">
                <tr>
                <th className="p-4">Loại</th>
                <th className="p-4">Số hiệu</th>
                <th className="p-4">Trích yếu</th>
                <th className="p-4">Nguồn</th>
                <th className="p-4">Ngày</th>
                <th className="p-4 text-right">Xóa</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {documents.map(doc => {
                    const cat = categories.find(c => c.id === doc.categoryId);
                    const isLocalFile = doc.downloadUrl && doc.downloadUrl.startsWith('data:');
                    
                    return (
                        <tr key={doc.id} className="hover:bg-blue-50 transition">
                            <td className="p-4">
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded font-bold border border-gray-200">
                                    {cat ? cat.name : 'Chưa phân loại'}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-sm font-semibold text-gray-700">{doc.number}</td>
                            <td className="p-4 font-bold text-gray-800">{doc.title}</td>
                            <td className="p-4 text-center">
                            {doc.downloadUrl && doc.downloadUrl !== '#' ? (
                                <a 
                                    href={doc.downloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    download={isLocalFile ? `${doc.number}.pdf` : undefined} 
                                    className={`flex items-center text-xs font-bold ${isLocalFile ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
                                >
                                    {isLocalFile ? <FileText size={14} className="mr-1"/> : <ExternalLink size={14} className="mr-1"/>}
                                    {isLocalFile ? 'File đính kèm' : 'Link ngoài'}
                                </a>
                            ) : <span className="text-gray-400 text-xs italic">Không có</span>}
                            </td>
                            <td className="p-4 text-sm text-gray-600">{doc.date}</td>
                            <td className="p-4 text-right">
                            <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition">
                                <Trash2 size={18} />
                            </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </>
      )}

      {/* TAB: CATEGORIES CONFIG */}
      {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add/Edit Cat Form */}
              <div className={`p-6 rounded-lg shadow-sm border h-fit transition-colors ${editingCatId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-300'}`}>
                  <h3 className={`font-bold mb-4 pb-2 border-b flex items-center ${editingCatId ? 'text-yellow-800' : 'text-gray-900'}`}>
                      {editingCatId ? <Edit size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>} 
                      {editingCatId ? 'Cập nhật loại văn bản' : 'Thêm loại văn bản'}
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Tên loại văn bản</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500"
                            placeholder="VD: Đề thi"
                            value={newCat.name}
                            onChange={e => setNewCat({...newCat, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Mã định danh (Slug)</label>
                          <input 
                            type="text" 
                            className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 font-mono"
                            placeholder="vd: de-thi"
                            value={newCat.slug}
                            onChange={e => setNewCat({...newCat, slug: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Mô tả</label>
                          <textarea 
                             className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500"
                             rows={2}
                             value={newCat.description}
                             onChange={e => setNewCat({...newCat, description: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-2">
                          {editingCatId && (
                              <button 
                                onClick={handleCancelEditCat}
                                className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300"
                              >
                                  Hủy
                              </button>
                          )}
                          <button 
                            onClick={handleSaveCat} 
                            className={`flex-1 text-white font-bold py-2 rounded flex items-center justify-center ${editingCatId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                             {editingCatId ? <><Save size={16} className="mr-2"/> Cập nhật</> : 'Lưu cấu hình'}
                          </button>
                      </div>
                  </div>
              </div>

              {/* List Cats */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                  <table className="w-full text-left">
                      <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-700">
                          <tr>
                              <th className="p-3 text-center w-12">#</th>
                              <th className="p-3">Tên loại</th>
                              <th className="p-3">Mã (Slug)</th>
                              <th className="p-3">Mô tả</th>
                              <th className="p-3 text-right">Thao tác</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {categories.map((cat, index) => (
                              <tr key={cat.id} className={`hover:bg-gray-50 ${editingCatId === cat.id ? 'bg-yellow-50' : ''}`}>
                                  <td className="p-3 text-center text-xs font-bold text-gray-400">{cat.order || index + 1}</td>
                                  <td className="p-3 font-bold text-blue-900 flex items-center">
                                      <FolderOpen size={16} className="mr-2 text-yellow-500"/> {cat.name}
                                  </td>
                                  <td className="p-3 font-mono text-xs text-gray-600">{cat.slug}</td>
                                  <td className="p-3 text-sm text-gray-600">{cat.description}</td>
                                  <td className="p-3 text-right">
                                      <div className="flex justify-end gap-1 items-center">
                                         <div className="flex flex-col mr-2 border-r pr-2 border-gray-200">
                                            <button 
                                                onClick={() => handleMoveCat(cat, 'up')} 
                                                disabled={index === 0}
                                                className={`p-0.5 ${index === 0 ? 'text-gray-300' : 'text-gray-400 hover:text-blue-600'}`}
                                            >
                                                <ArrowUp size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => handleMoveCat(cat, 'down')}
                                                disabled={index === categories.length - 1}
                                                className={`p-0.5 ${index === categories.length - 1 ? 'text-gray-300' : 'text-gray-400 hover:text-blue-600'}`}
                                            >
                                                <ArrowDown size={14}/>
                                            </button>
                                         </div>

                                        <button 
                                            onClick={() => handleEditCat(cat)} 
                                            className="text-yellow-600 hover:bg-yellow-100 p-1.5 rounded"
                                            title="Sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCat(cat.id)} 
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};
