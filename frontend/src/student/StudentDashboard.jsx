import { useEffect, useState } from 'react'
import { useStudentAuth } from './StudentAuthContext'

export default function StudentDashboard() {
  const { student, logout, updateStudent } = useStudentAuth()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ bankAccNo: '', bankSecretKey: '' })
  const [paymentStatus, setPaymentStatus] = useState({ type: '', message: '' })
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    if (student && !student.paymentSetup) {
      setPaymentForm({
        bankAccNo: student.bankAccNo || '',
        bankSecretKey: student.bankSecretKey || '',
      })
      setPaymentStatus({ type: '', message: '' })
      setShowPaymentModal(true)
    }
  }, [student])

  const openPaymentModal = () => {
    setPaymentForm({
      bankAccNo: student?.bankAccNo || '',
      bankSecretKey: student?.bankSecretKey || '',
    })
    setPaymentStatus({ type: '', message: '' })
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    if (paymentLoading) return
    setShowPaymentModal(false)
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!paymentForm.bankAccNo.trim() || !paymentForm.bankSecretKey.trim()) {
      setPaymentStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setPaymentLoading(true)
    setPaymentStatus({ type: '', message: '' })
    try {
      const response = await fetch('http://localhost:5000/api/student/payment-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: student?.username,
          bankAccNo: paymentForm.bankAccNo.trim(),
          bankSecretKey: paymentForm.bankSecretKey.trim(),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setPaymentStatus({ type: 'error', message: data.message || 'Failed to save payment info' })
        return
      }

      updateStudent({
        paymentSetup: data.student.paymentSetup,
        bankAccNo: data.student.bankAccNo,
        bankSecretKey: data.student.bankSecretKey,
      })

      setPaymentStatus({ type: 'success', message: 'Payment information saved successfully' })
      setShowPaymentModal(false)
    } catch (err) {
      setPaymentStatus({ type: 'error', message: 'Unable to connect to server' })
    } finally {
      setPaymentLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'payment':
        return (
          <PaymentSection
            student={student}
            onSetupClick={openPaymentModal}
          />
        )
      case 'enrolled':
        return <EnrolledCoursesSection student={student} />
      default:
        return (
          <OverviewSection
            student={student}
            onSetupClick={openPaymentModal}
            onEnrollClick={(course) => {
              setSelectedCourse(course)
              setShowEnrollModal(true)
            }}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white shadow-lg">
        <div className="p-6 border-b border-emerald-500">
          <h2 className="text-2xl font-bold">{student?.username}</h2>
          <p className="text-emerald-200 text-sm mt-1">Student Portal</p>
        </div>
        <nav className="mt-6">
          <SidebarButton
            label="Overview"
            iconPath="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            isActive={activeMenu === 'overview'}
            onClick={() => setActiveMenu('overview')}
          />
          <SidebarButton
            label="Enrolled Courses"
            iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            isActive={activeMenu === 'enrolled'}
            onClick={() => setActiveMenu('enrolled')}
          />
          <SidebarButton
            label="Payment Setup"
            iconPath="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            isActive={activeMenu === 'payment'}
            onClick={() => setActiveMenu('payment')}
          />
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t border-emerald-500">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </main>

      {showPaymentModal && (
        <PaymentModal
          form={paymentForm}
          onChange={setPaymentForm}
          onClose={closePaymentModal}
          onSubmit={handlePaymentSubmit}
          status={paymentStatus}
          loading={paymentLoading}
        />
      )}

      {showEnrollModal && selectedCourse && (
        <EnrollConfirmationModal
          course={selectedCourse}
          student={student}
          onClose={() => {
            setShowEnrollModal(false)
            setSelectedCourse(null)
          }}
          onConfirm={async () => {
            setShowEnrollModal(false)
            // The enrollment will be handled by OverviewSection
            setSelectedCourse(null)
          }}
        />
      )}
    </div>
  )
}

function SidebarButton({ label, iconPath, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-6 py-3 transition ${
        isActive ? 'bg-emerald-500 border-l-4 border-white' : 'hover:bg-emerald-500'
      }`}
    >
      <span className="flex items-center">
        <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path d={iconPath} />
        </svg>
        {label}
      </span>
    </button>
  )
}

function OverviewSection({ student, onSetupClick, onEnrollClick }) {
  const [courses, setCourses] = useState([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCourses()
    if (student?.id) {
      fetchEnrollments()
    }
  }, [student?.id])

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5000/api/courses')
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      } else {
        setError(data.message || 'Failed to fetch courses')
      }
    } catch (err) {
      setError('Error fetching courses: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/student/${student.id}/enrollments`)
      const data = await response.json()

      if (data.success) {
        const enrolledIds = data.enrollments.map((e) => e.course_id)
        setEnrolledCourseIds(enrolledIds)
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err)
    }
  }

  const handleEnrollClick = (course) => {
    if (!student?.id) {
      setError('Please login to enroll in courses')
      return
    }
    if (!student?.paymentSetup) {
      setError('Please set up your payment information first')
      onSetupClick()
      return
    }
    onEnrollClick(course)
  }

  // Filter out enrolled courses
  const availableCourses = courses.filter((course) => !enrolledCourseIds.includes(course.id))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {student?.username}</h1>
        <p className="text-gray-600 mt-2">Browse and enroll in courses below</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading courses...</p>
        </div>
      ) : availableCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No new courses available. Check your enrolled courses tab.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => handleEnrollClick(course)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course, onEnroll }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-emerald-600">${parseFloat(course.price || 0).toFixed(2)}</p>
            {course.instructor_username && (
              <p className="text-xs text-gray-500 mt-1">By {course.instructor_username}</p>
            )}
          </div>
        </div>
        <button
          onClick={onEnroll}
          className="w-full py-2 px-4 rounded-lg font-semibold transition bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Enroll Now
        </button>
      </div>
    </div>
  )
}

