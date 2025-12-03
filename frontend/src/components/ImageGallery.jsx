import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images, altPrefix = "Фото" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeGallery();
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden rounded-lg cursor-pointer"
          onClick={() => openGallery(0)}
        >
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL}${images[0]}`}
            alt={`${altPrefix} 1`}
            className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Additional Images Gallery */}
        {images.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Все фото ({images.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((image, idx) => (
                <div 
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                  onClick={() => openGallery(idx)}
                >
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${image}`}
                    alt={`${altPrefix} ${idx + 1}`}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      🔍 Открыть
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeGallery}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
          >
            <X size={28} />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
            <span className="font-semibold">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Main Image */}
          <div 
            className="max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={`${process.env.REACT_APP_BACKEND_URL}${images[currentIndex]}`}
              alt={`${altPrefix} ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-3 transition z-10"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 p-2 rounded-full">
              {images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    idx === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={`${process.env.REACT_APP_BACKEND_URL}${image}`}
                    alt={`Миниатюра ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
