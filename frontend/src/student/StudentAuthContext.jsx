import { createContext, useContext, useEffect, useState } from 'react'

const StudentAuthContext = createContext(null)

const STORAGE_KEY = 'studentAuth'

export function StudentAuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateStudent = (updates) => {
    setStudent((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates }
      return next
    })
  }

  useEffect(() => {
    if (student) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(student))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [student])

  const handleAuthRequest = async (endpoint, payload, shouldPersist = true) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        const message = data.message || 'Unable to process request'
        setError(message)
        return { success: false, message }
      }

      if (shouldPersist) {
        setStudent(data.student)
      }

      return { success: true, student: data.student }
    } catch (err) {
      const message = 'Failed to connect to server'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const login = (username, password) => handleAuthRequest('/api/student/login', { username, password })

  const signup = (username, password) => handleAuthRequest('/api/student/signup', { username, password })

  const logout = () => {
    setStudent(null)
    setError(null)
  }

  const value = {
    student,
    isAuthenticated: Boolean(student),
    loading,
    error,
    login,
    signup,
    logout,
    updateStudent,
  }

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext)
  if (context === null) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider')
  }
  return context
}


