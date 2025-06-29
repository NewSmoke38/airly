import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { HomePage } from './HomePage';
import { PostDetailModal } from '../modals/PostDetailModal';
import { Post } from '../../types';
import { feedService } from '../../services/feedService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(-1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts for dashboard
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedService.getFeedPosts();
      setPosts(response.posts || []);
      console.log('DashboardPage fetched posts:', response.posts?.length || 0, 'posts');
      console.log('Post IDs:', response.posts?.map(p => p._id || p.id) || []);
    } catch (error: any) {
      console.error('API error fetching posts:', error);
      setError(error.response?.data?.message || 'Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle post modal based on URL
  useEffect(() => {
    console.log('DashboardPage useEffect - postId:', postId);
    console.log('Available posts:', posts.map(p => p._id || p.id));
    
    if (postId && posts.length > 0) {
      const post = posts.find(p => (p._id || p.id) === postId);
      console.log('Found post:', post);
      
      if (post) {
        setSelectedPost(post);
        setCurrentPostIndex(posts.indexOf(post));
        console.log('Post set, currentPostIndex:', posts.indexOf(post));
      } else {
        console.log('Post not found, redirecting to dashboard');
        // Post not found, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } else if (!postId) {
      console.log('No postId, clearing selected post');
      setSelectedPost(null);
      setCurrentPostIndex(-1);
    }
  }, [postId, navigate, posts]);

  const handlePostClick = (post: Post) => {
    console.log('Post clicked:', post.id || post._id);
    console.log('Full post object:', post);
    console.log('Post _id:', post._id);
    console.log('Post keys:', Object.keys(post));
    
    // Use _id for API posts, id for mock posts
    const postId = post._id || post.id;
    console.log('Using postId:', postId);
    
    if (postId) {
      // Update URL to include post ID
      navigate(`/dashboard/post/${postId}`, { replace: false });
    } else {
      console.error('No valid ID found for post:', post);
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
      
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={handleCloseModal}
          onPrevious={currentPostIndex > 0 ? handlePreviousPost : undefined}
          onNext={currentPostIndex < posts.length - 1 ? handleNextPost : undefined}
          hasPrevious={currentPostIndex > 0}
          hasNext={currentPostIndex < posts.length - 1}
        />
      )}
    </>
  );
}; 