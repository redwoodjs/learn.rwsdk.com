"use client";
import { useState } from "react";
import { FileUpload } from "./FileUpload";

interface VideoInputProps {
  onVideoComplete: (url: string, videoType: 'UPLOADED' | 'YOUTUBE', metadata?: { duration?: number }) => void;
  onVideoError: (error: string) => void;
  onVideoStart?: () => void;
  className?: string;
  currentVideoUrl?: string;
  currentVideoType?: 'UPLOADED' | 'YOUTUBE';
}

export function VideoInput({ 
  onVideoComplete, 
  onVideoError, 
  onVideoStart,
  className = "",
  currentVideoUrl,
  currentVideoType
}: VideoInputProps) {
  const [inputType, setInputType] = useState<'upload' | 'youtube'>('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (url: string, metadata?: { duration?: number }) => {
    onVideoComplete(url, 'UPLOADED', metadata);
  };

  const handleYouTubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      onVideoError('Please enter a YouTube URL');
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = youtubeUrl.match(youtubeRegex);
    
    if (!match) {
      onVideoError('Please enter a valid YouTube URL');
      return;
    }

    const videoId = match[4];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    setIsProcessing(true);
    if (onVideoStart) {
      onVideoStart();
    }

    try {
      // For YouTube videos, we'll use the embed URL and set duration to 0
      // Duration can be fetched later if needed using YouTube API
      onVideoComplete(embedUrl, 'YOUTUBE', { duration: 0 });
    } catch (error) {
      onVideoError('Failed to process YouTube URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveVideo = () => {
    onVideoComplete('', 'UPLOADED');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">Video</label>
      
      {/* Show current video if exists */}
      {currentVideoUrl && currentVideoType && (
        <div className="relative mb-4">
          {currentVideoType === 'UPLOADED' ? (
            <video 
              src={`/download/${currentVideoUrl}`} 
              className="w-64 rounded-lg shadow-sm" 
              controls 
            />
          ) : (
            <iframe
              src={currentVideoUrl}
              className="w-64 h-36 rounded-lg shadow-sm"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
          <button
            type="button"
            onClick={handleRemoveVideo}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input type selector */}
      <div className="flex space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="upload"
            checked={inputType === 'upload'}
            onChange={(e) => setInputType(e.target.value as 'upload' | 'youtube')}
            className="mr-2"
          />
          Upload Video
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="youtube"
            checked={inputType === 'youtube'}
            onChange={(e) => setInputType(e.target.value as 'upload' | 'youtube')}
            className="mr-2"
          />
          YouTube Link
        </label>
      </div>

      {/* Upload input */}
      {inputType === 'upload' && (
        <FileUpload
          onUploadComplete={handleFileUpload}
          onUploadError={onVideoError}
          onUploadStart={onVideoStart}
          accept="video/*"
          maxSize={100 * 1024 * 1024} // 100MB for videos
        >
          <div className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors cursor-pointer">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="mt-1 text-sm text-gray-600">Upload video file</p>
              <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
            </div>
          </div>
        </FileUpload>
      )}

      {/* YouTube input */}
      {inputType === 'youtube' && (
        <div className="space-y-2">
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleYouTubeSubmit}
            disabled={isProcessing || !youtubeUrl.trim()}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Add YouTube Video'}
          </button>
          <p className="text-xs text-gray-500">
            Supported formats: youtube.com/watch?v=... or youtu.be/...
          </p>
        </div>
      )}
    </div>
  );
} 