import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../features/auth/authSlice';
import { userService } from '../../services/userService';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isEmail = emailOrUsername.includes('@');
      const loginData = {
        [isEmail ? 'email' : 'username']: emailOrUsername,
        password
      };
      
      const response = await userService.login(loginData);
      
      dispatch(loginSuccess({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken
      }));
      
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        // Get user info from Google using the access token
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!googleResponse.ok) {
          const errorData = await googleResponse.json();
          console.error('Google userinfo error:', errorData);
          throw new Error(errorData.error?.message || 'Failed to fetch user info from Google');
        }

        const googleUserInfo = await googleResponse.json();
        console.log('Google user info:', googleUserInfo);

        // Send to backend for authentication
        const response = await userService.loginWithGoogle({
          email: googleUserInfo.email,
          fullName: googleUserInfo.name,
          picture: googleUserInfo.picture,
          googleId: googleUserInfo.sub,
        });

        dispatch(loginSuccess({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        }));

        toast.success('Logged in with Google successfully!');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Google login failed:', error);
        toast.error(error.response?.data?.message || error.message || 'Google login failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      toast.error('Google login failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-white font-bold text-2xl">Airly</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Continue your creative journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-white/60" />
            </div>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              placeholder="Email or username"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/60" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/70">Or continue with</span>
            </div>
          </div>

          <button
            onClick={() => handleGoogleLogin()}
            disabled={isLoading || isGoogleLoading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3.5 px-4 rounded-xl font-medium hover:bg-white/15 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:transform-none"
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <div className="w-5 h-5 flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.78 3.11v3.5h4.49c2.63-2.42 4.15-5.99 4.15-10.62z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.5-2.7c-1.08.72-2.45 1.16-4.43 1.16-3.57 0-6.58-2.41-7.66-5.64H2.18v2.78C4.1 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.75H2.18C1.43 8.48 1 10.22 1 12s.43 3.52 1.18 5.25l3.66-3.16z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c2.03 0 3.85.7 5.28 2.05l3.94-3.94C17.95 2.09 15.24 1 12 1 7.7 1 4.1 3.47 2.18 6.75l3.66 2.78c1.08-3.23 4.09-5.64 7.66-5.64z"
                    />
                  </svg>
                </div>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/70">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-amber-400 font-semibold hover:text-amber-300 focus:outline-none transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
