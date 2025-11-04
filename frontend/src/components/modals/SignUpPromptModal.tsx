import React from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SignUpPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'like' | 'comment';
}

export const SignUpPromptModal: React.FC<SignUpPromptModalProps> = ({ isOpen, onClose, action }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleSignup = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div 
      data-signup-modal
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Sign Up Required</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          You need to sign up to {action === 'like' ? 'like' : 'comment on'} posts. 
          Join our community to engage with amazing content!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignup}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-600 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Account</span>
          </button>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};

