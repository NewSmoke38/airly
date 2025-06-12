import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './components/pages/HomePage';
import { ProfilePage } from './components/pages/ProfilePage';
import { PostDetailPage } from './components/pages/PostDetailPage';
import { UploadModal } from './components/modals/UploadModal';
import { Post } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <Login onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const handleEditPost = (post: Post) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log('Edit post:', post);
  };

  const handleUpload = (postData: any) => {
    // In a real app, this would send data to the backend
    console.log('Upload post:', postData);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    const newPath = `/post/${post.id}`;
    window.history.pushState({}, '', newPath);
    setCurrentPath(newPath);
  };

  const handlePageChange = (page: string) => {
    let newPath = '/';
    switch (page) {
      case 'home':
        newPath = '/';
        break;
      case 'profile':
        newPath = '/profile';
        break;
      case 'search':
        newPath = '/search';
        break;
      case 'favorites':
        newPath = '/favorites';
        break;
      case 'saved':
        newPath = '/saved';
        break;
      case 'settings':
        newPath = '/settings';
        break;
    }
    window.history.pushState({}, '', newPath);
    setCurrentPath(newPath);
  };

  const getCurrentPage = () => {
    if (currentPath.startsWith('/post/')) return 'post-detail';
    if (currentPath === '/profile') return 'profile';
    if (currentPath === '/search') return 'search';
    if (currentPath === '/favorites') return 'favorites';
    if (currentPath === '/saved') return 'saved';
    if (currentPath === '/settings') return 'settings';
    return 'home';
  };

  const renderPage = () => {
    if (currentPath.startsWith('/post/')) {
      return selectedPost ? (
        <PostDetailPage post={selectedPost} onEditPost={handleEditPost} />
      ) : (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
        </div>
      );
    }

    switch (currentPath) {
      case '/':
        return <HomePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
      case '/profile':
        return <ProfilePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
      case '/search':
        return <HomePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
      case '/favorites':
        return <HomePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
      case '/saved':
        return <HomePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
      case '/settings':
        return (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Settings page coming soon...</p>
          </div>
        );
      default:
        return <HomePage onEditPost={handleEditPost} onPostClick={handlePostClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />
      
      <main className="ml-16 p-6">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;