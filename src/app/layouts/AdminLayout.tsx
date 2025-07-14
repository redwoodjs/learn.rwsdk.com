import { RequestInfo } from "rwsdk/worker";

interface AdminLayoutProps {
  children: React.ReactNode;
  ctx: RequestInfo["ctx"];
}

export function AdminLayout({ ctx, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a href="/admin" className="text-xl font-bold text-indigo-600">
                  Admin Dashboard
                </a>
              </div>
              <nav className="ml-6 flex space-x-8">
                <a
                  href="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </a>
                <a
                  href="/admin/courses/new"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Courses
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <a
                href="/"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 