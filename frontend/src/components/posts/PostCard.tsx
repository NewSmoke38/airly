import React, { useState } from 'react';
import { Heart, Download, Share, MoreHorizontal, Edit, Eye } from 'lucide-react';
import { Post } from '../../types';
import { feedService } from '../../services/feedService';

interface PostCardProps {
  post: Post;  
  onEdit?: (post: Post) => void;  
  onClick: () => void;  
}

export const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onClick }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);  
  const [likes, setLikes] = useState(post.likes);  
  const [showActions, setShowActions] = useState(false);  
  const [imageError, setImageError] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      await feedService.toggleLike(post.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setIsLiked(isLiked);
      setLikes(prev => isLiked ? prev + 1 : prev - 1);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();  
    onEdit?.(post);  
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:scale-[1.02] border border-gray-100/50 cursor-pointer"
      onMouseEnter={() => setShowActions(true)}   // shows actions on hover, the download and other buttons
      onMouseLeave={() => setShowActions(false)}  // hides it when hover goes away
      onClick={onClick}  
    >
      <div className="relative">
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📷</div>
              <p className="text-gray-500 text-sm">Image not available</p>
            </div>
          </div>
        ) : (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        )}
        
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex space-x-3">
            <button
              onClick={handleLike}
              className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:scale-110 ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button 
              onClick={(e) => e.stopPropagation()}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
            >
              <Share className="w-5 h-5" />
            </button>
            
            {onEdit && (
              <button
                onClick={handleEdit}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div
          className={`absolute top-4 right-4 transition-opacity duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div
          className={`absolute bottom-4 right-4 transition-opacity duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-xs text-white">{Math.floor(Math.random() * 1000) + 100}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-xs rounded-full border border-amber-100"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{post.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
            />
            <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600 font-medium">{likes.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};