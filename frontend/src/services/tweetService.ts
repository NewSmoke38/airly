import axios from '../lib/axios';

export interface CreateTweetData {
  title: string;
  content: string;
  media: File;
}

export const tweetService = {
  createTweet: async (data: CreateTweetData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('media', data.media);

    const response = await axios.post('http://localhost:8000/api/v1/tweets/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTweet: async (tweetId: string) => {
    const response = await axios.delete(`http://localhost:8000/api/v1/tweets/${tweetId}`);
    return response.data;
  },

  likeTweet: async (tweetId: string) => {
    const response = await axios.post(`http://localhost:8000/api/v1/tweets/${tweetId}/like`);
    return response.data;
  },

  editTweet: async (tweetId: string, data: Partial<CreateTweetData>) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.media) formData.append('media', data.media);

    const response = await axios.patch(`http://localhost:8000/api/v1/tweets/${tweetId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 