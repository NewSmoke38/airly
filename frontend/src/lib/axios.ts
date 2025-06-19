import axios from 'axios';

const baseURL = 'http://localhost:8000/api/v1/';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // This is important for handling cookies
  // Removed default Content-Type to allow individual requests to set their own
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default Content-Type to application/json only if not already set
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // handling specific error cases
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
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