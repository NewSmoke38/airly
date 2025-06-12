import axios from 'axios';

const baseURL = 'http://localhost:8000/api/v1/';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // This is important for handling cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// add a request interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // handling specific error cases
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        window.location.href = '/login';
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