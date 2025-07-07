import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, AlertCircle, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { tweetService } from '../../services/tweetService';

interface ValidationErrors {
  title?: string;
  content?: string;
  media?: string;
  tags?: string;
}

export const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const [type, setType] = useState('image');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const MAX_CONTENT_LENGTH = 280;
  const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const popularTags = [
    'photography', 'art', 'nature', 'travel', 'food', 'lifestyle', 'fashion', 
    'technology', 'design', 'architecture', 'music', 'fitness', 'beauty', 
    'inspiration', 'creativity', 'minimalism', 'vintage', 'modern', 'abstract'
  ];

  const getTagSuggestions = () => {
    if (!tagInput.trim()) return popularTags.slice(0, 6);
    return popularTags.filter(tag => 
      tag.toLowerCase().includes(tagInput.toLowerCase()) && 
      !tags.includes(tag)
    ).slice(0, 6);
  };
  const validateTitle = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      return 'Title is required';
    }
    if (trimmedValue.length > 100) { 
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

  const validateTags = (tagArray: string[]): string | undefined => {
    if (tagArray.length > 10) {
      return 'Maximum 10 tags allowed';
    }
    return undefined;
  };

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

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    const error = validateTags(newTags);
    setValidationErrors(prev => ({ ...prev, tags: error }));
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      const newTags = [...tags, trimmedTag];
      handleTagsChange(newTags);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    handleTagsChange(newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    const mediaError = validateMedia(file);
    setValidationErrors(prev => ({ ...prev, media: mediaError }));
    
    if (file && !mediaError) {
      setMedia(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMedia(null);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const titleError = validateTitle(title);
    const contentError = validateContent(content);
    const mediaError = validateMedia(media);
    const tagsError = validateTags(tags);

    const errors: ValidationErrors = {};
    if (titleError) errors.title = titleError;
    if (contentError) errors.content = contentError;
    if (mediaError) errors.media = mediaError;
    if (tagsError) errors.tags = tagsError;

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsUploading(true);
    try {
      const uploadData = {
        title: title.trim(),
        content: content.trim(),
        media: media!,
        tags: tags
      };
      
      await tweetService.createTweet(uploadData);
      toast.success('Post created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
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

  const isFormValid = () => {
    return !Object.values(validationErrors).some(error => error) &&
           title.trim().length > 0 &&
           content.trim().length > 0 &&
           media !== null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Post</h2>
            <p className="text-gray-600">Share your creativity with the world</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${
                validationErrors.title
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
              placeholder="Give your post a catchy title..."
              maxLength={100}
            />
            <div className="mt-1 flex justify-between items-center">
              {validationErrors.title ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{validationErrors.title}</span>
                </div>
              ) : title.trim().length > 0 ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Title looks good</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Enter a descriptive title</span>
              )}
              <span className="text-xs text-gray-500">
                {title.length}/100
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none ${
                validationErrors.content
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
              placeholder="Tell us about your creation..."
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
                  <span className="text-sm">Description looks good</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">Describe your creation</span>
              )}
              <span className={`text-xs ${getCharacterCountColor(content.length, MAX_CONTENT_LENGTH)}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="tags-input" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <input
                type="text"
                id="tags-input"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  if (!showTagSuggestions) {
                    setShowTagSuggestions(true);
                  }
                }}
                onKeyDown={handleTagInputKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Type a tag and press Enter..."
              />
              {showTagSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-2">
                  <p className="text-xs text-gray-500 px-2 pb-1 font-medium">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {getTagSuggestions().map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-amber-100 hover:text-amber-800 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 border border-gray-200 rounded-xl min-h-[12rem] max-h-[12rem] overflow-y-auto">
              <div className="flex flex-wrap gap-3">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center space-x-2 bg-amber-500 text-white rounded-full pl-4 pr-3 py-1.5 text-sm font-semibold"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="bg-amber-600/50 hover:bg-amber-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center w-full self-center">Added tags will appear here</p>
                )}
              </div>
            </div>

            {validationErrors.tags && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.tags}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Maximum 10 tags.</p>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media <span className="text-red-500">*</span>
            </label>
            
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                />
                <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-lg text-xs">
                  {media && getFileSizeText(media.size)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMedia(null);
                    setPreviewUrl(null);
                    setValidationErrors(prev => ({ ...prev, media: 'Media file is required' }));
                  }}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                validationErrors.media
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  validationErrors.media 
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600'
                }`}>
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-gray-600 mb-2">
                  Choose an image file to upload
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  JPEG, PNG, GIF, WebP up to {MAX_MEDIA_SIZE / (1024 * 1024)}MB
                </p>
              </div>
            )}
            
            <input
              type="file"
              onChange={handleFileChange}
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 mt-3 ${
                validationErrors.media
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200'
              }`}
            />
            
            {validationErrors.media && (
              <div className="mt-2 flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{validationErrors.media}</span>
              </div>
            )}
            
            {media && !validationErrors.media && (
              <div className="mt-2 flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">
                  Selected: {media.name} ({getFileSizeText(media.size)})
                </span>
              </div>
            )}
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form Validation Summary */}
          {!isFormValid() && Object.keys(validationErrors).length === 0 && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Please fill in all required fields to continue</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !isFormValid()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Share Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 