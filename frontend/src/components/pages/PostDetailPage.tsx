import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { Post } from '../../types';
import { feedService } from '../../services/feedService';
import { tweetService } from '../../services/tweetService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SignUpPromptModal } from '../modals/SignUpPromptModal';

interface PostDetailPageProps {
  post: Post;
  onEditPost: (post: Post) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ post, onEditPost }) => {
  const navigate = useNavigate();
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        setIsLoadingRelated(true);
        const response = await feedService.getFeedPosts();
        
                         const allPosts = response.posts || [];
        const filtered = allPosts
          .filter(p => (p._id || p.id) !== (post._id || post.id))
          .filter(p => {
            const isSameUser = p.user?.username === post.user?.username;
            const hasSimilarTags = post.tags && p.tags && 
              post.tags.some(tag => p.tags!.includes(tag));
            return isSameUser || hasSimilarTags;
          })
          .slice(0, 4);
        
        if (filtered.length < 4) {
          const remainingCount = 4 - filtered.length;
          const randomPosts = allPosts
            .filter(p => (p._id || p.id) !== (post._id || post.id))
            .filter(p => !filtered.some(fp => (fp._id || fp.id) === (p._id || p.id)))
            .slice(0, remainingCount);
          filtered.push(...randomPosts);
        }
        
        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
        setRelatedPosts([]);
      } finally {
        setIsLoadingRelated(false);
      }
    };

         fetchRelatedPosts();
   }, [post._id, post.id, post.user?.username, post.tags]);

  const handleRelatedPostClick = (relatedPost: Post) => {
    const postId = relatedPost._id || relatedPost.id;
    if (postId) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        navigate(`/post/${postId}`, { state: { post: relatedPost } });
      } else {
        navigate(`/dashboard/post/${postId}`);
      }
    }
  };

  const handleRelatedPostLike = async (e: React.MouseEvent, relatedPost: Post) => {
    e.stopPropagation(); // Prevent navigation when clicking like
    
    if (!currentUser) {
      setShowSignUpPrompt(true);
      return;
    }
    
    const postId = relatedPost._id || relatedPost.id;
    if (!postId) return;

    try {
      const response = await tweetService.toggleLike(postId);
      
      setRelatedPosts(prev => prev.map(p => 
        (p._id || p.id) === postId 
          ? { ...p, isLiked: response.data.liked, likes: response.data.likeCount }
          : p
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Main Post Image */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden order-1 xl:order-1">
          <img
            src={post.media}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Post Details */}
        <div className="space-y-4 sm:space-y-6 order-2 xl:order-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
            <button
              onClick={() => onEditPost(post)}
              className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              aria-label="Edit post"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">{post.content}</p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Info */}
          {post.user && (
            <div className="flex items-center space-x-3 sm:space-x-4 p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
              <img
                src={post.user.pfp}
                alt={post.user.fullName}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{post.user.fullName}</h3>
                <p className="text-sm sm:text-base text-gray-500 truncate">@{post.user.username}</p>
                <p className="text-xs sm:text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Post Stats */}
          <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-gray-500 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">{post.likes} likes</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
                             <span className="text-sm sm:text-base font-medium">{post.comments || 0} comments</span>
            </div>
            {post.views && post.views > 0 && (
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm sm:text-base font-medium">{post.views.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <div className="mt-8 sm:mt-12 lg:mt-16">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8 text-gray-900">More like this</h2>
        
        {isLoadingRelated ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : relatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {relatedPosts.map(relatedPost => (
              <div 
                key={relatedPost._id || relatedPost.id} 
                className="relative rounded-xl overflow-hidden group cursor-pointer bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handleRelatedPostClick(relatedPost)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={relatedPost.media || relatedPost.imageUrl}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                {/* Overlay with post info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 leading-tight mb-2">
                      {relatedPost.title}
                    </h3>
                    
                    {/* Author info */}
                    {relatedPost.user && (
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={relatedPost.user.pfp}
                          alt={relatedPost.user.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-white text-xs font-medium">
                          {relatedPost.user.fullName}
                        </span>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={(e) => handleRelatedPostLike(e, relatedPost)}
                        className="flex items-center space-x-1 hover:scale-110 transition-transform"
                      >
                        <Heart 
                          className={`w-4 h-4 ${relatedPost.isLiked ? 'fill-current text-red-400' : 'text-red-400'}`} 
                        />
                        <span className="text-white text-sm">{relatedPost.likes || 0}</span>
                      </button>
                      
                                             <div className="flex items-center space-x-1">
                         <MessageCircle className="w-4 h-4 text-blue-400" />
                         <span className="text-white text-sm">{relatedPost.comments || 0}</span>
                       </div>
                      
                      {relatedPost.views && relatedPost.views > 0 && (
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-green-400" />
                          <span className="text-white text-sm">{relatedPost.views}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No related posts found.</p>
          </div>
        )}
      </div>
      
      <SignUpPromptModal
        isOpen={showSignUpPrompt}
        onClose={() => setShowSignUpPrompt(false)}
        action="like"
      />
    </div>
  );
}; 