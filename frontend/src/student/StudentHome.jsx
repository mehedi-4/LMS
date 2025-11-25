import { useState } from 'react'
import StudentDashboard from './StudentDashboard'
import { StudentAuthProvider, useStudentAuth } from './StudentAuthContext'

function StudentHomeContent() {
  const { isAuthenticated, loading, error, login, signup } = useStudentAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [formError, setFormError] = useState('')

  const toggleMode = (nextMode) => {
    setMode(nextMode)
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!username.trim() || !password.trim()) {
      setFormError('Please fill in all fields')
      return
    }

    const action = mode === 'login' ? login : signup
    const result = await action(username.trim(), password.trim())

    if (!result.success) {
      setFormError(result.message || 'Unable to complete the request')
      return
    }

    setUsername('')
    setPassword('')
  }

  if (isAuthenticated) {
    return <StudentDashboard />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6 space-x-2">
          <button
            type="button"
            onClick={() => toggleMode('login')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => toggleMode('signup')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
              mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          {mode === 'login' ? 'Student Login' : 'Create Student Account'}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {mode === 'login' ? 'Enter your credentials to continue' : 'Pick a username and password to get started'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              disabled={loading}
            />
          </div>

          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function StudentHome() {
  return (
    <StudentAuthProvider>
      <StudentHomeContent />
    </StudentAuthProvider>
  )
}
