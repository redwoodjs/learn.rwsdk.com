import { RequestInfo } from "rwsdk/worker";
import { getCourses, getCreators, getVideoStats } from "./functions";
import { Course, User } from "@generated/prisma";
import { AdminLayout } from "@/app/layouts/AdminLayout";

interface CourseWithStats extends Course {
  lessons?: { id: string }[];
  progress?: { id: string }[];
}

interface VideoStats {
  courseId: string;
  courseTitle: string;
  totalStarts: number;
  totalCompletions: number;
  overallCompletionRate: number;
  lessonStats: {
    lessonId: string;
    lessonTitle: string;
    starts: number;
    completions: number;
    completionRate: number;
  }[];
}

export async function Admin({ ctx }: RequestInfo) {
  // Fetch courses, creators, and video stats
  const [courses, creators, videoStats] = await Promise.all([
    getCourses(),
    getCreators(),
    getVideoStats()
  ]);

  return (
    <AdminLayout ctx={ctx}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Course Management
              </h2>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <a
                href="/admin/creators"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Manage Instructors
              </a>
              <a
                href="/admin/courses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Course
              </a>
            </div>
          </div>

          {/* Creators Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Instructors</h3>
              <a
                href="/admin/creators/new"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Instructor
              </a>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {creators.map((creator) => (
                  <li key={creator.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {creator.avatar ? (
                            <img
                              src={creator.avatar}
                              alt={creator.name || 'Instructor'}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {creator.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {creator.name}
                            </h4>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={`/admin/creators/${creator.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Edit Profile
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Course List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {courses.map((course: CourseWithStats) => (
                <li key={course.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-indigo-600 truncate">
                          {course.title}
                        </h3>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {course.lessons?.length || 0} lessons
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {course.progress?.length || 0} students
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={`/admin/courses/${course.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Courses
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {courses.length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Students
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {courses.reduce((acc: number, course: CourseWithStats) => acc + (course.progress?.length || 0), 0)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Lessons
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {courses.reduce((acc: number, course: CourseWithStats) => acc + (course.lessons?.length || 0), 0)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Video Views
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {videoStats.reduce((acc, course) => acc + course.totalStarts, 0)}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          <span className="sr-only">Completed</span>
                          {videoStats.reduce((acc, course) => acc + course.totalCompletions, 0)} completed
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Statistics */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Video Statistics</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {videoStats.map((courseStats: VideoStats) => (
                <div key={courseStats.courseId} className="border-b border-gray-200 last:border-b-0">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-indigo-600">
                        {courseStats.courseTitle}
                      </h4>
                      <div className="flex space-x-4 text-sm">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">
                            {courseStats.totalStarts} starts
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">
                            {courseStats.totalCompletions} completions
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="text-gray-600">
                            {courseStats.overallCompletionRate}% completion rate
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {courseStats.lessonStats.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Lesson Details:</h5>
                        <div className="space-y-2">
                          {courseStats.lessonStats.map((lesson) => (
                            <div key={lesson.lessonId} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                              <span className="text-gray-900 font-medium">{lesson.lessonTitle}</span>
                              <div className="flex space-x-4 text-gray-600">
                                <span>{lesson.starts} starts</span>
                                <span>{lesson.completions} completions</span>
                                <span className="font-medium">{lesson.completionRate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 