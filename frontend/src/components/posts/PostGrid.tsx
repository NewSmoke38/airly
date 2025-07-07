import React, { useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { Post } from '../../types';

interface PostGridProps {
  posts: Post[];
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  onPostClick: (post: Post) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export const PostGrid: React.FC<PostGridProps> = ({
  posts,
  onEditPost,
  onDeletePost,
  onPostClick,
  onLoadMore,
  hasMore,
  isLoading,
  className = "masonry-grid",
  onTagClick
}) => {
  const observer = useRef<IntersectionObserver>();
  
  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, onLoadMore]);

  return (
    <div className={className}>
      {posts.map((post, index) => (
        <div
          key={post.id || post._id || index}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
          className="masonry-item"
        >
          <PostCard
            post={post}
            onEdit={onEditPost ? () => onEditPost(post) : undefined}
            onDelete={onDeletePost ? () => onDeletePost(post) : undefined}
            onClick={() => onPostClick(post)}
            onTagClick={onTagClick}
          />
        </div>
      ))}
      
      {isLoading && (
        <div className="w-full flex justify-center py-8" style={{ breakInside: 'avoid' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}
    </div>
  );
};