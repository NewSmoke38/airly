import axios from 'axios';

let Prod = false;

const ProdBaseURL = 'https://vibely-3q1i.onrender.com/api/v1';
const LocalBaseURL = 'http://localhost:8000/api/v1';

const baseURL = Prod ? ProdBaseURL : LocalBaseURL;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const { accessToken } = JSON.parse(authData);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.error('Error reading auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      // Don't redirect to login for GET requests to comment endpoints (public endpoints)
      const isCommentGetRequest = error.config?.url?.includes('/comments') && error.config?.method === 'get';
      
      if (error.response.status === 401 && !isCommentGetRequest) {
        localStorage.removeItem('auth');
        // Only redirect if user was trying to access a protected route
        const authData = localStorage.getItem('auth');
        if (authData) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 