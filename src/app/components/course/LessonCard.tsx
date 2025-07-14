"use client";

import React, { useState } from "react";
import { Lesson } from "@/app/types/course";
import { VideoInput } from "@/app/components/VideoInput";

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onChange: (updatedLesson: Lesson) => void;
  onDelete: () => void;
}

export function LessonCard({ lesson, index, onChange, onDelete }: LessonCardProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isExtractingDuration, setIsExtractingDuration] = useState<boolean>(false);
  const toggleExpanded = () => setExpanded((prev) => !prev);

  const handleFieldChange = (field: keyof Lesson, value: string | number) => {
    onChange({ ...lesson, [field]: value });
  };

  const handleVideoComplete = (url: string, videoType: 'UPLOADED' | 'YOUTUBE', metadata?: { duration?: number }) => {
    console.log('Video input completed:', { url, videoType, metadata });
    
    const updatedLesson = { 
      ...lesson, 
      videoUrl: url,
      videoType: videoType
    };
    
    // Automatically set duration if available from video metadata
    if (metadata?.duration) {
      console.log('Setting duration from metadata:', metadata.duration);
      updatedLesson.duration = metadata.duration;
    } else {
      console.log('No duration metadata available');
    }
    
    console.log('Updated lesson:', updatedLesson);
    onChange(updatedLesson);
    setIsExtractingDuration(false);
  };

  const handleVideoStart = () => {
    setIsExtractingDuration(true);
  };

  const handleVideoError = (error: string) => {
    console.error("Video input error:", error);
    setIsExtractingDuration(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <button type="button" onClick={toggleExpanded} className="flex items-center space-x-3 text-left flex-1">
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Lesson {index + 1}</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center p-1.5 text-red-600 hover:bg-red-100 rounded-full"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={lesson.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={lesson.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
            <div className="mt-1 flex space-x-2">
              <input
                type="number"
                value={lesson.duration}
                onChange={(e) => handleFieldChange("duration", parseInt(e.target.value) || 0)}
                className="flex-1 rounded-md border-gray-300 shadow-sm px-4 py-2"
                placeholder={isExtractingDuration ? "Extracting duration..." : "Duration will be auto-filled when video is uploaded"}
                disabled={isExtractingDuration}
              />
            </div>
            {isExtractingDuration && (
              <p className="mt-1 text-sm text-blue-600">
                ⏳ Extracting video duration...
              </p>
            )}
            {lesson.duration > 0 && !isExtractingDuration && (
              <p className="mt-1 text-sm text-gray-500">
                {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
              </p>
            )}
          </div>
          
          <VideoInput
            onVideoComplete={handleVideoComplete}
            onVideoError={handleVideoError}
            onVideoStart={handleVideoStart}
            currentVideoUrl={lesson.videoUrl}
            currentVideoType={lesson.videoType}
          />
        </div>
      )}
    </div>
  );
} 