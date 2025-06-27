import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PostDetailPage } from './PostDetailPage';
import { mockPosts } from '../../data/mockPosts';

export const PostDetailPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the post from mock data (replace with actual API call later)
  const post = mockPosts.find(p => p._id === id);
  
  if (!post) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEditPost = (editedPost: any) => {
    console.log('Edit post:', editedPost);
  };

  return <PostDetailPage post={post} onEditPost={handleEditPost} />;
}; 