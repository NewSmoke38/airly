import React, { useState, useEffect } from 'react';
import { X, Camera, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService, UserProfileData } from '../../services/userService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
  onProfileUpdate: (updatedUser: UserProfileData) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio || '');
  const [pfp, setPfp] = useState<File | null>(null);
  const [previewPfp, setPreviewPfp] = useState<string | null>(user.pfp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFullName(user.fullName);
    setBio(user.bio || '');
    setPreviewPfp(user.pfp);
  }, [user]);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPfp(file);
      setPreviewPfp(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedProfile = await userService.updateUserProfile({
        fullName,
        bio,
        pfp: pfp || undefined,
      });
      onProfileUpdate(updatedProfile);
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={previewPfp || 'https://via.placeholder.com/96'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
              />
              <label
                htmlFor="pfp-upload"
                className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-full cursor-pointer hover:from-amber-500 hover:to-orange-600 transition-all shadow-md"
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  id="pfp-upload"
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handlePfpChange}
                />
              </label>
            </div>
            <div className="flex-1">
                <p className="text-2xl font-bold text-gray-800">{user.fullName}</p>
                <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Tell us about yourself..."
              maxLength={160}
            />
             <p className="text-xs text-right text-gray-400 mt-1">{bio.length} / 160</p>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 