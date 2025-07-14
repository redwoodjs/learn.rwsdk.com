"use client";

import { useState, useRef } from 'react';
import { updateUserProgress, trackVideoStart, trackVideoComplete } from '@/app/pages/admin/functions';
import { formatDistanceToNow } from 'date-fns';
import { Lesson, Module } from '@/app/types/course';

interface LessonContentProps {
  modules: Module[];
  lastLessonId: string | null;
  courseId: string;
  userId?: string;
  completedLessons: string[];
  creator: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

export function LessonContent({ modules, lastLessonId, courseId, userId, completedLessons, creator }: LessonContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedLessons, setWatchedLessons] = useState<Set<string>>(new Set(completedLessons));
  const [showSidebar, setShowSidebar] = useState(false);

  // Get the lesson ID after the last completed lesson
  const getInitialLessonId = () => {
    if (!lastLessonId) return modules[0]?.lessons[0]?.id || null;
    
    // Find the next lesson after the last completed one
    const allLessons = modules.flatMap(module => module.lessons);
    const lastLessonIndex = allLessons.findIndex(lesson => lesson.id === lastLessonId);
    if (lastLessonIndex === -1 || lastLessonIndex === allLessons.length - 1) {
      return lastLessonId; // Stay on last lesson if it's the final one
    }
    return allLessons[lastLessonIndex + 1].id;
  };

  const [activeLessonId, setActiveLessonId] = useState(getInitialLessonId());

  // Flatten all lessons from all modules
  const allLessons = modules.flatMap(module => module.lessons);
  const currentLesson = allLessons.find(lesson => lesson.id === activeLessonId);

  const handleVideoEnded = async () => {
    if (!currentLesson) return;

    try {
      await updateUserProgress(courseId, currentLesson.id);
      await trackVideoComplete(courseId, currentLesson.id);
      setWatchedLessons(prev => new Set([...prev, currentLesson.id]));
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleVideoStart = async () => {
    if (!currentLesson) return;

    try {
      await trackVideoStart(courseId, currentLesson.id);
    } catch (error) {
      console.error('Failed to track video start:', error);
    }
  };

  // Helper function to check if a lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    if (userId) {
      return watchedLessons.has(lessonId);
    }
    // For unauthenticated users, check if this lesson is before or at the last completed lesson
    if (lastLessonId) {
      const allLessons = modules.flatMap(module => module.lessons);
      const lastLessonIndex = allLessons.findIndex(lesson => lesson.id === lastLessonId);
      const currentLessonIndex = allLessons.findIndex(lesson => lesson.id === lessonId);
      return currentLessonIndex <= lastLessonIndex;
    }
    return false;
  };

  const handleLessonSelect = (lessonId: string) => {
    setActiveLessonId(lessonId);
    // Close sidebar on mobile after selecting a lesson
    setShowSidebar(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Video Player Section */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          {currentLesson?.content?.type === 'video' ? (
            currentLesson.content.videoType === 'YOUTUBE' ? (
              <iframe
                src={`${currentLesson.content.content}${currentLesson.content.content.includes('?') ? '&' : '?'}rel=0`}
                className="w-full h-full"
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={`/download/${currentLesson.content.content}`}
                controls
                className="w-full h-full"
                onEnded={handleVideoEnded}
                onPlay={handleVideoStart}
                preload="metadata"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              No video available
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm sm:text-base" 
            disabled={allLessons.findIndex(lesson => lesson.id === activeLessonId) === 0} 
            onClick={() => setActiveLessonId(allLessons[allLessons.findIndex(lesson => lesson.id === activeLessonId) - 1].id)}
          >
            ← Previous Lesson
          </button>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md disabled:opacity-50 text-sm sm:text-base" 
            disabled={allLessons.findIndex(lesson => lesson.id === activeLessonId) === allLessons.length - 1 || allLessons.findIndex(lesson => lesson.id === activeLessonId) === -1} 
            onClick={() => setActiveLessonId(allLessons[allLessons.findIndex(lesson => lesson.id === activeLessonId) + 1].id)}
          >
            Next Lesson →
          </button>
        </div>
        
        <hr className="my-4 border-gray-200" />
        
        {/* Lesson Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{currentLesson?.title}</h1>
        
        {/* Lesson Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-2 sm:space-y-0">
          <p className="text-xs sm:text-sm text-gray-500">
            Duration: {Math.max(1, Math.round((currentLesson?.duration || 0) / 60))} minutes
          </p>
        </div>
        
        {/* Instructor Info */}
        <div className="flex items-center space-x-3 mt-4">
          <img 
            src={creator.avatar || '/default-avatar.png'} 
            alt={creator.name || 'Instructor'} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {creator.name || 'Instructor'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">Instructor</p>
          </div>
        </div>
        
        {/* Lesson Description */}
        <p className="mt-3 text-gray-600 text-base sm:text-lg lg:text-xl">{currentLesson?.description}</p>
      </div>

      {/* Lessons List Section - Mobile Overlay / Desktop Sidebar */}
      <div className={`
        ${showSidebar ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : 'hidden lg:block'}
        lg:w-80 border-l border-gray-200 bg-gray-50
      `}>
        {/* Mobile Overlay Background */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Sidebar Content */}
        <div className={`
          ${showSidebar ? 'fixed right-0 top-0 h-full w-80 z-50 lg:relative lg:right-auto lg:top-auto lg:w-auto' : 'relative'}
          bg-gray-50 h-full overflow-y-auto
        `}>
          <div className="p-4">
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">{module.title}</h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-150 flex items-center gap-3 ${
                          lesson.id === activeLessonId
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5">
                          {isLessonCompleted(lesson.id) ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg
                                className="w-2 h-2 sm:w-3 sm:h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <span className="flex-1 text-xs sm:text-sm">
                          {lesson.title} ({Math.max(1, Math.round(lesson.duration / 60))} min)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 