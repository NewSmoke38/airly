import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { initializeAuth } from './features/auth/authSlice';

// Auth Components
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

// Layout Components
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Page Components
import { DashboardPage } from './components/pages/DashboardPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { PostDetailPageWrapper } from './components/pages/PostDetailPageWrapper';
import { UploadPage } from './components/pages/UploadPage';
import { SearchPage } from './components/pages/SearchPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';

// Icons
import { TrendingUp, Heart, Bookmark, Users, Settings } from 'lucide-react';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : (
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Login />
              </div>
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            user ? <Navigate to="/dashboard" replace /> : (
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Signup />
              </div>
            )
          } 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/post/:postId" element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage onPostClick={() => {}} onEditPost={() => {}} />} />
          <Route path="profile/:username" element={<ProfilePage onPostClick={() => {}} onEditPost={() => {}} />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route 
            path="trending" 
            element={
              <PlaceholderPage 
                title="Trending"
                description="Discover what's hot right now"
                icon={TrendingUp}
                gradientColors="bg-gradient-to-r from-red-400 to-pink-500"
              />
            } 
          />
          <Route 
            path="favorites" 
            element={
              <PlaceholderPage 
                title="Favorites"
                description="Your liked posts and content"
                icon={Heart}
                gradientColors="bg-gradient-to-r from-pink-400 to-red-500"
              />
            } 
          />
          <Route 
            path="saved" 
            element={
              <PlaceholderPage 
                title="Collections"
                description="Your saved posts and bookmarks"
                icon={Bookmark}
                gradientColors="bg-gradient-to-r from-blue-400 to-purple-500"
              />
            } 
          />
          <Route 
            path="following" 
            element={
              <PlaceholderPage 
                title="Following"
                description="Posts from people you follow"
                icon={Users}
                gradientColors="bg-gradient-to-r from-green-400 to-blue-500"
              />
            } 
          />
          <Route 
            path="settings" 
            element={
              <PlaceholderPage 
                title="Settings"
                description="Manage your account and preferences"
                icon={Settings}
                gradientColors="bg-gradient-to-r from-gray-400 to-gray-600"
              />
            } 
          />
          <Route path="post/:id" element={<PostDetailPageWrapper />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;