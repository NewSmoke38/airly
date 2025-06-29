import React, { useEffect, useState } from 'react';
import { X, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ArrowLeft, ArrowRight, Eye, Link, Flag, UserMinus, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { tweetService } from '../../services/tweetService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

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
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newComment, setNewComment] = useState('');

  const userHandle = post.user?.username || post.author?.email?.split('@')[0] || '';

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
    if (userHandle) {
      navigate(`/profile/${userHandle}`);
    }
  };

  const handleLike = async () => {
    const postId = post._id || post.id;
    if (!postId) {
      console.error('Post ID is missing');
      return;
    }
    try {
      const response = await tweetService.toggleLike(postId);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = async () => {
    const postId = post._id || post.id;
    if (!postId) {
      console.error('Post ID is missing');
      return;
    }
    try {
      const response = await tweetService.toggleBookmark(postId);
      setIsBookmarked(response.data.bookmarked);
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/dashboard/post/${post._id || post.id}`;
      await navigator.clipboard.writeText(url);
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
      setShowMenu(false);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/dashboard/post/${post._id || post.id}`;
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content || post.description,
          url: url,
        });
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(url);
        console.log('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleUnfollow = () => {
    // TODO: API call to unfollow user
    console.log('Unfollow user:', userHandle);
    setShowProfileMenu(false);
  };

  const handleBlock = () => {
    // TODO: API call to block user
    console.log('Block user:', userHandle);
    setShowProfileMenu(false);
  };

  const handleReport = () => {
    // TODO: Open report modal
    console.log('Report post:', post._id || post.id);
    setShowMenu(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const postId = post._id || post.id;
      if (!postId) {
        console.error('Post ID not found');
        return;
      }
      
      try {
        await tweetService.createComment(postId, newComment.trim());
        setNewComment('');
        // Optionally refresh comments or show success message
        console.log('Comment posted successfully!');
      } catch (error: any) {
        console.error('Failed to post comment:', error);
        // Optionally show error message to user
      }
    }
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
          
          {/* Views Counter Overlay */}
          {post.views && post.views > 0 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2 backdrop-blur-sm">
              <Eye className="w-4 h-4" />
              <span>{post.views.toLocaleString()} views</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="w-96 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 flex-1 relative">
                <button onClick={handleUserClick} className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200">
                  <img
                    src={post.user?.pfp || post.author?.avatar}
                    alt={post.user?.fullName || post.author?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{post.user?.fullName || post.author?.name}</p>
                    <p className="text-sm text-gray-500">@{userHandle}</p>
                  </div>
                </button>

                {/* Profile Menu */}
                {showProfileMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-48 py-1">
                    <button
                      onClick={handleUnfollow}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow @{userHandle}</span>
                    </button>
                    <button
                      onClick={handleBlock}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center space-x-2 text-red-600"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Block @{userHandle}</span>
                    </button>
                  </div>
                )}
              </div>
              
              {/* Three Dot Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-48 py-1">
                    <button
                      onClick={handleCopyLink}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                    >
                      <Link className="w-4 h-4" />
                      <span>Copy link</span>
                    </button>
                    <button
                      onClick={handleBookmark}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-600' : ''}`} />
                      <span>{isBookmarked ? 'Remove bookmark' : 'Bookmark'}</span>
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center space-x-2 text-red-600"
                    >
                      <Flag className="w-4 h-4" />
                      <span>Report post</span>
                    </button>
                  </div>
                )}
              </div>
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
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.views && post.views > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                  </>
                )}
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
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium text-gray-700">{likeCount.toLocaleString()}</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{post.comments || 0}</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleBookmark}
                  className={`p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isBookmarked ? 'text-amber-500' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-amber-500' : 'text-gray-600'}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Share className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                maxLength={280}
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showMenu || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowMenu(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </div>
  );
}; 