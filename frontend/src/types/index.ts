export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  username?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  authorId: string;
  author: User;
  tags: string[];
  createdAt: string;
  likes: number;
  isLiked: boolean;
  comments?: Comment[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor: string | null;
}