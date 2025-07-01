import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Safe Streets Halton
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">
            Promotions Tool
          </h2>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl">
            A tool for automating and simplifying various promotional activities 
            including email newsletters, social media management, and more.
          </p>
          
          <div className="mt-10 flex space-x-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-150 ease-in-out"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-md border border-gray-300 transition duration-150 ease-in-out"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
