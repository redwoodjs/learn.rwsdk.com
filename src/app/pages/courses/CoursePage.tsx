import { RequestInfo } from "rwsdk/worker";
import { getCourse } from "../admin/functions";
import { CourseLevel } from "@/db";
import { minutesToISO8601Duration } from "@/app/lib/courseCalcs";
import { MainLayout } from "@/app/layouts/MainLayout";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  status: string;
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
  level: CourseLevel;
  modules: Module[];
  updatedAt: string;
  thumbnailUrl?: string;
  creator: {
    id: string;
    name: string | null;
    avatar: string | null;
    description: string | null;
  };
}

export async function CoursePage({ ctx, params }: RequestInfo) {
  try {
    const courseData = await getCourse(params.id);
    const course = courseData as unknown as Course;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "RedwoodJS Inc.",
        "sameAs": "https://rwsdk.com"
      },
      "offers": [{
          "@type": "Offer",
          "category": "Free",
          "priceCurrency": "USD",
          "price": 0
        }],
        "hasCourseInstance": [{
        "@type": "CourseInstance",
        "courseMode": "Online",
        "location": "RedwoodJS Inc.",
        "courseWorkload": minutesToISO8601Duration(course.modules.reduce((acc, module) => acc + module.lessons.reduce((acc, lesson) => acc + lesson.duration, 0), 0)),
        "instructor": [{
          "@type": "Person",
          "name": course.creator.name,
          "description": course.creator.description,
          "image": course.creator.avatar
        }]
      }]
    }
    
    return (
      <MainLayout
        title={course.title}
        description={course.description}
        image={course.thumbnailUrl}
        url={`https://learn.rwsdk.com/courses/${course.id}`}
      >   
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Course Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-gray-900">
                {course.title}
              </h1>
              <div 
                className="text-gray-600 mb-4 max-w-none [&_p]:my4 [&_ul]:list-disc [&_ul]:ml-5"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
              <div className="mt-6 flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">
                    Duration: {(() => {
                      const totalSeconds = course.modules.reduce((acc: number, module: Module) => 
                        acc + module.lessons.reduce((acc: number, lesson: Lesson) => acc + lesson.duration, 0), 0);
                      const totalHours = totalSeconds / 3600;
                      if (totalHours < 1) {
                        const totalMinutes = Math.round(totalSeconds / 60);
                        return `${totalMinutes} minutes`;
                      } else {
                        return `${totalHours.toFixed(1)} hours`;
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Level: {course.level.charAt(0) + course.level.slice(1).toLowerCase()}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Last Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-8">
                <a
                  href={`/courses/${course.id}/lessons`}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Start Learning
                  <svg className="ml-2 -mr-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="lg:sticky lg:top-8">
              <img src={course.thumbnailUrl} alt={course.title} className="w-auto h-auto"/>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
              <div 
                className="text-gray-600 mb-4 max-w-none prose prose-indigo"
                dangerouslySetInnerHTML={{ __html: course.overview }}
              />
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Curriculum</h2>
              <div className="space-y-6">
                {/* Module 1 */}
                {course.modules.map((module, index) => (
                  <div className="border-b border-gray-200 pb-6" key={module.id}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{module.title}</h3>
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div className="flex items-center text-gray-600" key={lesson.id}>
                          <span className="w-6">{index + 1}.{lessonIndex + 1} </span>
                          <span>{lesson.title}</span>
                          <span className="ml-auto text-sm">{Math.max(1, Math.round(lesson.duration / 60))} min</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instructor</h2>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <img src={course.creator.avatar || ''} alt={course.creator.name || ''} className="h-16 w-16 rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.creator.name}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {course.creator.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
  } catch (error) {
    console.error('Error loading course:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Course</h1>
          <p className="text-gray-600">There was an error loading the course. Please try again.</p>
        </div>
      </div>
    );
  }
} 