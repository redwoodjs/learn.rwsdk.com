import { MainLayout } from "@/app/layouts/MainLayout";
import { getCourseWithProgress } from '@/app/pages/admin/functions';
import { LessonContent } from "./LessonContent";
import { minutesToISO8601Duration } from '@/app/lib/courseCalcs';

interface PageProps {
  params: { id: string };
  ctx: any;
  request: Request;
}

export default async function LessonPage({ params, ctx, request }: PageProps) {
  try {
    const { course, lastLessonId, completedLessons } = await getCourseWithProgress(params.id, ctx.user?.id);

    if (!course) {
      return <div>Course not found</div>;
    }

    // Get the lesson parameter from URL
    const url = new URL(request.url);
    const lessonParam = url.searchParams.get('lesson');

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
      <MainLayout ctx={ctx}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6">
            {/* Back to Course Link */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <a
                href={`/courses/${course.id}`}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Course Overview
              </a>
            </div>
            
            <LessonContent
              modules={course.modules}
              lastLessonId={lastLessonId}
              courseId={course.id}
              userId={ctx.user?.id}
              completedLessons={completedLessons}
              creator={course.creator}
              initialLessonId={lessonParam}
            />
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error('Error loading lesson page:', error);
    return (
      <MainLayout ctx={ctx}>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Error Loading Course</h1>
            <p className="text-sm sm:text-base text-gray-600">There was an error loading the course content. Please try again.</p>
          </div>
        </div>
      </MainLayout>
    );
  }
} 