"use client";
import { RequestInfo } from "rwsdk/worker";
import { CourseForm } from "./CourseForm";
import { getCourse } from "./functions";
import { useEffect, useState } from "react";
import { CourseLevel } from "@/db";

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number;
  status: string;
  content?: Array<{
    id: string;
    type: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    lessonId: string;
  }>;
}

interface Module {
  id: string;
  title: string;
  order: number;
  status: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  overview: string;
  status: string;
  slug: string;
  modules: Module[];
  creatorId?: string;
  level?: CourseLevel;
  thumbnailUrl: string;
}

export function EditCourse({params, ctx}: RequestInfo) {
  const { id } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        if (!id) {
          throw new Error("Course ID is required");
        }
        const courseData = await getCourse(id);
        console.log('Raw course data:', courseData);
        // Transform the course data to ensure proper structure
        const transformedCourse: Course = {
          ...courseData,
          modules: courseData.modules.map((module: Module) => ({
            ...module,
            lessons: module.lessons.map((lesson: Lesson) => {
              console.log('Lesson content:', lesson.content);
              return {
                ...lesson,
                videoUrl: lesson.content?.[0]?.content
              };
            })
          }))
        };
        console.log('Transformed course:', transformedCourse);
        setCourse(transformedCourse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <a
            href="/admin"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Admin
          </a>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return <CourseForm ctx={ctx} course={course} />;
} 