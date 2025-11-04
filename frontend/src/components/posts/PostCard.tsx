import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Eye, Bookmark, UserMinus, UserX, Flag, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { tweetService } from '../../services/tweetService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SignUpPromptModal } from '../modals/SignUpPromptModal';

interface PostCardProps {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  onTagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onEdit, onDelete, onClick, onTagClick }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [signUpAction, setSignUpAction] = useState<'like' | 'comment'>('like');

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowProfileMenu(false);
      }
    };
    if (showMenu || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showProfileMenu]);

  const isOwner = currentUser && post.user && currentUser._id === post.user._id;

  const imageUrl = post.media || post.imageUrl || '';
  const title = post.title || '';
  const content = post.content || post.description || '';
  const userAvatar = post.user?.pfp || post.author?.avatar || '';
  const userName = post.user?.fullName || post.author?.name || '';
  const userHandle = post.user?.username || post.author?.email?.split('@')[0] || '';
  const views = post.views || 0;
  const comments = post.comments || 0;
  const postId = post._id || post.id;

  const handleCardClick = () => {
    if (showMenu || showProfileMenu) {
      setShowMenu(false);
      setShowProfileMenu(false);
    } else if (onClick) {
      onClick();
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser) {
      setSignUpAction('like');
      setShowSignUpPrompt(true);
      return;
    }

    if (!postId) {
      console.error('Post ID is missing');
      return;
    }
    try {
      const response = await tweetService.toggleLike(postId);
      setIsLiked(response.data.liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!postId) {
      console.error('Post ID is missing');
      return;
    }
    try {
      const response = await tweetService.toggleBookmark(postId);
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Could not update bookmark.');
    }
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch (error) {
      console.error('Failed to copy link: ', error);
      toast.error('Failed to copy link.');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (userHandle) {
      navigate(`/profile/${userHandle}`);
    }
  };

  const handleProfileMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleUnfollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(false);
  };

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(false);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
  };

  return (
    <div 
      ref={cardRef}
      className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-xl transition-all duration-300 cursor-pointer group h-fit relative ${showMenu || showProfileMenu ? 'z-20' : 'z-0'}`}
      onClick={handleCardClick}
    >
      {/* Post Image */}
      <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Views Counter Overlay */}
        {views > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-black/50 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs flex items-center space-x-1 backdrop-blur-sm">
            <Eye className="w-3 h-3" />
            <span>{views.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 relative">
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer hover:ring-amber-300 transition-all"
              onClick={handleProfileClick}
            />
            <div>
              <p className="font-medium text-gray-900 text-sm cursor-pointer hover:text-amber-600 transition-colors" onClick={handleProfileClick}>{userName}</p>
              <p className="text-xs text-gray-500 cursor-pointer hover:text-amber-600 transition-colors" onClick={handleProfileClick}>@{userHandle}</p>
            </div>
            
            {/* Three dot menu for profile actions */}
            <button
              onClick={handleProfileMenuClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 duration-200 ml-2"
            >
              <MoreVertical className="w-3 h-3 text-gray-500" />
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
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100 duration-200"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-48 py-1">
                <button
                  onClick={handleBookmark}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-amber-600' : ''}`} />
                  <span>{isBookmarked ? 'Remove bookmark' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={handleReport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                >
                  <Flag className="w-4 h-4" />
                  <span>Report post</span>
                </button>
                {isOwner && (
                  <>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEdit) onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit post</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete) onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center space-x-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete post</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {title && (
          <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">{title}</h3>
        )}
        
        {content && (
          <p className="text-gray-600 text-xs mb-3 line-clamp-3 leading-relaxed">{content}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((tag, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between text-gray-500">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors text-xs group ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1 hover:text-blue-500 transition-colors text-xs group"
            >
              <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>{comments}</span>
            </button>
            {views > 0 && (
              <div className="flex items-center space-x-1 text-xs">
                <Eye className="w-4 h-4" />
                <span>{views.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleBookmark}
              className={`hover:text-amber-500 transition-colors group ${isBookmarked ? 'text-amber-500' : ''}`}
            >
              <Bookmark className={`w-4 h-4 transition-transform group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShareClick}
              className="hover:text-green-500 transition-colors group"
            >
              <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>
      
      <SignUpPromptModal
        isOpen={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        action={signUpAction}
      />
    </div>
  );
};