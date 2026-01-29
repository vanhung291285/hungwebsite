import React, { useState, useRef } from 'react';
import { GalleryImage, GalleryAlbum } from '../../types';
import { DatabaseService } from '../../services/database';
import { Upload, Trash2, Image as ImageIcon, FolderPlus, Folder, Edit, X, Save, UploadCloud } from 'lucide-react';

interface ManageGalleryProps {
  images: GalleryImage[];
  albums: GalleryAlbum[];
  refreshData: () => void;
}

export const ManageGallery: React.FC<ManageGalleryProps> = ({ images, albums, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'albums' | 'photos'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | 'all'>('all');

  // --- ALBUM STATE ---
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
  const [albumForm, setAlbumForm] = useState<Partial<GalleryAlbum>>({ 
    id: '', title: '', description: '', thumbnail: '' 
  });
  const albumFileInputRef = useRef<HTMLInputElement>(null);

  // --- PHOTO STATE ---
  const [photoForm, setPhotoForm] = useState<{ url: string, caption: string, albumId: string }>({
     url: '', caption: '', albumId: ''
  });
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File, callback: (base64: string) => void) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          if (reader.result) callback(reader.result as string);
      };
      reader.readAsDataURL(file);
  };

  const resetAlbumForm = () => {
     setAlbumForm({ id: '', title: '', description: '', thumbnail: '' });
     setIsEditingAlbum(false);
     if (albumFileInputRef.current) albumFileInputRef.current.value = '';
  };

  const handleEditAlbumClick = (album: GalleryAlbum) => {
     setAlbumForm(album);
     setIsEditingAlbum(true);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAlbum = async () => {
    if (!albumForm.title) return alert("Vui lòng nhập Tên Album");
    if (!albumForm.thumbnail) return alert("Vui lòng chọn Ảnh bìa đại diện");
    
    const albumData: GalleryAlbum = {
      id: isEditingAlbum && albumForm.id ? albumForm.id : `album_${Date.now()}`,
      title: albumForm.title,
      description: albumForm.description || '',
      thumbnail: albumForm.thumbnail,
      createdDate: isEditingAlbum && albumForm.createdDate ? albumForm.createdDate : new Date().toISOString().split('T')[0]
    };

    await DatabaseService.saveAlbum(albumData);
    resetAlbumForm();
    refreshData();
  };

  const handleDeleteAlbum = async (id: string) => {
     if (confirm("CẢNH BÁO: Xóa album này? Các ảnh trong album sẽ mất liên kết.")) {
        await DatabaseService.deleteAlbum(id);
        refreshData();
     }
  };

  const onAlbumFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0], (base64) => {
            setAlbumForm(prev => ({ ...prev, thumbnail: base64 }));
        });
     }
  };

  const handleSavePhoto = async () => {
    if (!photoForm.url) return alert("Vui lòng chọn file ảnh");
    if (!photoForm.albumId) return alert("Vui lòng chọn Album để tải ảnh vào");

    await DatabaseService.saveImage({
      id: Date.now().toString(),
      url: photoForm.url,
      caption: photoForm.caption || '',
      albumId: photoForm.albumId
    });
    
    setPhotoForm(prev => ({ ...prev, url: '', caption: '' }));
    if (photoFileInputRef.current) photoFileInputRef.current.value = '';
    refreshData();
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm("Xóa ảnh này?")) {
      await DatabaseService.deleteImage(id);
      refreshData();
    }
  };

  const onPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
       handleFileUpload(e.target.files[0], (base64) => {
           setPhotoForm(prev => ({ ...prev, url: base64 }));
       });
    }
 };

  const filteredImages = selectedAlbumId === 'all' 
    ? images 
    : images.filter(img => img.albumId === selectedAlbumId);

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded text-sm text-purple-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <strong>Module Thư viện ảnh:</strong> Quản lý Album và upload hình ảnh hoạt động.
        </div>
        <div className="flex space-x-2 bg-white p-1 rounded border border-purple-200">
            <button 
               onClick={() => setActiveTab('albums')} 
               className={`px-4 py-2 rounded text-xs font-bold flex items-center transition ${activeTab === 'albums' ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               <Folder className="mr-2" size={14} /> Quản lý Album
            </button>
            <button 
               onClick={() => setActiveTab('photos')} 
               className={`px-4 py-2 rounded text-xs font-bold flex items-center transition ${activeTab === 'photos' ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
               <ImageIcon className="mr-2" size={14} /> Upload Ảnh
            </button>
        </div>
      </div>

      {activeTab === 'albums' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
               <div className={`p-6 rounded-lg shadow-sm border sticky top-4 transition-colors ${isEditingAlbum ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                  <h3 className={`font-bold mb-4 flex items-center border-b pb-2 ${isEditingAlbum ? 'text-yellow-800' : 'text-gray-800'}`}>
                     {isEditingAlbum ? <Edit size={20} className="mr-2"/> : <FolderPlus size={20} className="mr-2 text-purple-600"/>}
                     {isEditingAlbum ? 'Cập nhật Album' : 'Tạo Album Mới'}
                  </h3>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên Album <span className="text-red-500">*</span></label>
                        <input 
                           type="text" 
                           className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                           placeholder="VD: Lễ Khai Giảng 2024"
                           value={albumForm.title}
                           onChange={e => setAlbumForm({...albumForm, title: e.target.value})}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ảnh bìa Album <span className="text-red-500">*</span></label>
                        <div 
                           className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-purple-400 transition relative bg-white"
                           onClick={() => albumFileInputRef.current?.click()}
                        >
                           {albumForm.thumbnail ? (
                              <div className="relative">
                                 <img src={albumForm.thumbnail} alt="Preview" className="w-full h-32 object-cover rounded shadow-sm" />
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded text-white text-xs font-bold">
                                    Nhấn để thay ảnh
                                 </div>
                              </div>
                           ) : (
                              <div className="py-4 text-gray-500">
                                 <UploadCloud className="mx-auto mb-2 text-gray-400" size={24}/>
                                 <span className="text-xs">Nhấn để tải ảnh bìa</span>
                              </div>
                           )}
                           <input 
                              type="file" 
                              ref={albumFileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={onAlbumFileChange}
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả ngắn</label>
                        <textarea 
                           className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                           rows={3}
                           placeholder="Mô tả về hoạt động này..."
                           value={albumForm.description}
                           onChange={e => setAlbumForm({...albumForm, description: e.target.value})}
                        />
                     </div>

                     <div className="flex gap-2">
                        {isEditingAlbum && (
                           <button 
                              onClick={resetAlbumForm}
                              className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300 transition"
                           >
                              Hủy
                           </button>
                        )}
                        <button 
                           onClick={handleSaveAlbum} 
                           className={`flex-1 text-white font-bold py-2 rounded transition shadow-sm flex items-center justify-center ${isEditingAlbum ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                           <Save size={16} className="mr-2"/> {isEditingAlbum ? 'Lưu thay đổi' : 'Tạo Album'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-2">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {albums.map(album => (
                     <div key={album.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col group relative">
                        <div className="h-48 overflow-hidden relative bg-gray-100">
                           <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              <button 
                                 onClick={() => handleEditAlbumClick(album)}
                                 className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 shadow transform hover:scale-110 transition"
                                 title="Sửa Album"
                              >
                                 <Edit size={18} />
                              </button>
                              <button 
                                 onClick={() => handleDeleteAlbum(album.id)} 
                                 className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow transform hover:scale-110 transition"
                                 title="Xóa Album"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                           <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">
                              {album.createdDate}
                           </div>
                        </div>

                        <div className="p-4 flex-1">
                           <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{album.title}</h4>
                           <p className="text-gray-500 text-sm line-clamp-2 mb-3">{album.description || 'Không có mô tả'}</p>
                           <div className="flex justify-between items-center border-t pt-2">
                              <div className="text-xs text-purple-600 font-bold bg-purple-50 inline-block px-2 py-1 rounded">
                                 {images.filter(i => i.albumId === album.id).length} ảnh
                              </div>
                              {isEditingAlbum && albumForm.id === album.id && (
                                 <span className="text-xs text-yellow-600 font-bold animate-pulse">Đang sửa...</span>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {activeTab === 'photos' && (
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center"><Upload size={20} className="mr-2 text-purple-600"/> Tải ảnh lên Album</h3>
               
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                     <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition bg-gray-50 relative overflow-hidden"
                        onClick={() => photoFileInputRef.current?.click()}
                     >
                         {photoForm.url ? (
                            <img src={photoForm.url} alt="Preview" className="w-full h-full object-contain" />
                         ) : (
                            <>
                                <UploadCloud size={32} className="text-gray-400 mb-2" />
                                <span className="text-sm font-bold text-gray-500">Nhấn để chọn ảnh</span>
                                <span className="text-xs text-gray-400 mt-1">(Hỗ trợ JPG, PNG, WEBP)</span>
                            </>
                         )}
                         <input 
                              type="file" 
                              ref={photoFileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={onPhotoFileChange}
                           />
                     </div>
                  </div>

                  <div className="w-full md:w-2/3 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Chọn Album đích <span className="text-red-500">*</span></label>
                           <select 
                              className="w-full border rounded p-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                              value={photoForm.albumId}
                              onChange={e => setPhotoForm({...photoForm, albumId: e.target.value})}
                           >
                              <option value="">-- Chọn Album --</option>
                              {albums.map(a => (
                                 <option key={a.id} value={a.id}>{a.title}</option>
                              ))}
                           </select>
                           {albums.length === 0 && <p className="text-xs text-red-500 mt-1">Vui lòng tạo Album trước.</p>}
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1">Chú thích ảnh</label>
                           <input 
                              type="text" 
                              className="w-full border rounded p-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-200 outline-none"
                              placeholder="Mô tả ngắn..."
                              value={photoForm.caption}
                              onChange={e => setPhotoForm({...photoForm, caption: e.target.value})}
                           />
                        </div>
                     </div>
                     <div className="flex justify-end">
                        <button 
                           onClick={handleSavePhoto} 
                           className="bg-purple-600 text-white font-bold py-2.5 px-6 rounded hover:bg-purple-700 shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={!photoForm.url || !photoForm.albumId}
                        >
                           <Upload size={18} className="mr-2"/> Tải ảnh lên
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            <div>
               <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded border">
                  <h3 className="font-bold text-gray-800 flex items-center text-sm"><ImageIcon size={18} className="mr-2"/> Danh sách hình ảnh</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-gray-500">Lọc theo:</span>
                     <select 
                        className="border rounded p-1.5 text-xs bg-white font-medium focus:ring-1 focus:ring-purple-500 outline-none"
                        value={selectedAlbumId}
                        onChange={e => setSelectedAlbumId(e.target.value)}
                     >
                        <option value="all">Tất cả Album</option>
                        {albums.map(a => (
                           <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredImages.map(img => {
                     const album = albums.find(a => a.id === img.albumId);
                     return (
                        <div key={img.id} className="relative group bg-white p-2 rounded shadow-sm border hover:shadow-md transition">
                           <div className="aspect-square overflow-hidden rounded mb-2 bg-gray-100 cursor-pointer">
                              <img src={img.url} alt="Gallery" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <div className="text-xs font-bold truncate text-gray-800" title={img.caption}>{img.caption || 'Không có tiêu đề'}</div>
                           <div className="text-[10px] text-gray-500 truncate">{album?.title || 'Chưa phân loại'}</div>
                           
                           <button 
                              onClick={() => handleDeletePhoto(img.id)}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:scale-110"
                              title="Xóa ảnh"
                           >
                              <Trash2 size={14} />
                           </button>
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};