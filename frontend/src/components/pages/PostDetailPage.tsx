import React from 'react';
import { Post } from '../../types';
import { mockPosts } from '../../data/mockPosts';

interface PostDetailPageProps {
  post: Post;  // post data to be displayed
  onEditPost: (post: Post) => void;  // callback for editing post
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ post, onEditPost }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>

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

          <p className="text-gray-600">{post.description}</p>

          <div className="flex items-center space-x-4">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-sm text-gray-500">{post.createdAt}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <div className="space-y-4">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{comment.author.name}</h4>
                      <span className="text-sm text-gray-500">{comment.createdAt}</span>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">More like this</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockPosts
            .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
            .slice(0, 4)
            .map(relatedPost => (
              // related post card with hover effect 
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