import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HomePage } from './HomePage';
import { PostDetailModal } from '../modals/PostDetailModal';
import { EditPostModal } from '../modals/EditPostModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { Post } from '../../types';
import { feedService } from '../../services/feedService';
import { tweetService } from '../../services/tweetService';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
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
  const location = useLocation();
  const isMobile = useIsMobile();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentPostIndex, setCurrentPostIndex] = useState<number>(-1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const selectedPostRef = useRef<Post | null>(null);


  const fetchPosts = async (tag?: string, sort?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedService.getFeedPosts(undefined, 20, tag || undefined, sort || undefined);
      setPosts(response.posts || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tagParam = searchParams.get('tag');
    const sortParam = searchParams.get('sort');
    setSelectedTag(tagParam);
    setSortBy(sortParam || 'recent');
  }, [location.search]);

  useEffect(() => {
    fetchPosts(selectedTag || undefined, sortBy);
  }, [selectedTag, sortBy]);

  // Update ref whenever selectedPost changes
  useEffect(() => {
    selectedPostRef.current = selectedPost;
  }, [selectedPost]);

  useEffect(() => {
    if (!isMobile) {
      if (postId) {
        // If we already have this post selected, keep it (prevents flicker)
        const currentSelected = selectedPostRef.current;
        if (currentSelected && (currentSelected._id === postId || currentSelected.id === postId)) {
          // Post already selected, just ensure index is correct if in posts list
          if (posts.length > 0) {
            const index = posts.findIndex(p => (p._id || p.id) === postId);
            if (index >= 0 && currentPostIndex !== index) {
              setCurrentPostIndex(index);
            }
          }
          return; // Don't do anything else, modal should stay open
        }
        
        // Wait for posts to load before trying to find the post
        if (posts.length > 0) {
          const post = posts.find(p => (p._id || p.id) === postId);
          
          if (post) {
            setSelectedPost(post);
            setCurrentPostIndex(posts.indexOf(post));
          } else {
            // Post not found in current list - try to fetch it directly
            const fetchPost = async () => {
              try {
                const response = await tweetService.getTweet(postId);
                if (response.data) {
                  setSelectedPost(response.data as unknown as Post);
                  setCurrentPostIndex(-1); // Not in the current posts list
                }
              } catch (error) {
                console.error('Failed to fetch post:', error);
                // Don't navigate away immediately - let user close manually
              }
            };
            fetchPost();
          }
        } else {
          // Posts are still loading, but we have a postId
          // Fetch the post directly so modal can open immediately
          const fetchPost = async () => {
            try {
              const response = await tweetService.getTweet(postId);
              if (response.data) {
                setSelectedPost(response.data as unknown as Post);
                setCurrentPostIndex(-1);
              }
            } catch (error) {
              console.error('Failed to fetch post:', error);
            }
          };
          fetchPost();
        }
      } else {
        // No postId - clear selection
        setSelectedPost(null);
        setCurrentPostIndex(-1);
      }
    } else {
      if (postId) {
        navigate(`/post/${postId}`, { replace: true });
      }
    }
  }, [postId, navigate, posts, isMobile, currentPostIndex]);

  const handlePostClick = (post: Post) => {
    const postId = post._id || post.id;
    
    if (postId) {
      if (isMobile) {
        navigate(`/post/${postId}`, { state: { post } });
      } else {
        // Set the post immediately before navigating to avoid flicker
        setSelectedPost(post);
        setCurrentPostIndex(posts.findIndex(p => (p._id || p.id) === postId));
        navigate(`/dashboard/post/${postId}`, { replace: false });
      }
    } 
  };

  const handleCloseModal = () => {
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
    setEditingPost(post);
  };

  const handleDeletePost = (postToDelete: Post) => {
    setDeletingPost(postToDelete);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;

    setIsSubmittingDelete(true);
    try {
      await tweetService.deleteTweet(deletingPost._id!);
      setDeletingPost(null);
      if (selectedPost?._id === deletingPost._id) {
        handleCloseModal();
      }
      fetchPosts(selectedTag || undefined, sortBy);
      toast.success('Post deleted successfully!');
    } catch (err) {
      console.error('Failed to delete post:', err);
      toast.error('Failed to delete post. Please try again.');
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handlePostUpdate = (updatedPost: Partial<Post>) => {
    const updatedPostComplete = { ...posts.find(p => p._id === updatedPost._id), ...updatedPost } as Post;
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        (post._id || post.id) === (updatedPost._id || updatedPost.id)
          ? { ...post, ...updatedPost }
          : post
      )
    );
    
    if (selectedPost && ((selectedPost._id || selectedPost.id) === (updatedPost._id || updatedPost.id))) {
      setSelectedPost({ ...selectedPost, ...updatedPost });
    }

    if (editingPost && editingPost._id === updatedPost._id) {
      setEditingPost(updatedPostComplete);
    }
  };

  const handleRetry = () => {
    fetchPosts(selectedTag || undefined, sortBy);
  };

  const handleTagClick = (tag: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tag', tag);
    navigate(`/dashboard?${searchParams.toString()}`, { replace: true });
  };

  const handleClearTag = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tag');
    const newSearch = searchParams.toString();
    navigate(`/dashboard${newSearch ? `?${newSearch}` : ''}`, { replace: true });
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
        onDeletePost={handleDeletePost}
        onTagClick={handleTagClick}
        selectedTag={selectedTag}
        onClearTag={handleClearTag}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />
      
      {/* Only show modal on desktop */}
      {!isMobile && selectedPost && postId && (
        <PostDetailModal
          key={postId} // Force remount when postId changes
          post={selectedPost}
          onClose={handleCloseModal}
          onPrevious={currentPostIndex > 0 ? handlePreviousPost : undefined}
          onNext={currentPostIndex < posts.length - 1 ? handleNextPost : undefined}
          hasPrevious={currentPostIndex > 0}
          hasNext={currentPostIndex < posts.length - 1}
          onPostUpdate={handlePostUpdate}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdate={(_updatedPost) => {
            setEditingPost(null);
            fetchPosts(selectedTag || undefined, sortBy);
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
    </>
  );
}; 