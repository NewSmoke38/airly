import React from 'react';
import { PostCard } from './PostCard';
import { Post } from '../../types';

interface PostGridProps {
  posts: Post[];  
  onEditPost?: (post: Post) => void;  
  onPostClick: (post: Post) => void;  
}

export const PostGrid: React.FC<PostGridProps> = ({ posts, onEditPost, onPostClick }) => {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="break-inside-avoid">
          <PostCard 
            post={post} 
            onEdit={onEditPost} 
            onClick={() => onPostClick(post)} 
          />
        </div>
      ))}
    </div>
  );
};