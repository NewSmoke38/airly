import axiosInstance from '../lib/axios';
import { FeedResponse } from '../types';

interface ApiResponse<T> {
  statusCode: number;
  data: T;
}

export const feedService = {
  async getFeedPosts(cursor?: string, batch: number = 20, tag?: string, sort?: string): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('batch', batch.toString());
    if (tag) params.append('tag', tag);
    if (sort) params.append('sort', sort);

    const response = await axiosInstance.get<ApiResponse<FeedResponse>>(`/feed?${params.toString()}`);
    return response.data.data;
  },
}; 