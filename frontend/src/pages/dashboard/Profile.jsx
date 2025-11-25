export default function Profile({ user }) {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-6">
            <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
            <p className="text-gray-600 text-lg mt-2">Instructor Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Enrollment</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{'Not Set'}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-600">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Earning</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{'Not set'}</p>
          </div>
{/* 
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-600">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Instructor ID</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{user?.id}</p>
          </div> */}

          {/* <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-l-4 border-orange-600">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">Active</p>
          </div> */}
        </div>

        <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">1.</span>
              <span>Set up your payment information in the Payment Setup section</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">2.</span>
              <span>Create your first course using the Upload Course section</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">3.</span>
              <span>Add video lectures and course materials to your courses</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-3">4.</span>
              <span>Students will be able to enroll and access your courses</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
