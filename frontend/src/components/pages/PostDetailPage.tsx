import React from 'react';
import { Post } from '../../types';
import { mockPosts } from '../../data/mockPosts';

interface PostDetailPageProps {
  post: Post;
  onEditPost: (post: Post) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ post, onEditPost }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Post Image */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={post.media}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Post Details */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <button
              onClick={() => onEditPost(post)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600">{post.content}</p>

          {/* Author Info */}
          <div className="flex items-center space-x-4">
            <img
              src={post.user.pfp}
              alt={post.user.fullName}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.user.fullName}</h3>
              <p className="text-sm text-gray-500">@{post.user.username}</p>
              <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Post Stats */}
          <div className="flex items-center space-x-6 text-gray-500">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>0 comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">More like this</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockPosts
            .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
            .slice(0, 4)
            .map(relatedPost => (
              <div key={relatedPost.id} className="relative rounded-xl overflow-hidden group">
                <img
                  src={relatedPost.imageUrl}
                  alt={relatedPost.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold line-clamp-2">{relatedPost.title}</h3>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}; 