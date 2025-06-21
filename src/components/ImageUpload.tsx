import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, fileToBase64 } from '../utils/fileUtils';

interface ImageUploadProps {
  onImageSelect: (file: File, base64: string, preview: string) => void;
  selectedImage: string | null;
  onImageRemove: () => void;
  teluguMode: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageSelect, 
  selectedImage, 
  onImageRemove,
  teluguMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    if (!validateImageFile(file)) {
      const errorMessage = teluguMode 
        ? 'దయచేసి చెల్లుబాటు అయ్యే చిత్ర ఫైల్‌ను ఎంచుకోండి (JPG, PNG) 10MB కంటే తక్కువ'
        : 'Please select a valid image file (JPG, PNG) under 10MB';
      setError(errorMessage);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const preview = URL.createObjectURL(file);
      onImageSelect(file, base64, preview);
    } catch (err) {
      const errorMessage = teluguMode 
        ? 'చిత్రాన్ని ప్రాసెస్ చేయడంలో విఫలమైంది'
        : 'Failed to process image';
      setError(errorMessage);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative inline-block">
        <img 
          src={selectedImage} 
          alt="Selected" 
          className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
        />
        <button
          onClick={onImageRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 font-medium">
          {teluguMode 
            ? 'చిత్రాన్ని డ్రాప్ చేయండి లేదా ఎంచుకోవడానికి క్లిక్ చేయండి'
            : 'Drop an image or click to select'
          }
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {teluguMode ? 'JPG, PNG 10MB వరకు' : 'JPG, PNG up to 10MB'}
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {error && (
        <p className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded-lg">{error}</p>
      )}
    </div>
  );
};