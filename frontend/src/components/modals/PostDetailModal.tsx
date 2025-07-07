import React, { useEffect, useState, useRef } from 'react';
import { X, Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ArrowLeft, ArrowRight, Eye, Link, Flag, UserMinus, UserX, Pencil, Trash2 } from 'lucide-react';
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
  onPostUpdate?: (updatedPost: Partial<Post>) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    pfp: string;
  };
  likes: number;
  likedBy: any[];
  replyCount: number;
  createdAt: string;
  edited?: boolean;
  editedAt?: string;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onPostUpdate,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const modalRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isOwner = currentUser && post.user && currentUser._id === post.user._id;

  const userHandle = post.user?.username || post.author?.name?.toLowerCase().replace(/\s+/g, '') || 'user';
  const postId = post._id || post.id;

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    if (!postId) return;
    
    try {
      setIsLoadingComments(true);
      
      const [commentsResponse, countResponse] = await Promise.all([
        tweetService.getComments(postId),
        tweetService.getCommentCount(postId)
      ]);
      
      setComments(commentsResponse.data.comments || []);
      const actualCommentCount = countResponse.data.count;
      setCommentCount(actualCommentCount);
      
      if (onPostUpdate && actualCommentCount !== post.comments) {
        onPostUpdate({
          ...post,
          comments: actualCommentCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

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
      
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          likes: response.data.likeCount,
          isLiked: response.data.liked
        });
      }
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
      
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          isBookmarked: response.data.bookmarked
        });
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/dashboard/post/${post._id || post.id}`;
      await navigator.clipboard.writeText(url);
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
        await navigator.clipboard.writeText(url);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleUnfollow = () => {
    setShowProfileMenu(false);
  };

  const handleBlock = () => {
    setShowProfileMenu(false);
  };

  const handleReport = () => {
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
        const response = await tweetService.createComment(postId, newComment.trim());
        setNewComment('');
        
        if (response.data) {
          setComments(prev => [response.data, ...prev]);
          try {
            const countResponse = await tweetService.getCommentCount(postId);
            const actualCommentCount = countResponse.data.count;
            setCommentCount(actualCommentCount);
            
            if (onPostUpdate) {
              onPostUpdate({
                ...post,
                comments: actualCommentCount
              });
            }
          } catch (countError) {
            console.error('Failed to fetch updated comment count:', countError);
            const newCommentCount = commentCount + 1;
            setCommentCount(newCommentCount);
            
            if (onPostUpdate) {
              onPostUpdate({
                ...post,
                comments: newCommentCount
              });
            }
          }
        }
        
      } catch (error: any) {
        console.error('Failed to post comment:', error);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

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
          
          {post.views && post.views > 0 && (
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-2 backdrop-blur-sm">
              <Eye className="w-4 h-4" />
              <span>{post.views.toLocaleString()} views</span>
            </div>
          )}
        </div>

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
              
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>

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
                    {isOwner && (
                      <>
                   <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            onEdit?.(post);
                            setShowMenu(false);
                          }}
className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2 text-gray-700"
                        >


                          <Pencil className="w-4 h-4" />
                          <span>Edit post</span>
                        </button>
                        <button
                         
                         
                         onClick={() => {
                            onDelete?.(post);
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
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{post.content || post.description}</p>
              
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

            <div className="border-t border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Comments ({commentCount})</h3>
              
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <img
                        src={comment.user.pfp}
                        alt={comment.user.fullName}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{comment.user.fullName}</span>
                            <span className="text-xs text-gray-500">@{comment.user.username}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs">
                          <button className="text-gray-500 hover:text-red-500 flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{comment.likes || 0}</span>
                          </button>
                          <button className="text-gray-500 hover:text-blue-500">
                            Reply
                          </button>
                          {comment.edited && (
                            <span className="text-gray-400 italic">edited</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>

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
                  <span className="text-sm font-medium text-gray-700">{commentCount}</span>
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