import React, { useEffect, useRef, useCallback, useState } from 'react';
import { PostCard } from './PostCard';
import { Post } from '../../types';

interface PostGridProps {
  posts: Post[];
  onEditPost: (post: Post) => void;
  onPostClick: (post: Post) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export const PostGrid: React.FC<PostGridProps> = ({
  posts,
  onEditPost,
  onPostClick,
  onLoadMore,
  hasMore,
  isLoading
}) => {
  const observer = useRef<IntersectionObserver>();
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
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

  // Load image dimensions for masonry layout
  useEffect(() => {
    posts.forEach(post => {
      const imageUrl = post.media || post.imageUrl || '';
      const postId = post.id || post._id || '';
      
      if (imageUrl && postId && !imageDimensions[postId]) {
        const img = new Image();
        img.onload = () => {
          setImageDimensions(prev => ({
            ...prev,
            [postId]: {
              width: img.width,
              height: img.height
            }
          }));
        };
        img.src = imageUrl;
      }
    });
  }, [posts, imageDimensions]);

  // Calculate grid row span based on image aspect ratio
  const getRowSpan = (post: Post) => {
    const postId = post.id || post._id || '';
    const dimensions = imageDimensions[postId];
    
    if (!dimensions) return 'span 12'; // Default span while loading
    
    const aspectRatio = dimensions.height / dimensions.width;
    
    // Calculate row span based on aspect ratio
    // Taller images get more rows
    if (aspectRatio > 1.5) return 'span 18'; // Very tall
    if (aspectRatio > 1.2) return 'span 15'; // Tall
    if (aspectRatio > 0.8) return 'span 12'; // Normal
    if (aspectRatio > 0.6) return 'span 10'; // Wide
    return 'span 8'; // Very wide
  };

  return (
    <div className="masonry-grid">
      {posts.map((post, index) => (
        <div
          key={post.id || post._id || index}
          ref={index === posts.length - 1 ? lastPostRef : undefined}
          className="masonry-item"
          style={{
            gridRowEnd: getRowSpan(post)
          }}
        >
          <PostCard
            post={post}
            onEdit={() => onEditPost(post)}
            onClick={() => onPostClick(post)}
            imageDimensions={imageDimensions[post.id || post._id || '']}
          />
        </div>
      ))}
      
      {isLoading && (
        <div className="col-span-full flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      )}
    </div>
  );
};