
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Lock, Mail, UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface RegisterProps {
  onNavigate: (path: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up with Supabase Auth & Include Metadata
      // Việc gửi data vào options sẽ giúp Trigger trong database nhận được thông tin để tạo user_profiles
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                full_name: formData.fullName,
                username: formData.email.split('@')[0], // Tạo username mặc định từ email
            }
        }
      });

      if (authError) throw authError;

      // Nếu đăng ký thành công (dù cần xác thực email hay không)
      if (data.user) {
         setSuccess(true);
      }
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
       setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
         <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-4 border-green-500 animate-fade-in">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600"/>
             </div>
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
             <p className="text-gray-600 mb-6">Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email để xác thực trước khi đăng nhập.</p>
             
             <div className="flex gap-3 justify-center">
                 <button 
                    onClick={() => onNavigate('home')}
                    className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded"
                 >
                    Về trang chủ
                 </button>
                 <button 
                    onClick={() => onNavigate('login')}
                    className="px-5 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow"
                 >
                    Đăng nhập
                 </button>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative py-12 px-4">
      <button 
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-blue-600 transition font-medium"
      >
        <ArrowLeft size={20} className="mr-2" /> Về trang chủ
      </button>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg border-t-4 border-orange-500 animate-fade-in">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <UserPlus size={32} className="text-orange-600" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800">Đăng ký Thành viên</h2>
           <p className="text-sm text-gray-500 mt-2">Tạo tài khoản để tham gia cộng đồng nhà trường</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-6 text-sm flex items-center border border-red-200">
             <AlertCircle size={16} className="mr-2 flex-shrink-0" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
             <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  required
                />
             </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      placeholder="******"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={6}
                    />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nhập lại mật khẩu</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      placeholder="******"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                 </div>
               </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className={`w-full bg-orange-600 text-white font-bold py-3 rounded hover:bg-orange-700 transition shadow-lg transform active:scale-95 ${loading ? 'opacity-70 cursor-wait' : ''}`}
           >
             {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
           </button>
           
           <div className="text-center text-sm text-gray-500 mt-4">
              Đã có tài khoản? <span onClick={() => onNavigate('login')} className="text-blue-600 font-bold cursor-pointer hover:underline">Đăng nhập tại đây</span>
           </div>
        </form>
      </div>
    </div>
  );
};
