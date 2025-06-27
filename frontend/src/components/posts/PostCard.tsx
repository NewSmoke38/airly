import React from 'react';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Post } from '../../types';

interface PostCardProps {
  post: Post;
  onEdit?: () => void;
  onClick?: () => void;
  imageDimensions?: { width: number; height: number };
}

export const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onClick, imageDimensions }) => {
  // Handle both data structures
  const imageUrl = post.media || post.imageUrl || '';
  const title = post.title || '';
  const content = post.content || post.description || '';
  const userAvatar = post.user?.pfp || post.author?.avatar || '';
  const userName = post.user?.fullName || post.author?.name || '';
  const userHandle = post.user?.username || post.author?.email?.split('@')[0] || '';
  const likes = post.likes || 0;
  const isLiked = post.isLiked || false;

  // Calculate image aspect ratio for better display
  const getImageStyle = () => {
    if (!imageDimensions) {
      return { aspectRatio: '1' }; // Default square until loaded
    }
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    return { aspectRatio: aspectRatio.toString() };
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden border border-gray-100/50 hover:shadow-xl transition-all duration-300 cursor-pointer group h-fit"
      onClick={onClick}
    >
      {/* Post Image */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={getImageStyle()}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <p className="font-medium text-gray-900 text-sm">{userName}</p>
              <p className="text-xs text-gray-500">@{userHandle}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 duration-200"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {title && (
          <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">{title}</h3>
        )}
        
        {content && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-3 leading-relaxed">{content}</p>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-4">
            <button 
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors text-xs ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments || 0}</span>
            </button>
          </div>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="hover:text-amber-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};