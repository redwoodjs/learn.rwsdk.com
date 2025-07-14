"use client";
import { useState } from "react";

interface FileUploadProps {
  onUploadComplete: (url: string, metadata?: { duration?: number }) => void;
  onUploadError: (error: string) => void;
  onUploadStart?: () => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  children?: React.ReactNode;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Helper function to extract video duration from a URL
export const extractVideoDurationFromUrl = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    console.log('Starting duration extraction from URL:', url);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      console.error('Duration extraction from URL timed out');
      reject(new Error('Duration extraction timed out'));
    }, 15000);
    
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded from URL, duration:', video.duration, 'seconds');
      clearTimeout(timeout);
      
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        resolve(Math.round(video.duration));
      } else {
        reject(new Error('Invalid video duration'));
      }
    };
    
    video.onerror = (e) => {
      console.error('Video metadata loading error from URL:', e);
      console.error('Video error details:', video.error);
      clearTimeout(timeout);
      reject(new Error(`Failed to load video metadata: ${video.error?.message || 'Unknown error'}`));
    };
    
    video.src = url;
    video.load();
  });
};

// Helper function to extract video duration
const extractVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    console.log('Starting duration extraction for:', file.name, 'Type:', file.type);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true; // Mute to avoid autoplay issues
    video.crossOrigin = 'anonymous'; // Handle CORS issues
    
    const timeout = setTimeout(() => {
      console.error('Duration extraction timed out');
      window.URL.revokeObjectURL(video.src);
      reject(new Error('Duration extraction timed out'));
    }, 15000); // 15 second timeout
    
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration, 'seconds');
      clearTimeout(timeout);
      window.URL.revokeObjectURL(video.src);
      
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        resolve(Math.round(video.duration));
      } else {
        reject(new Error('Invalid video duration'));
      }
    };
    
    video.onerror = (e) => {
      console.error('Video metadata loading error:', e);
      console.error('Video error details:', video.error);
      clearTimeout(timeout);
      window.URL.revokeObjectURL(video.src);
      reject(new Error(`Failed to load video metadata: ${video.error?.message || 'Unknown error'}`));
    };
    
    video.oncanplay = () => {
      console.log('Video can play, duration:', video.duration);
    };
    
    video.onloadeddata = () => {
      console.log('Video data loaded, duration:', video.duration);
    };
    
    const objectUrl = URL.createObjectURL(file);
    console.log('Created object URL:', objectUrl);
    video.src = objectUrl;
    
    // Force load the metadata
    video.load();
  });
};

export function FileUpload({ 
  onUploadComplete, 
  onUploadError, 
  onUploadStart,
  accept = "*/*",
  maxSize,
  className = "",
  children 
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    
    // Validate file size
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    // Notify parent component that upload is starting
    if (onUploadStart) {
      onUploadStart();
    }

    let metadata: { duration?: number } = {};

    // Extract video duration if it's a video file
    if (file.type.startsWith('video/')) {
      console.log('Extracting duration for video file:', file.name);
      try {
        const duration = await extractVideoDuration(file);
        console.log('Extracted duration:', duration, 'seconds');
        metadata.duration = duration;
      } catch (err) {
        console.warn('Failed to extract video duration:', err);
        // Continue with upload even if duration extraction fails
      }
    } else {
      console.log('Not a video file, skipping duration extraction');
    }

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata to form data if available
    if (metadata.duration) {
      formData.append('duration', metadata.duration.toString());
    }

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        setProgress({
          loaded: event.loaded,
          total: event.total,
          percentage
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      setIsUploading(false);
      setProgress(null);
      
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Upload response:', response);
          if (response.url) {
            console.log('Calling onUploadComplete with:', { url: response.url, metadata });
            onUploadComplete(response.url, metadata);
          } else {
            setError('No URL returned from upload');
            onUploadError('No URL returned from upload');
          }
        } catch (err) {
          setError('Failed to parse upload response');
          onUploadError('Failed to parse upload response');
        }
      } else {
        setError(`Upload failed with status: ${xhr.status}`);
        onUploadError(`Upload failed with status: ${xhr.status}`);
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setProgress(null);
      setError('Upload failed due to network error');
      onUploadError('Upload failed due to network error');
    });

    // Handle timeout
    xhr.addEventListener('timeout', () => {
      setIsUploading(false);
      setProgress(null);
      setError('Upload timed out');
      onUploadError('Upload timed out');
    });

    xhr.open('POST', '/upload/');
    xhr.send(formData);
  };

  return (
    <div className={className}>
      {children ? (
        <div 
          className={`relative ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
          onClick={() => {
            if (!isUploading) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = accept;
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  handleFileSelect(file);
                }
              };
              input.click();
            }
          }}
        >
          {children}
        </div>
      ) : (
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input
                  type="file"
                  accept={accept}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                  className="sr-only"
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Any file type</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(progress.loaded / 1024)}KB / {Math.round(progress.total / 1024)}KB
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
} 