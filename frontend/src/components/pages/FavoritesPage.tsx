import React, { useState, useEffect } from 'react';
import { Heart, AlertCircle, RefreshCw } from 'lucide-react';
import { PostGrid } from '../posts/PostGrid';
import { Post } from '../../types';
import { likeService } from '../../services/likeService';

interface FavoritesPageProps {
  onPostClick: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onTagClick?: (tag: string) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ 
  onPostClick, 
  onEditPost,
  onTagClick
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const fetchLikedPosts = async (cursor?: string, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      }
      
      const response = await likeService.getUserLikedPosts(cursor, 12);
      
      if (append) {
        setPosts(prevPosts => [...prevPosts, ...response.tweets]);
      } else {
        setPosts(response.tweets);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error: any) {
      console.error('Failed to fetch liked posts:', error);
      setError(error.response?.data?.message || 'Failed to load your liked posts. Please try again.');
      if (!append) {
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const handleLoadMore = () => {
    if (hasMore && nextCursor && !isLoading) {
      fetchLikedPosts(nextCursor, true);
    }
  };

  const handleRetry = () => {
    fetchLikedPosts();
  };

  if (error && !isLoading && posts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100/50 text-center">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unable to Load Favorites</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && !error && posts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100/50 text-center">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            You haven't liked any posts yet. Start exploring and like posts you love!
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <span>Explore Posts</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 border border-gray-100/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Your Favorites
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Posts you've liked and loved</p>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <p className="text-sm sm:text-base text-gray-600">
          <span className="font-semibold text-gray-900">{posts.length}</span> liked posts
        </p>
      </div>

      {/* Posts Grid */}
      <PostGrid 
        posts={posts} 
        onEditPost={onEditPost} 
        onPostClick={onPostClick}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        onTagClick={onTagClick}
      />
    </div>
  );
}; 