export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  pfp: string;
  role: string;
  bio?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  media: string;
  likes: number;
  user: {
    username: string;
    fullName: string;
    pfp: string;
  };
  createdAt: string;
  edited: boolean;
  editedAt?: string;
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