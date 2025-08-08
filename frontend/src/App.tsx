import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { initializeAuth } from './features/auth/authSlice';
import { Toaster } from 'react-hot-toast';

import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

import { DashboardPage } from './components/pages/DashboardPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { PostDetailPageWrapper } from './components/pages/PostDetailPageWrapper';
import { UploadPage } from './components/pages/UploadPage';
import { SearchPage } from './components/pages/SearchPage';
import { PlaceholderPage } from './components/pages/PlaceholderPage';
import { AdminDashboard } from './components/pages/AdminDashboard';
import { FavoritesPageWrapper } from './components/pages/FavoritesPageWrapper';
import { CollectionsPageWrapper } from './components/pages/CollectionsPageWrapper';

import { TrendingUp, Heart, Bookmark, Users, Settings } from 'lucide-react';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
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
            <Route path="profile" element={<ProfilePage />} />
            <Route path="profile/:username" element={<ProfilePage />} />
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
            <Route path="favorites" element={<FavoritesPageWrapper />} />
            <Route path="favorites/post/:postId" element={<FavoritesPageWrapper />} />
            <Route path="saved" element={<CollectionsPageWrapper />} />
            <Route path="saved/post/:postId" element={<CollectionsPageWrapper />} />
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
            <Route path="admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="post/:id" element={<PostDetailPageWrapper />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;