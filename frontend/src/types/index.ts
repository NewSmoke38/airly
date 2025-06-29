export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  pfp: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  bio?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Post {
  id?: string;
  _id?: string;
  title: string;
  content?: string;
  description?: string;
  media?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  likes: number;
  comments?: number;
  views?: number;
  tags?: string[];
  user?: {
    username: string;
    fullName: string;
    pfp: string;
  };
  author?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  authorId?: string;
  createdAt: string;
  edited?: boolean;
  editedAt?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
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