import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { HomePage } from './HomePage';
import { PostDetailModal } from '../modals/PostDetailModal';
import { Post } from '../../types';
import { feedService } from '../../services/feedService';

// Custom hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      console.log('📱 Screen width:', window.innerWidth, 'isMobile:', mobile);
      setIsMobile(mobile);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const isMobile = useIsMobile();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(-1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🎯 DashboardPage render - postId:', postId, 'isMobile:', isMobile);
  console.log('🎯 Posts loaded:', posts.length);

  // Fetch posts for dashboard
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedService.getFeedPosts();
      setPosts(response.posts || []);
      console.log('📊 DashboardPage fetched posts:', response.posts?.length || 0, 'posts');
      console.log('📊 Post IDs:', response.posts?.map(p => p._id || p.id) || []);
    } catch (error: any) {
      console.error('❌ API error fetching posts:', error);
      setError(error.response?.data?.message || 'Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Fetching posts on mount...');
    fetchPosts();
  }, []);

  // Handle post modal based on URL - only for desktop
  useEffect(() => {
    console.log('🔍 Post modal useEffect - isMobile:', isMobile, 'postId:', postId, 'posts.length:', posts.length);
    
    // Only show modal on desktop screens
    if (!isMobile) {
      console.log('💻 Desktop mode - handling modal');
      console.log('💻 DashboardPage useEffect - postId:', postId);
      console.log('💻 Available posts:', posts.map(p => p._id || p.id));
      
      if (postId && posts.length > 0) {
        const post = posts.find(p => (p._id || p.id) === postId);
        console.log('💻 Found post:', post);
        
        if (post) {
          setSelectedPost(post);
          setCurrentPostIndex(posts.indexOf(post));
          console.log('💻 Post set, currentPostIndex:', posts.indexOf(post));
        } else {
          console.log('💻 Post not found, redirecting to dashboard');
          // Post not found, redirect to dashboard
          navigate('/dashboard', { replace: true });
        }
      } else if (!postId) {
        console.log('💻 No postId, clearing selected post');
        setSelectedPost(null);
        setCurrentPostIndex(-1);
      }
    } else {
      console.log('📱 Mobile mode - checking for redirect');
      // On mobile, if there's a postId in dashboard route, redirect to dedicated post page
      if (postId) {
        console.log('📱 Mobile redirect to /post/' + postId);
        navigate(`/post/${postId}`, { replace: true });
      }
    }
  }, [postId, navigate, posts, isMobile]);

  const handlePostClick = (post: Post) => {
    console.log('🖱️ Post clicked:', post.id || post._id);
    console.log('🖱️ Full post object:', post);
    console.log('🖱️ Post _id:', post._id);
    console.log('🖱️ Post keys:', Object.keys(post));
    console.log('🖱️ isMobile:', isMobile);
    
    // Use _id for API posts, id for mock posts
    const postId = post._id || post.id;
    console.log('🖱️ Using postId:', postId);
    
    if (postId) {
      if (isMobile) {
        console.log('📱 Mobile navigation to /post/' + postId);
        console.log('📱 Passing post in state:', post.title);
        // On mobile, navigate to dedicated post page and pass post data in state
        navigate(`/post/${postId}`, { state: { post } });
      } else {
        console.log('💻 Desktop navigation to /dashboard/post/' + postId);
        // On desktop, show modal by updating URL
        navigate(`/dashboard/post/${postId}`, { replace: false });
      }
    } else {
      console.error('❌ No valid ID found for post:', post);
    }
  };

  const handleCloseModal = () => {
    // Navigate back to dashboard without the post ID
    navigate('/dashboard', { replace: false });
  };

  const handlePreviousPost = () => {
    if (currentPostIndex > 0) {
      const previousPost = posts[currentPostIndex - 1];
      const postId = previousPost._id || previousPost.id;
      navigate(`/dashboard/post/${postId}`, { replace: true });
    }
  };

  const handleNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      const nextPost = posts[currentPostIndex + 1];
      const postId = nextPost._id || nextPost.id;
      navigate(`/dashboard/post/${postId}`, { replace: true });
    }
  };

  const handleEditPost = (post: Post) => {
    console.log('Edit post:', post);
  };

  const handlePostUpdate = (updatedPost: Partial<Post>) => {
    // Update the specific post in the posts array
    setPosts(prevPosts => 
      prevPosts.map(post => 
        (post._id || post.id) === (updatedPost._id || updatedPost.id)
          ? { ...post, ...updatedPost }
          : post
      )
    );
    
    // Also update the selected post if it's the same post
    if (selectedPost && ((selectedPost._id || selectedPost.id) === (updatedPost._id || updatedPost.id))) {
      setSelectedPost({ ...selectedPost, ...updatedPost });
    }
  };

  const handleRetry = () => {
    fetchPosts();
  };

  return (
    <>
      <HomePage 
        posts={posts}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        onPostClick={handlePostClick} 
        onEditPost={handleEditPost} 
      />
      
      {/* Only show modal on desktop */}
      {!isMobile && selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={handleCloseModal}
          onPrevious={currentPostIndex > 0 ? handlePreviousPost : undefined}
          onNext={currentPostIndex < posts.length - 1 ? handleNextPost : undefined}
          hasPrevious={currentPostIndex > 0}
          hasNext={currentPostIndex < posts.length - 1}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </>
  );
}; 