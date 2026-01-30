
import React, { useState, useEffect } from 'react';
import { SchoolDocument, DocumentCategory } from '../../types';
import { DatabaseService } from '../../services/database';
import { Plus, Trash2, Link as LinkIcon, Settings, List, FolderOpen, UploadCloud, CheckCircle, Edit, Save, ArrowUp, ArrowDown, RotateCcw, AlertCircle, Download } from 'lucide-react';

interface ManageDocumentsProps {
  documents: SchoolDocument[];
  categories: DocumentCategory[];
  refreshData: () => void;
}

export const ManageDocuments: React.FC<ManageDocumentsProps> = ({ documents, categories, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'categories'>('docs');

  // Upload Mode State - Mặc định là upload file theo yêu cầu
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('file');
  
  // State for New Document
  const [newDoc, setNewDoc] = useState<Partial<SchoolDocument>>({ 
    date: new Date().toISOString().split('T')[0],
    downloadUrl: '',
    categoryId: ''
  });

  // State for Categories
  const [newCat, setNewCat] = useState<Partial<DocumentCategory>>({ name: '', slug: '', description: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  // Set default category for new doc when categories load
  useEffect(() => {
    if (categories.length > 0 && !newDoc.categoryId) {
        setNewDoc(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  // --- HELPER: Slug Generator ---
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleCatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.target.value;
      setNewCat(prev => ({ 
          ...prev, 
          name, 
          slug: isAutoSlug ? generateSlug(name) : prev.slug 
      }));
  };

  // --- DOCUMENT HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // Tăng giới hạn lên 10MB
            alert("File quá lớn! Vui lòng chọn file dưới 10MB.");
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
      // QUAN TRỌNG: Để id rỗng để Database tự sinh UUID, tránh lỗi "invalid input syntax for type uuid"
      id: '', 
      number: newDoc.number!,
      title: newDoc.title!,
      date: newDoc.date!,
      categoryId: newDoc.categoryId,
      downloadUrl: newDoc.downloadUrl
    };
    
    try {
        await DatabaseService.saveDocument(doc);
        // Reset form sau khi lưu thành công
        setNewDoc({ 
            categoryId: categories[0]?.id || '', 
            date: new Date().toISOString().split('T')[0], 
            title: '', 
            number: '', 
            downloadUrl: '' 
        });
        // Reset file input (nếu có thể) bằng cách render lại component hoặc dùng ref
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        refreshData();
        alert("Đã lưu văn bản thành công!");
    } catch (e: any) {
        console.error(e);
        alert("Lỗi khi lưu văn bản: " + (e.message || e));
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm("Xóa văn bản này?")) {
      try {
        await DatabaseService.deleteDocument(id);
        refreshData();
      } catch (e: any) {
        alert("Không thể xóa: " + e.message);
      }
    }
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCat = async () => {
    if (!newCat.name || !newCat.slug) return alert("Vui lòng nhập tên và mã định danh");
    
    try {
        // Calculate new order safely
        const currentOrders = categories.map(c => c.order || 0);
        const maxOrder = currentOrders.length > 0 ? Math.max(...currentOrders) : 0;
        
        await DatabaseService.saveDocCategory({
            // Sử dụng check để đảm bảo ID hợp lệ khi update/insert
            id: editingCatId ? editingCatId : '', // Để trống cho Insert
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description || '',
            order: editingCatId 
                ? (categories.find(c => c.id === editingCatId)?.order || 0) 
                : maxOrder + 1
        });

        setNewCat({ name: '', slug: '', description: '' });
        setEditingCatId(null);
        setIsAutoSlug(true);
        refreshData();
    } catch (error: any) {
        console.error(error);
        alert("Lỗi khi lưu loại văn bản: " + (error.message || error));
    }
  };

  const handleEditCat = (cat: DocumentCategory) => {
    setNewCat({ name: cat.name, slug: cat.slug, description: cat.description });
    setEditingCatId(cat.id);
    setIsAutoSlug(false);
  };

  const handleCancelEditCat = () => {
    setNewCat({ name: '', slug: '', description: '' });
    setEditingCatId(null);
    setIsAutoSlug(true);
  };

  const handleDeleteCat = async (id: string) => {
      const hasDocs = documents.some(d => d.categoryId === id);
      if (hasDocs) return alert("Không thể xóa loại văn bản này vì đang chứa tài liệu.");
      
      if (confirm("Bạn chắc chắn muốn xóa loại văn bản này?")) {
          await DatabaseService.deleteDocCategory(id);
          if (editingCatId === id) handleCancelEditCat();
          refreshData();
      }
  };

  const handleMoveCat = async (cat: DocumentCategory, direction: 'up' | 'down') => {
      const sortedCats = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));
      const index = sortedCats.findIndex(c => c.id === cat.id);
      
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === sortedCats.length - 1) return;
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      const temp = sortedCats[index];
      sortedCats[index] = sortedCats[targetIndex];
      sortedCats[targetIndex] = temp;
      
      const reorderedCats = sortedCats.map((c, idx) => ({
          ...c,
          order: idx + 1
      }));
      
      try {
          await DatabaseService.saveDocCategoriesOrder(reorderedCats);
          refreshData();
      } catch (e: any) {
          alert("Lỗi khi cập nhật thứ tự: " + (e.message || e));
      }
  };

  const displayCategories = [...categories].sort((a,b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded text-sm text-blue-900 flex justify-between items-center shadow-sm">
         <div>
            <strong>Module Văn bản & Tài liệu:</strong> Quản lý công văn, quyết định, tài liệu tải về.
         </div>
         <div className="flex space-x-2 bg-white p-1 rounded border border-blue-100">
            <button 
                onClick={() => setActiveTab('docs')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center transition ${activeTab === 'docs' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <List size={14} className="mr-1"/> Danh sách văn bản
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
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
                        {displayCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Số kí hiệu</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="VD: 01/QĐ-UBND"
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
                        <label className="block text-sm font-bold text-gray-900">File đính kèm</label>
                        <div className="flex text-xs border rounded overflow-hidden">
                            <button 
                                onClick={() => setUploadMode('file')}
                                className={`px-3 py-1 font-medium transition ${uploadMode === 'file' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <UploadCloud size={14} className="inline mr-1"/>
                                Tải từ máy tính
                            </button>
                            <button 
                                onClick={() => setUploadMode('link')}
                                className={`px-3 py-1 font-medium transition ${uploadMode === 'link' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <LinkIcon size={14} className="inline mr-1"/>
                                Link Online
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
                                        : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
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
                                            <UploadCloud className="w-8 h-8 text-blue-600 mb-1" />
                                            <p className="text-sm text-gray-600"><span className="font-bold text-blue-700">Nhấn để chọn file</span> (PDF, Doc, Excel...)</p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.png"
                                    onChange={handleFileUpload} 
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="md:col-span-4">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Trích yếu (Nội dung tóm tắt)</label>
                    <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded p-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập nội dung trích yếu..."
                    value={newDoc.title || ''}
                    onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                    />
                </div>

                <div className="md:col-span-4 flex justify-end">
                    <button onClick={handleAddDoc} className="bg-blue-700 text-white font-bold py-2.5 px-6 rounded hover:bg-blue-800 transition shadow flex items-center">
                        <Plus size={18} className="mr-2" /> Lưu văn bản
                    </button>
                </div>
            </div>
        </div>

        {/* List Table - RECONFIGURED COLUMNS: STT | Số kí hiệu | Ngày | Trích yếu | File */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full text-left border-collapse">
            <thead className="bg-white text-gray-800 font-bold text-sm border-b-2 border-gray-200">
                <tr>
                <th className="p-3 border border-gray-200 w-16 text-center">STT</th>
                <th className="p-3 border border-gray-200 w-48">Số kí hiệu</th>
                <th className="p-3 border border-gray-200 w-32 text-center">Ngày ban hành</th>
                <th className="p-3 border border-gray-200">Trích yếu</th>
                <th className="p-3 border border-gray-200 w-40">File đính kèm</th>
                <th className="p-3 border border-gray-200 w-16 text-center">Xóa</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {documents.map((doc, index) => {
                    const isLocalFile = doc.downloadUrl && doc.downloadUrl.startsWith('data:');
                    
                    return (
                        <tr key={doc.id} className="hover:bg-blue-50 transition">
                            <td className="p-3 border border-gray-200 text-center font-bold text-gray-500">
                                {index + 1}
                            </td>
                            <td className="p-3 border border-gray-200 font-medium text-gray-700">
                                {doc.number}
                            </td>
                            <td className="p-3 border border-gray-200 text-center text-gray-600">
                                {doc.date.split('-').reverse().join('/')}
                            </td>
                            <td className="p-3 border border-gray-200 font-medium text-gray-800">
                                {doc.title}
                            </td>
                            <td className="p-3 border border-gray-200">
                            {doc.downloadUrl && doc.downloadUrl !== '#' ? (
                                <a 
                                    href={doc.downloadUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    download={isLocalFile ? `${doc.number}.pdf` : undefined} 
                                    className="flex items-center text-gray-700 font-bold hover:text-blue-600 group"
                                >
                                    <Download size={16} className="mr-1 group-hover:animate-bounce" /> Tải tập tin
                                </a>
                            ) : <span className="text-gray-400 italic">Không có file</span>}
                            </td>
                            <td className="p-3 border border-gray-200 text-center">
                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50" title="Xóa">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    );
                })}
                {documents.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 italic">Chưa có văn bản nào.</td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </>
      )}

      {/* TAB: CATEGORIES CONFIG */}
      {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add/Edit Cat Form */}
              <div className={`p-6 rounded-lg shadow-sm border h-fit sticky top-4 transition-colors ${editingCatId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-bold mb-4 pb-2 border-b flex items-center ${editingCatId ? 'text-yellow-800' : 'text-gray-900'}`}>
                      {editingCatId ? <Edit size={18} className="mr-2"/> : <Plus size={18} className="mr-2"/>} 
                      {editingCatId ? 'Cập nhật loại văn bản' : 'Thêm loại văn bản'}
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Tên loại văn bản <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="VD: Đề thi, Kế hoạch..."
                            value={newCat.name}
                            onChange={handleCatNameChange}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Mã định danh (Slug) <span className="text-red-500">*</span></label>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 font-mono outline-none"
                                placeholder="vd: de-thi"
                                value={newCat.slug}
                                onChange={e => setNewCat({...newCat, slug: e.target.value})}
                                readOnly={isAutoSlug}
                              />
                              <button 
                                type="button"
                                onClick={() => setIsAutoSlug(!isAutoSlug)} 
                                className={`p-2 rounded border ${isAutoSlug ? 'bg-gray-100 text-blue-600' : 'bg-white text-gray-500'}`}
                                title="Tự động tạo mã"
                              >
                                <RotateCcw size={16}/>
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-900 mb-1">Mô tả</label>
                          <textarea 
                             className="w-full border p-2 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                             rows={3}
                             placeholder="Mô tả ngắn gọn về loại tài liệu này..."
                             value={newCat.description}
                             onChange={e => setNewCat({...newCat, description: e.target.value})}
                          />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                          {editingCatId && (
                              <button 
                                type="button"
                                onClick={handleCancelEditCat}
                                className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition"
                              >
                                  Hủy
                              </button>
                          )}
                          <button 
                            type="button"
                            onClick={handleSaveCat} 
                            className={`flex-1 text-white font-bold py-2 rounded flex items-center justify-center transition shadow-sm ${editingCatId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                             {editingCatId ? <><Save size={16} className="mr-2"/> Lưu lại</> : <><Plus size={16} className="mr-2"/> Thêm mới</>}
                          </button>
                      </div>
                  </div>
              </div>

              {/* List Cats */}
              <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <h4 className="font-bold text-gray-700 uppercase text-xs">Danh sách ({categories.length})</h4>
                      <span className="text-xs text-gray-500 italic">Kéo lên/xuống để sắp xếp</span>
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-white text-xs font-bold uppercase text-gray-500 border-b border-gray-100">
                          <tr>
                              <th className="p-3 text-center w-12">#</th>
                              <th className="p-3">Tên loại</th>
                              <th className="p-3">Mô tả</th>
                              <th className="p-3 text-right">Thao tác</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {displayCategories.map((cat, index) => (
                              <tr key={cat.id} className={`hover:bg-gray-50 transition ${editingCatId === cat.id ? 'bg-yellow-50' : ''}`}>
                                  <td className="p-3 text-center text-xs font-bold text-gray-400">{index + 1}</td>
                                  <td className="p-3">
                                      <div className="font-bold text-blue-900 flex items-center">
                                        <FolderOpen size={16} className="mr-2 text-yellow-500"/> {cat.name}
                                      </div>
                                      <div className="text-xs font-mono text-gray-400 mt-1">{cat.slug}</div>
                                  </td>
                                  <td className="p-3 text-sm text-gray-600">{cat.description}</td>
                                  <td className="p-3 text-right">
                                      <div className="flex justify-end gap-1 items-center">
                                         <div className="flex flex-col mr-2 border-r pr-2 border-gray-200">
                                            <button 
                                                onClick={() => handleMoveCat(cat, 'up')} 
                                                disabled={index === 0}
                                                className={`p-0.5 rounded transition ${index === 0 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                            >
                                                <ArrowUp size={14}/>
                                            </button>
                                            <button 
                                                onClick={() => handleMoveCat(cat, 'down')} 
                                                disabled={index === categories.length - 1}
                                                className={`p-0.5 rounded transition ${index === categories.length - 1 ? 'text-gray-200' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                            >
                                                <ArrowDown size={14}/>
                                            </button>
                                         </div>

                                        <button 
                                            onClick={() => handleEditCat(cat)} 
                                            className="text-yellow-600 hover:bg-yellow-100 p-1.5 rounded transition"
                                            title="Sửa"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCat(cat.id)} 
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"
                                            title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                          {categories.length === 0 && (
                              <tr>
                                  <td colSpan={4} className="p-8 text-center text-gray-400">
                                      <div className="flex flex-col items-center">
                                          <AlertCircle size={24} className="mb-2"/>
                                          Chưa có loại văn bản nào. Hãy thêm mới từ cột bên trái.
                                      </div>
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};
