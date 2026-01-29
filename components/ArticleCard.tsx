import React from 'react';
import { Post } from '../types';
import { Calendar, User, Eye } from 'lucide-react';

interface ArticleCardProps {
  post: Post;
  onClick: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ post, onClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={() => onClick(post.id)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={post.thumbnail} 
          alt={post.title} 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-bold text-white rounded uppercase ${
            post.category === 'news' ? 'bg-blue-600' :
            post.category === 'announcement' ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {post.category === 'news' ? 'Tin tức' : post.category === 'announcement' ? 'Thông báo' : 'Hoạt động'}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-700">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow">
          {post.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3 mt-auto">
          <div className="flex items-center space-x-2">
            <Calendar size={14} />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye size={14} />
            <span>{post.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
