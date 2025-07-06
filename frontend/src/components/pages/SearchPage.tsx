import React, { useState, useEffect } from 'react';
import { Search, Hash, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tweetService } from '../../services/tweetService';
import { PostGrid } from '../posts/PostGrid';

interface SearchResult {
  tweets: any[];
  hasMore: boolean;
  nextCursor?: string;
  searchTags: string[];
}

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularTags();
  }, []);

  const loadPopularTags = async () => {
    try {
      const response = await tweetService.getPopularTags(20);
      setPopularTags(response.data.tags);
    } catch (error) {
      console.error('Failed to load popular tags:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tweetService.searchTweetsByTags(query);
      setSearchResults(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Search failed. Please try again.');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const handlePostTagClick = (tag: string) => {
    navigate(`/dashboard?tag=${encodeURIComponent(tag)}`);
  };

  const handlePostClick = (post: any) => {
    navigate(`/dashboard/post/${post._id}`);
  };

  const handleEditPost = (post: any) => {
    console.log('Edit post:', post);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-gray-600">Discover amazing content from our community</p>
      </div>

      {/* Search Form */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tags like 'art', 'photography', 'nature'..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
          />
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Popular Tags */}
      {!searchResults && popularTags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Popular Tags</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {popularTags.slice(0, 15).map((tagData, index) => (
              <button
                key={index}
                onClick={() => handleTagClick(tagData.tag)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors duration-200 border border-purple-200"
              >
                <Hash className="w-4 h-4" />
                <span className="font-medium">{tagData.tag}</span>
                <span className="text-sm text-purple-500">({tagData.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center mb-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results for "{searchResults.searchTags.join(', ')}"
            </h2>
            <span className="text-gray-500">
              {searchResults.tweets.length} posts found
            </span>
          </div>
          
          {searchResults.tweets.length > 0 ? (
            <PostGrid 
              posts={searchResults.tweets} 
              onEditPost={handleEditPost} 
              onPostClick={handlePostClick}
              onLoadMore={() => {}}
              hasMore={searchResults.hasMore}
              isLoading={false}
              onTagClick={handlePostTagClick}
            />
          ) : (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No posts found for "{searchResults.searchTags.join(', ')}"</p>
              <p className="text-gray-400 text-sm mt-2">Try searching for different tags</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!searchResults && !isLoading && (
        <div className="text-center text-gray-500 py-16">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg">Search for tags to discover content</p>
          <p className="text-sm mt-2">Try popular tags like "art", "photography", or "nature"</p>
        </div>
      )}
    </div>
  );
}; 