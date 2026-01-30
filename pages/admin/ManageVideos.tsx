
import React, { useState, useEffect } from 'react';
import { Video } from '../../types';
import { DatabaseService } from '../../services/database';
import { Video as VideoIcon, Plus, Trash2, Save, PlayCircle, Eye, EyeOff, AlertTriangle, HelpCircle } from 'lucide-react';

interface ManageVideosProps {
  refreshData?: () => void;
}

export const ManageVideos: React.FC<ManageVideosProps> = ({ refreshData }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [formData, setFormData] = useState<Partial<Video>>({
    title: '',
    youtubeUrl: '',
    isVisible: true
  });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await DatabaseService.getVideos();
    setVideos(data);
  };

  // Hàm trích xuất ID Youtube mạnh mẽ hơn
  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    
    // Trường hợp 1: Người dùng copy cả thẻ <iframe ... src="...">
    if (url.includes('<iframe') || url.includes('src=')) {
        const srcMatch = url.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
            url = srcMatch[1];
        }
    }

    // Trường hợp 2: Các dạng link phổ biến (Shorts, Embed, Watch, Youtu.be)
    // Regex bắt các dạng:
    // - youtube.com/watch?v=ID
    // - youtube.com/embed/ID
    // - youtube.com/v/ID
    // - youtube.com/shorts/ID
    // - youtu.be/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
        return match[2];
    }
    
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      const id = extractYoutubeId(url);
      
      setFormData(prev => ({ 
          ...prev, 
          youtubeUrl: url, 
          youtubeId: id || '' 
      }));

      if (id) {
          setPreviewId(id);
          setErrorMsg('');
          // Tự động lấy title tạm thời nếu chưa nhập (Optional: có thể dùng API Youtube nếu có key)
          if (!formData.title) {
             // Không thể lấy title trực tiếp từ client nếu không có API Key, user tự nhập
          }
      } else {
          setPreviewId(null);
          if (url.trim() !== '') {
              setErrorMsg('Không nhận diện được ID Video. Vui lòng kiểm tra lại đường dẫn.');
          } else {
              setErrorMsg('');
          }
      }
  };

  const handleSave = async () => {
    if (!formData.title) {
        return alert("Vui lòng nhập tiêu đề video.");
    }
    if (!formData.youtubeId) {
        return alert("Đường dẫn Youtube không hợp lệ.");
    }

    try {
        await DatabaseService.saveVideo({
            id: formData.id || `v_${Date.now()}`, // ID sẽ được DB sinh lại nếu là insert
            title: formData.title,
            youtubeUrl: `https://www.youtube.com/watch?v=${formData.youtubeId}`, // Chuẩn hóa URL khi lưu
            youtubeId: formData.youtubeId,
            thumbnail: `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`,
            isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
            order: formData.order || videos.length + 1
        });

        setFormData({ title: '', youtubeUrl: '', isVisible: true, youtubeId: '' });
        setPreviewId(null);
        setErrorMsg('');
        await loadData();
        if (refreshData) refreshData();
        alert("Lưu video thành công!");
    } catch (error: any) {
        console.error(error);
        alert("Lỗi khi lưu video: " + error.message + "\n\nVui lòng chạy script SQL 'db_schema_videos.sql' trên Supabase nếu đây là lần đầu tiên sử dụng.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xóa video này khỏi danh sách?")) {
        await DatabaseService.deleteVideo(id);
        await loadData();
        if (refreshData) refreshData();
    }
  };

  const toggleVisibility = async (video: Video) => {
      await DatabaseService.saveVideo({ ...video, isVisible: !video.isVisible });
      await loadData();
      if (refreshData) refreshData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded text-sm text-red-900 flex justify-between items-start">
            <div>
                <strong>Module Thư viện Video:</strong> Quản lý các video từ Youtube hiển thị trên trang chủ.
                <ul className="list-disc ml-5 mt-1 text-xs text-red-800">
                    <li>Hỗ trợ link thường, link Shorts, và link rút gọn (youtu.be).</li>
                    <li>Nếu video hiện <strong>"Video unavailable"</strong> (Lỗi 150/153): Do chủ sở hữu video chặn nhúng trên web khác. Hãy chọn video khác.</li>
                </ul>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                        <Plus size={20} className="mr-2 text-red-600"/> Thêm Video Mới
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề Video <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-red-200 outline-none"
                                placeholder="VD: Lễ tổng kết năm học 2024..."
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Link Youtube <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className={`w-full border rounded p-2 text-sm bg-white focus:ring-2 outline-none ${errorMsg ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-200'}`}
                                placeholder="Dán link Youtube vào đây..."
                                value={formData.youtubeUrl}
                                onChange={handleUrlChange}
                            />
                            {errorMsg && <p className="text-xs text-red-500 mt-1 font-medium">{errorMsg}</p>}
                        </div>

                        {previewId && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Xem trước:</label>
                                <div className="aspect-video w-full rounded overflow-hidden bg-black border border-gray-300 relative group">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={`https://www.youtube.com/embed/${previewId}`} 
                                        title="YouTube video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-xs text-yellow-800 flex items-start">
                                    <HelpCircle size={14} className="mr-1.5 flex-shrink-0 mt-0.5"/>
                                    <span>Nếu thấy <b>"Video unavailable"</b>, video này đã bị chặn nhúng bởi chủ sở hữu. Vui lòng chọn video khác.</span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={handleSave}
                                disabled={!!errorMsg || !previewId}
                                className={`bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition shadow flex items-center w-full justify-center ${(!previewId || !!errorMsg) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Save size={16} className="mr-2"/> Lưu Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                        <span>Danh sách Video ({videos.length})</span>
                        <span className="text-xs font-normal text-gray-500 italic">Mới nhất lên đầu</span>
                    </div>
                    
                    {videos.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 italic flex flex-col items-center">
                            <PlayCircle size={48} className="text-gray-300 mb-2"/>
                            Chưa có video nào. Hãy thêm mới từ link Youtube.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {videos.map(video => (
                                <div key={video.id} className={`border rounded-lg overflow-hidden flex flex-col group ${!video.isVisible ? 'opacity-60 bg-gray-100' : 'bg-white hover:shadow-md transition'}`}>
                                    <div className="aspect-video relative bg-black">
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={`https://www.youtube.com/embed/${video.youtubeId}`} 
                                            title={video.title}
                                            frameBorder="0" 
                                            allowFullScreen
                                            className="absolute inset-0"
                                        ></iframe>
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 flex-grow hover:text-red-700 cursor-default" title={video.title}>{video.title}</h4>
                                        <div className="flex justify-between items-center border-t pt-2">
                                            <button 
                                                onClick={() => toggleVisibility(video)}
                                                className={`text-xs font-bold px-2 py-1 rounded border flex items-center transition ${video.isVisible ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-200 text-gray-500 border-gray-300 hover:bg-gray-300'}`}
                                            >
                                                {video.isVisible ? <><Eye size={12} className="mr-1"/> Hiển thị</> : <><EyeOff size={12} className="mr-1"/> Đang ẩn</>}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(video.id)}
                                                className="text-red-500 hover:text-white hover:bg-red-600 p-1.5 rounded transition"
                                                title="Xóa video"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
