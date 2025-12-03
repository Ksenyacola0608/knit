import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const AvatarUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите файл изображения');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Аватар успешно загружен');
      if (onUploadSuccess) {
        onUploadSuccess(response.data.avatar_url);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка загрузки аватара');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const avatarUrl = preview || (currentAvatar && `${process.env.REACT_APP_BACKEND_URL}${currentAvatar}`) || null;

  return (
    <div className="relative inline-block">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center relative group">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white text-4xl font-bold">
            {/* Placeholder */}
          </span>
        )}
        
        {/* Overlay */}
        <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
            <Camera size={32} className="text-white" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      
      <button
        type="button"
        onClick={() => document.querySelector('input[type="file"]').click()}
        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition shadow-lg"
        disabled={uploading}
      >
        <Upload size={16} />
      </button>
    </div>
  );
};

export default AvatarUpload;
