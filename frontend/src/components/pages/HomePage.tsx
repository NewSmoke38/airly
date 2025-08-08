import React, { useState } from 'react';
import { Search, Filter, TrendingUp, Clock, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { PostGrid } from '../posts/PostGrid';
import { Post } from '../../types';

interface HomePageProps {
  posts: Post[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (post: Post) => void;
  onPostClick: (post: Post) => void;
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
  onClearTag?: () => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  posts, 
  isLoading, 
  error, 
  onRetry, 
  onEditPost, 
  onDeletePost,
  onPostClick,
  onTagClick,
  selectedTag,
  onClearTag,
  sortBy,
  onSortByChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All', tag: null },
    { id: 'photography', label: 'Photography', tag: 'photography' },
    { id: 'digital art', label: 'Digital Art', tag: 'art' },
    { id: 'design', label: 'Design', tag: 'design' },
    { id: 'nature', label: 'Nature', tag: 'nature' },
    { id: 'architecture', label: 'Architecture', tag: 'architecture' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent', icon: Clock },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'liked', label: 'Most Liked', icon: Star },
  ];

  const filteredPosts = (posts || []).filter(post => {
    const title = post.title || '';
    const content = post.content || post.description || '';
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (error && !isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100/50 text-center">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Unable to Load Posts</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-medium hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!isLoading && !error && posts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100/50 text-center">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Posts Available</h2>
          <p className="text-sm sm:text-base text-gray-600">There are no posts to display at the moment. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-sm p-4 sm:p-6 border border-gray-100/50">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Discover Amazing Creations
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Explore the latest works from our creative community</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for inspiration, artists, or tags..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 bg-gray-50/50 backdrop-blur-sm transition-all duration-200 text-sm sm:text-base"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-4 xl:space-y-0">
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (category.tag) {
                      onTagClick?.(category.tag);
                    } else {
                      onClearTag?.();
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    (category.tag === selectedTag || (category.tag === null && !selectedTag))
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Sort by:</span>
            <div className="flex flex-wrap gap-1 sm:gap-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => onSortByChange(option.id)}
                    className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                      sortBy === option.id
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{option.label}</span>
                    <span className="sm:hidden">{option.label.split(' ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Tag Filter */}
      {selectedTag && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700 font-medium">Filtered by tag:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                #{selectedTag}
              </span>
            </div>
            {onClearTag && (
              <button
                onClick={onClearTag}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <p className="text-sm sm:text-base text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredPosts.length}</span> results
          {searchQuery && (
            <span className="hidden sm:inline"> for "<span className="font-semibold text-amber-600">{searchQuery}</span>"</span>
          )}
          {selectedTag && (
            <span className="hidden sm:inline"> with tag "<span className="font-semibold text-blue-600">#{selectedTag}</span>"</span>
          )}
        </p>
      </div>

      {/* Posts Grid */}
      <PostGrid 
        posts={filteredPosts} 
        onEditPost={onEditPost} 
        onDeletePost={onDeletePost}
        onPostClick={onPostClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={isLoading}
        onTagClick={onTagClick}
      />
    </div>
  );
};