import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Page not found
        </p>
        <Link
          to="/"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition inline-block"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
