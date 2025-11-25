import { Link } from 'react-router-dom'

export default function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold hover:text-gray-100 transition">
              Coursera
            </Link>
          </div>
          {/* <div className="flex gap-8">
            <Link
              to="/"
              className="text-white hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Contact
            </Link>
          </div> */}
        </div>
      </div>
    </nav>
  )
}
