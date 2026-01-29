import React from 'react';
import { SchoolConfig } from '../types';

interface IntroductionProps {
  config: SchoolConfig;
}

export const Introduction: React.FC<IntroductionProps> = ({ config }) => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Main Content - Moved to Left (First in HTML order) */}
        <div className="lg:w-3/4 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
           <h1 className="text-3xl font-bold text-blue-900 mb-6 pb-2 border-b">Tổng quan về {config.name}</h1>
           
           <div className="prose max-w-none text-gray-800">
              <p className="lead text-lg font-medium text-gray-600 mb-4">
                 Trải qua hơn 30 năm xây dựng và trưởng thành, {config.name} đã khẳng định vị thế là một trong những lá cờ đầu của ngành giáo dục Thủ đô.
              </p>
              
              <img src="https://picsum.photos/1000/500" alt="Toan canh truong" className="w-full rounded-lg shadow-md mb-6" />

              <h3 className="text-xl font-bold text-blue-800 mt-6 mb-3">Sứ mệnh & Tầm nhìn</h3>
              <p className="mb-4">
                 Nhà trường hướng tới mục tiêu giáo dục toàn diện, kết hợp hài hòa giữa tri thức, đạo đức và kỹ năng sống. 
                 Chúng tôi cam kết tạo ra một môi trường học tập năng động, sáng tạo, nơi mỗi học sinh đều được phát huy tối đa tiềm năng của mình.
              </p>

              <h3 className="text-xl font-bold text-blue-800 mt-6 mb-3">Cơ sở vật chất</h3>
              <p className="mb-4">
                 Trường được trang bị hệ thống phòng học hiện đại, 100% có máy chiếu và điều hòa. 
                 Hệ thống phòng chức năng bao gồm: Phòng thí nghiệm Lý - Hóa - Sinh, phòng Tin học, Thư viện chuẩn tiên tiến, nhà thi đấu đa năng và sân bóng đá cỏ nhân tạo.
              </p>
              
              <h3 className="text-xl font-bold text-blue-800 mt-6 mb-3">Đội ngũ giáo viên</h3>
              <p>
                 100% giáo viên đạt chuẩn và trên chuẩn, trong đó có hơn 40% là Thạc sĩ, Tiến sĩ. 
                 Các thầy cô không chỉ giỏi chuyên môn mà còn tâm huyết, yêu nghề và luôn đổi mới phương pháp giảng dạy.
              </p>
           </div>
        </div>

        {/* Sidebar Menu - Moved to Right (Second in HTML order) */}
        <aside className="lg:w-1/4">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-24">
             <div className="bg-blue-900 text-white p-3 font-bold uppercase text-center">
                Giới thiệu
             </div>
             <ul className="divide-y divide-gray-100">
                <li className="p-3 hover:bg-blue-50 cursor-pointer text-blue-800 font-medium border-l-4 border-blue-600 bg-blue-50">Tổng quan nhà trường</li>
                <li className="p-3 hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-800 border-l-4 border-transparent hover:border-blue-400 transition">Lịch sử hình thành</li>
                <li className="p-3 hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-800 border-l-4 border-transparent hover:border-blue-400 transition">Cơ cấu tổ chức</li>
                <li className="p-3 hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-800 border-l-4 border-transparent hover:border-blue-400 transition">Ban giám hiệu</li>
                <li className="p-3 hover:bg-blue-50 cursor-pointer text-gray-600 hover:text-blue-800 border-l-4 border-transparent hover:border-blue-400 transition">Thành tích nổi bật</li>
             </ul>
          </div>
        </aside>

      </div>
    </div>
  );
};