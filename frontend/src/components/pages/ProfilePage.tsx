import React, { useState } from 'react';
import { Edit, MapPin, Calendar, Users, Award, Eye, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PostGrid } from '../posts/PostGrid';
import { mockPosts } from '../../data/mockPosts';

interface ProfilePageProps {
  onEditPost: (post: any) => void;
  onPostClick: (post: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onEditPost, onPostClick }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  
  if (!user) {
    return <div>Loading...</div>;
  }

  // Filter posts by the current user (using username since that's what we have in Post type)
  const userPosts = mockPosts.filter(post => post.user.username === user.username);
  const likedPosts = mockPosts; // For now, show all posts as liked posts
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalViews = userPosts.length * 150; // Mock view count

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={user.pfp}
              alt={user.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.fullName}</h1>
                <p className="text-gray-600 text-lg">@{user.username}</p>
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Edit className="w-4 h-4" />
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              {user.bio || "Creative enthusiast sharing moments and inspirations. Always exploring new perspectives and connecting with amazing people around the world."}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalLikes}</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">2.4k</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-4 h-4" />
              <span>My Posts ({userPosts.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
              activeTab === 'liked'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Liked Posts</span>
            </div>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'posts' && (
            <PostGrid 
              posts={userPosts} 
              onEditPost={onEditPost} 
              onPostClick={onPostClick}
              onLoadMore={() => {}}
              hasMore={false}
              isLoading={false}
            />
          )}
          {activeTab === 'liked' && (
            <PostGrid 
              posts={likedPosts} 
              onEditPost={onEditPost} 
              onPostClick={onPostClick}
              onLoadMore={() => {}}
              hasMore={false}
              isLoading={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};