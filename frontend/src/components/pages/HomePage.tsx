import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Clock, Star } from 'lucide-react';
import { PostGrid } from '../posts/PostGrid';
import { Post } from '../../types';

interface HomePageProps {
  posts: Post[];
  isLoading: boolean;
  onEditPost: (post: Post) => void;
  onPostClick: (post: Post) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ posts, isLoading, onEditPost, onPostClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const categories = [
    { id: 'all', label: 'All', count: posts?.length || 0 },
    { id: 'photography', label: 'Photography', count: 8 },
    { id: 'digital art', label: 'Digital Art', count: 5 },
    { id: 'design', label: 'Design', count: 6 },
    { id: 'nature', label: 'Nature', count: 7 },
    { id: 'architecture', label: 'Architecture', count: 4 },
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
    
    const matchesCategory = selectedCategory === 'all' || 
                           title.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes || 0) - (a.likes || 0);
      case 'liked':
        return (b.likes || 0) - (a.likes || 0);
      default:
        // For API posts, use createdAt
        const aDate = new Date(a.createdAt || 0).getTime();
        const bDate = new Date(b.createdAt || 0).getTime();
        return bDate - aDate;
    }
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm p-6 border border-gray-100/50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Discover Amazing Creations
          </h1>
          <p className="text-gray-600">Explore the latest works from our creative community</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for inspiration, artists, or tags..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 bg-gray-50/50 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                  <span className="ml-1 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <div className="flex space-x-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      sortBy === option.id
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredPosts.length}</span> results
          {searchQuery && (
            <span> for "<span className="font-semibold text-amber-600">{searchQuery}</span>"</span>
          )}
        </p>
      </div>

      {/* Posts Grid */}
      <PostGrid 
        posts={filteredPosts} 
        onEditPost={onEditPost} 
        onPostClick={onPostClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={isLoading}
      />
    </div>
  );
};