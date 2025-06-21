import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Calendar, Users, Award, Eye, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PostGrid } from '../posts/PostGrid';
import { feedService } from '../../services/feedService';
import { Post } from '../../types';

interface ProfilePageProps {
  onEditPost: (post: Post) => void;  
  onPostClick: (post: Post) => void; 
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onEditPost, onPostClick }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('ProfilePage: Fetching posts...');
      setLoading(true);
      setError(null);
      const fetchedPosts = await feedService.getFeed();
      console.log('ProfilePage: Received posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('ProfilePage: Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // filter posts for current user
  const userPosts = posts.filter(post => post.authorId === user?.id);
  const likedPosts = posts.filter(post => post.isLiked);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalViews = userPosts.length * 1250;

  const tabs = [
    { id: 'posts', label: 'My Posts', count: userPosts.length },
    { id: 'liked', label: 'Liked', count: likedPosts.length },
    { id: 'collections', label: 'Collections', count: 3 },
  ];

  const stats = [
    { label: 'Posts', value: userPosts.length, icon: Award },
    { label: 'Followers', value: '1.2k', icon: Users },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: Heart },
    { label: 'Total Views', value: `${(totalViews / 1000).toFixed(1)}k`, icon: Eye },
  ];

  // function to render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading posts...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Posts</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPosts}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'posts':
        // render user posts or empty state
        return userPosts.length > 0 ? (
          <PostGrid posts={userPosts} onEditPost={onEditPost} onPostClick={onPostClick} />
        ) : (
          // empty state for no posts
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Start sharing your creativity with the world!</p>
            <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all transform hover:scale-105 font-medium">
              Create Your First Post
            </button>
          </div>
        );
      case 'liked':
        // render liked posts
        return <PostGrid posts={likedPosts} onEditPost={onEditPost} onPostClick={onPostClick} />;
      case 'collections':
        // render collections placeholder
        return (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collections coming soon</h3>
            <p className="text-gray-600">Organize your favorite posts into collections</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* profile header section with glassmorphism effect */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm overflow-hidden border border-gray-100/50">
        {/* cover photo with gradient background */}
        <div className="h-48 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20"></div>
        </div>
        
        <div className="px-6 pb-6">
          <div className="relative">
            <div className="absolute -top-16 left-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover ring-4 ring-amber-100"
              />
            </div>

            {/* profile content section */}
            <div className="pt-20 lg:pt-0 lg:pl-40">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-gray-600 mt-1 text-lg">{user?.bio}</p>
                </div>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2 font-medium">
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 text-center">
                      <Icon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined January 2024</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>Creative Professional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100/50">
        <div className="border-b border-gray-100">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};