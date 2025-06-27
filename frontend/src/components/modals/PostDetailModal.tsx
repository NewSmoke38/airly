import React, { useEffect } from 'react';
import { X, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}) => {
  const navigate = useNavigate();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUserClick = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Previous Button */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button */}
        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}

        {/* Media Section */}
        <div className="flex-1 bg-black relative min-h-0">
          <div className="absolute inset-0 flex items-center justify-center">
            {post.mediaType === 'video' ? (
              <video
                src={post.mediaUrl || post.media || post.imageUrl}
                controls
                className="max-w-full max-h-full object-contain"
                autoPlay
                loop
              />
            ) : (
              <img
                src={post.mediaUrl || post.media || post.imageUrl}
                alt={post.title}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <button onClick={handleUserClick} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200">
                <img
                  src={post.user?.pfp || post.author?.avatar}
                  alt={post.user?.fullName || post.author?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{post.user?.fullName || post.author?.name}</p>
                  <p className="text-sm text-gray-500">@{post.user?.username || post.author?.email?.split('@')[0]}</p>
                </div>
              </button>
              <button className="ml-auto p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{post.content || post.description}</p>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{post.views?.toLocaleString() || 0} views</span>
              </div>
            </div>

            {/* Comments Section (Placeholder) */}
            <div className="border-t border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Comments coming soon!</p>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <button className={`flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${post.isLiked ? 'text-red-500' : ''}`}>
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current text-red-500' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium text-gray-700">{post.likes}</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{post.comments || 0}</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Share className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              />
              <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 