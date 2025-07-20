import React, { useState, useEffect } from 'react';
import { Edit, MapPin, Calendar, Award, Heart, MoreHorizontal, UserX, Flag } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RootState } from '../../store';
import { PostGrid } from '../posts/PostGrid';
import { userService } from '../../services/userService';
import { tweetService } from '../../services/tweetService';
import { Post } from '../../types';
import { EditPostModal } from '../modals/EditPostModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import EditProfileModal from '../modals/EditProfileModal';

interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  pfp: string;
  bio?: string;
  joinedDate: string;
  followerCount: number;
  followingCount: number;
  relationshipStatus: {
    isOwnProfile: boolean;
    isFollowing: boolean;
    isBlocked: boolean;
  };
}

export const ProfilePage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const profileUsername = username || currentUser?.username;

  useEffect(() => {
    if (profileUsername) {
      fetchProfile();
    }
  }, [profileUsername]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const profileData = await userService.getUserProfile(profileUsername!);
      setProfile(profileData);
      setIsFollowing(profileData.relationshipStatus.isFollowing);
      setIsBlocked(profileData.relationshipStatus.isBlocked);

      await fetchUserPosts();

      if (profileData.relationshipStatus.isOwnProfile) {
        await fetchLikedPosts();
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const postsData = await userService.getUserPosts(profileUsername!);
      setUserPosts(postsData.posts || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setUserPosts([]);
    }
  };
  
  const fetchLikedPosts = async () => {
    try {
      const likedData = await tweetService.getUserLikedTweets();
      setLikedPosts(likedData.data.tweets || []);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
      setLikedPosts([]);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleDeletePost = (post: Post) => {
    setDeletingPost(post);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;

    setIsSubmittingDelete(true);
    try {
      await tweetService.deleteTweet(deletingPost._id!);
      setDeletingPost(null);
      await fetchUserPosts();
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post. Please try again.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };
  
  const handlePostClick = (post: Post) => {
    navigate(`/dashboard/post/${post._id}`);
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      const response = await userService.toggleFollow(profile._id);
      setIsFollowing(response.isFollowing);
      toast.success(response.isFollowing ? `Followed @${profile.username}` : `Unfollowed @${profile.username}`);
      
      setProfile(prev => prev ? {
        ...prev,
        followerCount: response.isFollowing 
          ? prev.followerCount + 1 
          : prev.followerCount - 1
      } : null);
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Something went wrong.');
    }
  };

  const handleBlock = async () => {
    if (!profile) return;
    
    try {
      const response = await userService.toggleBlock(profile._id);
      setIsBlocked(response.isBlocked || false);
      toast.success(response.isBlocked ? `Blocked @${profile.username}` : `Unblocked @${profile.username}`);
      
      if (response.isBlocked) {
        setIsFollowing(false);
        setProfile(prev => prev ? {
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1)
        } : null);
      }
      
      setShowMenu(false);
    } catch (error) {
      console.error('Error toggling block:', error);
      toast.error('Something went wrong.');
    }
  };

  const handleReport = () => {
    setShowMenu(false);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/dashboard?tag=${encodeURIComponent(tag)}`);
  };

  const handleProfileUpdate = (updatedUser: Partial<UserProfile>) => {
    setProfile(prevProfile => {
      if (!prevProfile) return null;
      return {
        ...prevProfile,
        ...updatedUser,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="animate-pulse">
            <div className="flex items-start space-x-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The user you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { relationshipStatus: relStatus, followerCount, followingCount } = profile;
  const { isOwnProfile } = relStatus || {};

  const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

  const renderPosts = () => {
    return (
      <PostGrid
        posts={userPosts}
        onPostClick={handlePostClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={isLoading}
        className="masonry-grid-profile"
        onTagClick={handleTagClick}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    );
  };

  const renderLiked = () => {
    return (
      <PostGrid
        posts={likedPosts}
        onPostClick={handlePostClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoading={isLoading}
        className="masonry-grid-profile"
        onTagClick={handleTagClick}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <img
              src={profile.pfp}
              alt={profile.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.fullName}</h1>
                <p className="text-gray-600 text-lg">@{profile.username}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <button 
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <>
                    {!isBlocked && (
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-amber-500 hover:bg-amber-600 text-white'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                    
                    {/* Three Dot Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-600" />
                      </button>

                      {showMenu && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-48 py-1">
                          <button
                            onClick={handleBlock}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center space-x-2 text-red-600"
                          >
                            <UserX className="w-4 h-4" />
                            <span>{isBlocked ? 'Unblock' : 'Block'} @{profile.username}</span>
                          </button>
                          <button
                            onClick={handleReport}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors flex items-center space-x-2 text-red-600"
                          >
                            <Flag className="w-4 h-4" />
                            <span>Report @{profile.username}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              {profile.bio}
            </p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {profile.joinedDate}</span>
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
            <div className="text-2xl font-bold text-gray-900">{profile.followerCount}</div>
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
              <span>Posts ({userPosts.length})</span>
            </div>
          </button>
          {profile.relationshipStatus.isOwnProfile && (
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
          )}
        </div>
        
        <div className="p-6">
                     {activeTab === 'posts' && renderPosts()}
                     {activeTab === 'liked' && profile.relationshipStatus.isOwnProfile && renderLiked()}
        </div>
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdate={async () => {
            setEditingPost(null);
            await fetchUserPosts();
            toast.success('Post updated successfully!');
          }}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Post?"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
        isDeleting={isSubmittingDelete}
      />

      {profile && isOwnProfile && (
        <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            user={profile}
            onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};