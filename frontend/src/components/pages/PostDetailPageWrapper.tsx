import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { PostDetailPage } from './PostDetailPage';
import { mockPosts } from '../../data/mockPosts';
import { tweetService } from '../../services/tweetService';
import { Post } from '../../types';

export const PostDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const initialPost = (location.state as any)?.post as Post | undefined;
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!id) {
      return;
    }
    if (post) {
      return;
    }

    const statePost = (location.state as any)?.post as Post | undefined;
    
    if (statePost) {
      setPost(statePost);
      return;
    }

    const mockPost = mockPosts.find(p => p._id === id || p.id === id);
    
    if (mockPost) {
      setPost(mockPost as unknown as Post);
      return;
    }

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await tweetService.getTweet(id);
        setPost(response.data as unknown as Post);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Post not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, post]); 

  const handleEditPost = (editedPost: Post) => {
    console.log('post', editedPost);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!post) {
    return <Navigate to="/dashboard" replace />;
  }

  return <PostDetailPage post={post} onEditPost={handleEditPost} />;
}; 