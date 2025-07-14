import { RequestInfo } from "rwsdk/worker";
import { MainLayout } from "../layouts/MainLayout";
import { getCourses } from "./admin/functions";
import { minutesToISO8601Duration } from "@/app/lib/courseCalcs";

export async function Home({ ctx }: RequestInfo) {
  const courses = await getCourses();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      ...courses.map((course) => ({
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Course",
          "url": `https://rwsdk.com/courses/${course.id}`,
          "name": course.title,
          "description": course.description,
          "provider": {
            "@type": "Organization",
            "name": "RedwoodJS Inc.",
            "sameAs": `https://rwsdk.com/courses/${course.id}`
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
      }))
    ]
  }

  return (
    <MainLayout ctx={ctx}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Learn RedwoodSDK</span>
                <span className="block text-indigo-600">Build Better Apps Faster</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Free, high-quality courses to help you master RedwoodSDK and build modern web applications with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Featured Courses Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Featured Courses
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <a href={`/courses/${course.id}`} className="bg-white overflow-hidden shadow rounded-lg" key={course.id}>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {course.description}
                  </p>
                </div>
              </a>))}

            {/* Course Card 3 */}
            {courses.slice(2).map((course) => (
              <div className="bg-white overflow-hidden shadow rounded-lg" key={course.id}>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {course.description}
                  </p>
                </div>
              </div>))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Why Learn with Us?
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Free & Accessible</h3>
                <p className="mt-2 text-sm text-gray-500">
                  All courses are completely free and available to everyone.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Practical Learning</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Learn by building real-world applications and solving actual problems.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Community Driven</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Join a community of developers learning and growing together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
