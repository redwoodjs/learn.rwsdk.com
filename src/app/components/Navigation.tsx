import { RequestInfo } from "rwsdk/worker";

type NavigationProps = {
  ctx: RequestInfo["ctx"];
};

export function Navigation({ ctx }: NavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and main nav */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-2xl font-bold text-indigo-600">
                <img src="/images/logo--light.svg" alt="Logo" className="h-10" />
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a href="https://rwsdk.com" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                RedwoodSDK
              </a>
              <a href="https://docs.rwsdk.com" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Documentation
              </a>
              <a href="https://rwsdk.com/personal-software" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Personal Software
              </a>
              <a href="https://rwsdk.com/blog" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Blog
              </a>
            </div>
          </div>

          {/* Right side - Search and user menu */}
          <div className="flex items-center">
            

            {/* User menu */}
            {/* <div className="ml-4 flex items-center md:ml-6">
              {ctx.user ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-4">Welcome, {ctx.user.username}</span>
                  <a href="/account" className="text-gray-500 hover:text-gray-700">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a href="/login" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Log in
                  </a>
                  <a href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                    Sign up
                  </a>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
} 