function PaymentSection({ student, onSetupClick }) {
  const hasPayment = Boolean(student?.paymentSetup)
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup</h2>
        <p className="text-gray-600 mb-6">
          {hasPayment
            ? 'Your payment credentials are securely stored. You can update them whenever you need.'
            : 'Add your bank account details to receive course-related payouts.'}
        </p>

        {hasPayment ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2 text-gray-800">
            <p>
              <span className="font-semibold">Account No:</span> {student.bankAccNo}
            </p>
            <p>
              <span className="font-semibold">Secret Key:</span> {student.bankSecretKey}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-700">
            Payment details are not configured yet.
          </div>
        )}

        <button
          onClick={onSetupClick}
          className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          {hasPayment ? 'Update payment details' : 'Setup payment now'}
        </button>
      </div>
    </div>
  )
}

function EnrolledCoursesSection({ student }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (student?.id) {
      fetchEnrollments()
    }
  }, [student?.id])

  const fetchEnrollments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:5000/api/student/${student.id}/enrollments`)
      const data = await response.json()

      if (data.success) {
        setEnrollments(data.enrollments)
      } else {
        setError(data.message || 'Failed to fetch enrollments')
      }
    } catch (err) {
      setError('Error fetching enrollments: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h1>
        <p className="text-gray-600 mt-2">View all courses you are enrolled in</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading enrolled courses...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <EnrolledCourseCard key={enrollment.eid} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  )
}

function EnrolledCourseCard({ enrollment }) {
  const enrollmentDate = new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{enrollment.title}</h3>
          <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">
            Enrolled
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {enrollment.description || 'No description available'}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="text-lg font-bold text-emerald-600">
              ${parseFloat(enrollment.price || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Instructor:</span>
            <span className="text-sm font-medium text-gray-700">
              {enrollment.instructor_username || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Enrolled:</span>
            <span className="text-sm text-gray-700">{enrollmentDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnrollConfirmationModal({ course, student, onClose, onConfirm }) {
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (!student?.id) {
      setError('Please login to enroll in courses')
      return
    }

    setEnrolling(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          courseId: course.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onConfirm()
        // Refresh the page or update state
        window.location.reload()
      } else {
        setError(data.message || 'Failed to enroll in course')
      }
    } catch (err) {
      setError('Unable to connect to server')
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          disabled={enrolling}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close confirmation"
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h3>
        <p className="text-gray-600 mb-6">Please confirm your purchase of this course.</p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="text-2xl font-bold text-emerald-600">
              ${parseFloat(course.price || 0).toFixed(2)}
            </span>
          </div>
          {course.instructor_username && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Instructor:</span>
              <span className="text-gray-900">{course.instructor_username}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={enrolling}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={enrolling}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:bg-emerald-400 flex items-center justify-center"
          >
            {enrolling ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function PaymentModal({ form, onChange, onClose, onSubmit, status, loading }) {
  return (
    <div className="fixed inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close payment setup"
        >
          ×
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Setup</h3>
        <p className="text-gray-600 mb-6">Add your bank account details to continue.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="student-bankAccNo" className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              id="student-bankAccNo"
              type="text"
              value={form.bankAccNo}
              onChange={(e) => onChange((prev) => ({ ...prev, bankAccNo: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter bank account number"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="student-bankSecretKey" className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key
            </label>
            <input
              id="student-bankSecretKey"
              type="password"
              value={form.bankSecretKey}
              onChange={(e) => onChange((prev) => ({ ...prev, bankSecretKey: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter secret key"
              disabled={loading}
            />
          </div>

          {status.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                status.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold disabled:bg-emerald-400"
          >
            {loading ? 'Saving...' : 'Save payment details'}
          </button>
        </form>
      </div>
    </div>
  )
}


