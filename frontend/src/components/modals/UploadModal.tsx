import React, { useState, useRef } from 'react';
import { X, Upload, Image, Camera, Video, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { tweetService, CreateTweetData } from '../../services/tweetService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; content: string; media: File | null; type: string }) => void;
}

interface ValidationErrors {
  title?: string;
  content?: string;
  media?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  // Validation constants based on backend rules
  const MAX_CONTENT_LENGTH = 280;
  const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!isOpen) return null;

  // Validation functions
  const validateTitle = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return 'Title is required';
    }
    if (trimmedValue.length > 100) { // Reasonable title limit
      return 'Title must be 100 characters or less';
    }
    return undefined;
  };

  const validateContent = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return 'Content is required';
    }
    if (trimmedValue.length > MAX_CONTENT_LENGTH) {
      return `Content must be ${MAX_CONTENT_LENGTH} characters or less`;
    }
    return undefined;
  };

  const validateMedia = (file: File | null): string | undefined => {
    if (!file) {
      return 'Media file is required';
    }
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
    }
    
    if (file.size > MAX_MEDIA_SIZE) {
      return `File size must be ${MAX_MEDIA_SIZE / (1024 * 1024)}MB or less`;
    }
    
    return undefined;
  };

  // Real-time validation
  const handleTitleChange = (value: string) => {
    setTitle(value);
    const error = validateTitle(value);
    setValidationErrors(prev => ({ ...prev, title: error }));
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const error = validateContent(value);
    setValidationErrors(prev => ({ ...prev, content: error }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const mediaError = validateMedia(file);
    setValidationErrors(prev => ({ ...prev, media: mediaError }));
    
    if (!mediaError) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setSelectedImage(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const titleError = validateTitle(title);
    const contentError = validateContent(content);
    const mediaError = validateMedia(selectedFile);

    const errors: ValidationErrors = {};
    if (titleError) errors.title = titleError;
    if (contentError) errors.content = contentError;
    if (mediaError) errors.media = mediaError;

    setValidationErrors(errors);

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const tweetData: CreateTweetData = {
        title: title.trim(),
        content: content.trim(),
        media: selectedFile!,
      };

      const response = await tweetService.createTweet(tweetData);
      onUpload(response.data);
      
      // Reset form
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setSelectedImage(null);
      setValidationErrors({});
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tweet');
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterCountColor = (count: number, max: number) => {
    const percentage = count / max;
    if (percentage >= 1) return 'text-red-500';
    if (percentage >= 0.8) return 'text-orange-500';
    return 'text-gray-500';
  };

  const getFileSizeText = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Tweet</h2>
              <p className="text-sm text-gray-500">Share your thoughts with the world</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload Image <span className="text-red-500">*</span>
            </label>
            
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                  {selectedFile && getFileSizeText(selectedFile.size)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedFile(null);
                    setValidationErrors(prev => ({ ...prev, media: 'Media file is required' }));
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-amber-400 bg-amber-50'
                    : validationErrors.media
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  validationErrors.media 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600'
                }`}>
                  <Image className="w-8 h-8" />
                </div>
                <p className="text-gray-600 mb-2">
                  Drag and drop an image here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-amber-600 hover:text-amber-700 font-medium underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, GIF, WebP up to {MAX_MEDIA_SIZE / (1024 * 1024)}MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
            
            {validationErrors.media && (
              <div className="mt-2 flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{validationErrors.media}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 ${
                validationErrors.title
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="Give your tweet a title"
              maxLength={100}
            />
            <div className="mt-1 flex justify-between items-center">
              {validationErrors.title ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{validationErrors.title}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Title looks good</span>
                </div>
              )}
              <span className="text-xs text-gray-500">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 resize-none transition-all duration-200 ${
                validationErrors.content
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="What's on your mind?"
              maxLength={MAX_CONTENT_LENGTH}
            />
            <div className="mt-1 flex justify-between items-center">
              {validationErrors.content ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{validationErrors.content}</span>
                </div>
              ) : content.trim().length > 0 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Content looks good</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Share your thoughts</span>
              )}
              <span className={`text-xs ${getCharacterCountColor(content.length, MAX_CONTENT_LENGTH)}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key as keyof ValidationErrors])}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all transform hover:scale-105 flex items-center space-x-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Upload className="w-4 h-4" />
              <span>{isLoading ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};