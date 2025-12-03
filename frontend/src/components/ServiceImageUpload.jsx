import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const ServiceImageUpload = ({ serviceId, currentImages = [], onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate files
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: не является изображением`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: размер превышает 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return;

    // Check total images limit
    if (currentImages.length + validFiles.length > 10) {
      toast.error('Максимум 10 изображений на услугу');
      return;
    }

    // Show previews
    const newPreviews = await Promise.all(
      validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setPreviews([...previews, ...newPreviews]);

    // Upload
    await uploadImages(validFiles);
  };

  const uploadImages = async (files) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post(`/upload/service/${serviceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`${files.length} изображений загружено`);
      if (onImagesChange) {
        onImagesChange([...currentImages, ...response.data.image_urls]);
      }
      setPreviews([]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка загрузки изображений');
      setPreviews([]);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      await api.delete(`/upload/service/${serviceId}/image`, {
        params: { image_url: imageUrl }
      });
      
      toast.success('Изображение удалено');
      if (onImagesChange) {
        onImagesChange(currentImages.filter(img => img !== imageUrl));
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка удаления изображения');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
        <label className="cursor-pointer">
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Загрузка...</p>
              </>
            ) : (
              <>
                <Upload size={48} className="text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Нажмите для выбора изображений
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF до 5MB (макс. 10 изображений)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || currentImages.length >= 10}
          />
        </label>
      </div>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Загруженные изображения ({currentImages.length}/10)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentImages.map((imageUrl, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${imageUrl}`}
                  alt={`Service ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(imageUrl)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Images (while uploading) */}
      {previews.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Загрузка...</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceImageUpload;
