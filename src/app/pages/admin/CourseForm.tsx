"use client";
import { AdminLayout } from "@/app/layouts/AdminLayout";
import { useState, useEffect } from "react";
import { createCourse, updateCourse } from "./functions";
import { AppContext } from '@/worker';
import { CourseLevel } from "@/db";
import { ModuleCard } from "@/app/components/course/ModuleCard";
import { Course, Module, Lesson } from "@/app/types/course";
import { FileUpload, extractVideoDurationFromUrl } from "@/app/components/FileUpload";

interface UploadResponse {
  url: string;
}

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

interface CourseFormProps {
  ctx: AppContext & {
    creators?: Creator[];
  };
  course?: Course;
}

export function CourseForm({ ctx, course }: CourseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCourse, setCurrentCourse] = useState<Course>(course ? {
    ...course,
    modules: course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => {
        const videoUrl = lesson.content?.content;
        const videoType = lesson.content?.videoType;
        return {
          ...lesson,
          videoUrl,
          videoType
        };
      })
    }))
  } : {
    id: null,
    title: "",
    description: "",
    overview: "",
    status: "DRAFT",
    slug: "",
    modules: [],
    level: "BEGINNER",
    thumbnailUrl: "",
  });

  const isEditing = !!course?.id;

  // Monitor course state changes (optional)
  // useEffect(() => {
  //   console.log('Current course state:', currentCourse);
  // }, [currentCourse]);

  const handleAddModule = () => {
    const newModule: Module = {
      id: crypto.randomUUID(),
      title: '',
      order: currentCourse.modules.length,
      status: 'draft',
      lessons: [],
    };
    setCurrentCourse({
      ...currentCourse,
      modules: [...currentCourse.modules, newModule],
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    setCurrentCourse({
      ...currentCourse,
      modules: currentCourse.modules.filter(module => module.id !== moduleId),
    });
  };

  const handleThumbnailUpload = (url: string) => {
    setCurrentCourse(prev => ({
      ...prev,
      thumbnailUrl: `/download/${url}` || ""
    }));
  };

  const handleThumbnailUploadError = (error: string) => {
    setError(error);
  };

  const handleBulkExtractDurations = async () => {
    const lessonsWithoutDuration = currentCourse.modules.flatMap(module => 
      module.lessons.filter(lesson => lesson.videoUrl && lesson.duration === 0)
    );

    if (lessonsWithoutDuration.length === 0) {
      alert('All lessons already have duration set or no videos found.');
      return;
    }

    const confirmed = confirm(`Extract duration for ${lessonsWithoutDuration.length} lesson(s)? This may take a few moments.`);
    if (!confirmed) return;

    setError(null);
    let processedCount = 0;
    let errorCount = 0;

    for (const module of currentCourse.modules) {
      for (let i = 0; i < module.lessons.length; i++) {
        const lesson = module.lessons[i];
        if (lesson.videoUrl && lesson.duration === 0) {
          try {
            const videoUrl = `/download/${lesson.videoUrl}`;
            const duration = await extractVideoDurationFromUrl(videoUrl);
            
            // Update the lesson in the current course state
            setCurrentCourse(prev => ({
              ...prev,
              modules: prev.modules.map(m => 
                m.id === module.id 
                  ? {
                      ...m,
                      lessons: m.lessons.map((l, idx) => 
                        idx === i ? { ...l, duration } : l
                      )
                    }
                  : m
              )
            }));
            
            processedCount++;
          } catch (error) {
            console.error(`Failed to extract duration for lesson: ${lesson.title}`, error);
            errorCount++;
          }
        }
      }
    }

    if (errorCount > 0) {
      setError(`Processed ${processedCount} lessons successfully. ${errorCount} lessons failed.`);
    } else {
      alert(`Successfully extracted duration for ${processedCount} lesson(s)!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && currentCourse.id) {
        await updateCourse(currentCourse.id, {
          title: currentCourse.title,
          description: currentCourse.description,
          overview: currentCourse.overview,
          status: currentCourse.status,
          slug: currentCourse.slug,
          creatorId: ctx.user?.id || '',
          modules: currentCourse.modules,
          level: currentCourse.level,
          thumbnailUrl: currentCourse.thumbnailUrl
        });
      } else {
        await createCourse({
          title: currentCourse.title,
          description: currentCourse.description,
          overview: currentCourse.overview,
          status: currentCourse.status,
          slug: currentCourse.slug,
          creatorId: ctx.user?.id || '',
          modules: currentCourse.modules,
          level: currentCourse.level,
          thumbnailUrl: currentCourse.thumbnailUrl
        });
      }

      // Remove the redirect
      // window.location.href = '/admin';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCourseChange = (field: string, value: string) => {
    setCurrentCourse(prev => ({
      ...prev,
      [field]: value,
      slug: field === 'title' ? value.toLowerCase().replace(/\s+/g, '-') : prev.slug
    }));
  };

  // Update a module at a given index
  const handleModuleChange = (index: number, updatedModule: Module) => {
    setCurrentCourse(prev => ({
      ...prev,
      modules: prev.modules.map((m, i) => (i === index ? updatedModule : m)),
    }));
  };

  return (
    <AdminLayout ctx={ctx}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isEditing ? "Edit Course" : "Create New Course"}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {isEditing ? "Update your course details and content." : "Set up your new course with modules and lessons."}
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                {isEditing && currentCourse.modules.some(module => 
                  module.lessons.some(lesson => lesson.videoUrl && lesson.duration === 0)
                ) && (
                  <button
                    type="button"
                    onClick={handleBulkExtractDurations}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Extract All Durations
                  </button>
                )}
                <a
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                  Cancel
                </a>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Course Form */}
            <form id="course-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-lg p-6">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Course Title
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={currentCourse.title}
                          onChange={(e) => handleCourseChange('title', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
                          placeholder="Enter course title"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                        Course Thumbnail
                      </label>
                      <div className="mt-2">
                        {currentCourse.thumbnailUrl ? (
                          <div className="space-y-2">
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={currentCourse.thumbnailUrl}
                                alt="Course thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentCourse(prev => ({
                                    ...prev,
                                    thumbnailUrl: ""
                                  }));
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-sm text-gray-500">
                              Current thumbnail: {currentCourse.thumbnailUrl.split('/').pop()}
                            </p>
                          </div>
                        ) : (
                          <FileUpload
                            onUploadComplete={handleThumbnailUpload}
                            onUploadError={handleThumbnailUploadError}
                            accept="image/*"
                            maxSize={10 * 1024 * 1024} // 10MB
                            className="mt-2"
                          >
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors cursor-pointer">
                              <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                  <span className="bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                    Upload a thumbnail
                                  </span>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            </div>
                          </FileUpload>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">
                        Instructor
                      </label>
                      <div className="mt-1">
                        <select
                          id="instructor"
                          name="instructor"
                          defaultValue={currentCourse.creatorId || ''}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 appearance-none bg-white"
                        >
                          <option value="">Select an instructor</option>
                          {ctx.user?.role === 'ADMIN' && ctx.creators ? (
                            ctx.creators.map((creator: Creator) => (
                              <option key={creator.id} value={creator.id}>
                                {creator.name || creator.username}
                              </option>
                            ))
                          ) : (
                            <option value={ctx.user?.id}>
                              {ctx.user?.name || ctx.user?.username}
                            </option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Short Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          value={currentCourse.description}
                          onChange={(e) => handleCourseChange('description', e.target.value)}
                          rows={4}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="overview" className="block text-sm font-medium text-gray-700">
                        Course Overview
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="overview"
                          value={currentCourse.overview}
                          onChange={(e) => handleCourseChange('overview', e.target.value)}
                          rows={8}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="mt-1">
                        <select
                          id="status"
                          name="status"
                          value={currentCourse.status}
                          onChange={(e) => handleCourseChange("status", e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 appearance-none bg-white"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                        </select>
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Course Level
                      </label>
                      <div className="mt-1">
                        <select
                          id="level"
                          name="level"
                          value={currentCourse.level || "BEGINNER"}
                          onChange={(e) => handleCourseChange('level', e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 appearance-none bg-white"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules Section */}
              <div className="pt-8">
                <div className="border-b border-gray-200 pb-5">
                  <h3 className="text-2xl font-medium leading-6 text-gray-900">Modules</h3>
                  <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    {isEditing ? "Add and manage the modules and lessons for this course." : "Add modules and lessons to your course."}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {currentCourse.modules.map((module, index) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      index={index}
                      onChange={(updated) => handleModuleChange(index, updated)}
                      onDelete={() => handleDeleteModule(module.id)}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Module
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {isEditing ? "Save your changes" : "Create your course"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isEditing ? "Don't forget to save your changes" : "Review and create your course"}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="submit"
                    form="course-form"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-150"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {isEditing ? 'Save Course' : 'Create Course'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 