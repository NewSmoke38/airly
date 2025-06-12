import { Post } from '../types';

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Mountain Landscape',
    description: 'Beautiful mountain vista at sunrise with dramatic lighting and ethereal mist',
    imageUrl: 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&dpr=2',
    authorId: '1',
    author: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['nature', 'mountains', 'sunrise', 'landscape'],
    createdAt: '2024-01-15T08:00:00Z',
    likes: 245,
    isLiked: false
  },
  {
    id: '2',
    title: 'Urban Architecture',
    description: 'Modern city skyline with glass buildings reflecting golden hour light',
    imageUrl: 'https://images.pexels.com/photos/374016/pexels-photo-374016.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=2',
    authorId: '2',
    author: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['architecture', 'city', 'urban', 'design'],
    createdAt: '2024-01-14T15:30:00Z',
    likes: 132,
    isLiked: true
  },
  {
    id: '3',
    title: 'Ocean Waves',
    description: 'Peaceful ocean waves at sunset with warm golden tones',
    imageUrl: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=500&h=800&dpr=2',
    authorId: '3',
    author: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['ocean', 'sunset', 'peaceful', 'seascape'],
    createdAt: '2024-01-13T18:45:00Z',
    likes: 367,
    isLiked: false
  },
  {
    id: '4',
    title: 'Forest Path',
    description: 'Mysterious forest path in autumn with dappled sunlight',
    imageUrl: 'https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=500&h=700&dpr=2',
    authorId: '1',
    author: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['forest', 'autumn', 'path', 'nature'],
    createdAt: '2024-01-12T10:20:00Z',
    likes: 189,
    isLiked: true
  },
  {
    id: '5',
    title: 'Desert Dunes',
    description: 'Golden sand dunes under blue sky with perfect curves and shadows',
    imageUrl: 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=500&h=650&dpr=2',
    authorId: '2',
    author: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['desert', 'sand', 'dunes', 'minimal'],
    createdAt: '2024-01-11T14:15:00Z',
    likes: 223,
    isLiked: false
  },
  {
    id: '6',
    title: 'City Night',
    description: 'Vibrant city lights at night with bokeh effects',
    imageUrl: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&dpr=2',
    authorId: '3',
    author: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['city', 'night', 'lights', 'urban'],
    createdAt: '2024-01-10T20:00:00Z',
    likes: 456,
    isLiked: true
  },
  {
    id: '7',
    title: 'Abstract Art',
    description: 'Colorful abstract painting with flowing forms and vibrant textures',
    imageUrl: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=2',
    authorId: '4',
    author: {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['abstract', 'art', 'painting', 'colorful'],
    createdAt: '2024-01-09T12:30:00Z',
    likes: 298,
    isLiked: false
  },
  {
    id: '8',
    title: 'Minimalist Interior',
    description: 'Clean, modern interior design with natural light and geometric elements',
    imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500&h=700&dpr=2',
    authorId: '5',
    author: {
      id: '5',
      name: 'David Chen',
      email: 'david@example.com',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['interior', 'design', 'minimal', 'modern'],
    createdAt: '2024-01-08T16:45:00Z',
    likes: 167,
    isLiked: true
  },
  {
    id: '9',
    title: 'Vintage Camera',
    description: 'Beautiful vintage film camera with leather details and brass accents',
    imageUrl: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=500&h=650&dpr=2',
    authorId: '4',
    author: {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['vintage', 'camera', 'photography', 'retro'],
    createdAt: '2024-01-07T11:20:00Z',
    likes: 334,
    isLiked: false
  },
  {
    id: '10',
    title: 'Botanical Study',
    description: 'Detailed macro photography of tropical leaves with intricate patterns',
    imageUrl: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=500&h=800&dpr=2',
    authorId: '6',
    author: {
      id: '6',
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['botanical', 'macro', 'nature', 'patterns'],
    createdAt: '2024-01-06T09:15:00Z',
    likes: 278,
    isLiked: true
  },
  {
    id: '11',
    title: 'Street Art Mural',
    description: 'Vibrant street art mural with bold colors and expressive characters',
    imageUrl: 'https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&dpr=2',
    authorId: '7',
    author: {
      id: '7',
      name: 'Alex Thompson',
      email: 'alex@example.com',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['street art', 'mural', 'urban', 'colorful'],
    createdAt: '2024-01-05T14:30:00Z',
    likes: 412,
    isLiked: false
  },
  {
    id: '12',
    title: 'Ceramic Pottery',
    description: 'Handcrafted ceramic bowls with earthy glazes and organic forms',
    imageUrl: 'https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=2',
    authorId: '8',
    author: {
      id: '8',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['pottery', 'ceramic', 'handmade', 'craft'],
    createdAt: '2024-01-04T13:45:00Z',
    likes: 156,
    isLiked: true
  },
  {
    id: '13',
    title: 'Fashion Portrait',
    description: 'Editorial fashion photography with dramatic lighting and bold styling',
    imageUrl: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&dpr=2',
    authorId: '9',
    author: {
      id: '9',
      name: 'James Park',
      email: 'james@example.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['fashion', 'portrait', 'editorial', 'style'],
    createdAt: '2024-01-03T17:20:00Z',
    likes: 523,
    isLiked: false
  },
  {
    id: '14',
    title: 'Geometric Patterns',
    description: 'Intricate geometric patterns in architecture with perfect symmetry',
    imageUrl: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=500&h=650&dpr=2',
    authorId: '5',
    author: {
      id: '5',
      name: 'David Chen',
      email: 'david@example.com',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['geometric', 'patterns', 'architecture', 'symmetry'],
    createdAt: '2024-01-02T10:30:00Z',
    likes: 289,
    isLiked: true
  },
  {
    id: '15',
    title: 'Coffee Art',
    description: 'Beautiful latte art with intricate leaf pattern in morning light',
    imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500&h=700&dpr=2',
    authorId: '6',
    author: {
      id: '6',
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['coffee', 'latte art', 'food', 'morning'],
    createdAt: '2024-01-01T08:15:00Z',
    likes: 198,
    isLiked: false
  },
  {
    id: '16',
    title: 'Digital Illustration',
    description: 'Futuristic digital artwork with neon colors and cyberpunk aesthetics',
    imageUrl: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=500&h=800&dpr=2',
    authorId: '10',
    author: {
      id: '10',
      name: 'Lisa Kim',
      email: 'lisa@example.com',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['digital art', 'illustration', 'cyberpunk', 'neon'],
    createdAt: '2023-12-31T19:45:00Z',
    likes: 445,
    isLiked: true
  },
  {
    id: '17',
    title: 'Textile Design',
    description: 'Handwoven textile with traditional patterns and natural dyes',
    imageUrl: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=2',
    authorId: '8',
    author: {
      id: '8',
      name: 'Maria Garcia',
      email: 'maria@example.com',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['textile', 'weaving', 'traditional', 'craft'],
    createdAt: '2023-12-30T15:20:00Z',
    likes: 167,
    isLiked: false
  },
  {
    id: '18',
    title: 'Sculpture Detail',
    description: 'Close-up detail of marble sculpture showing masterful craftsmanship',
    imageUrl: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&dpr=2',
    authorId: '11',
    author: {
      id: '11',
      name: 'Robert Taylor',
      email: 'robert@example.com',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2'
    },
    tags: ['sculpture', 'marble', 'art', 'detail'],
    createdAt: '2023-12-29T12:10:00Z',
    likes: 312,
    isLiked: true
  }
];