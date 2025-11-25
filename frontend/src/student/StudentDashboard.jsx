import { useEffect, useState } from 'react'
import { useStudentAuth } from './StudentAuthContext'

export default function StudentDashboard() {
  const { student, logout, updateStudent } = useStudentAuth()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ bankAccNo: '', bankSecretKey: '' })
  const [paymentStatus, setPaymentStatus] = useState({ type: '', message: '' })
  const [paymentLoading, setPaymentLoading] = useState(false)

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
      default:
        return <OverviewSection student={student} onSetupClick={openPaymentModal} />
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

function OverviewSection({ student, onSetupClick }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {student?.username}</h1>
      </div>
      {/* <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-emerald-100">
          <p className="text-sm uppercase text-gray-500 tracking-wide">Account snapshot</p>
          <ul className="mt-4 space-y-2 text-gray-700">
            <li>
              <span className="font-semibold">Account number:</span> {student?.bankAccNo || 'Not provided'}
            </li>
            <li>
              <span className="font-semibold">Secret key:</span> {student?.bankSecretKey || 'Not provided'}
            </li>
          </ul>
        </div>
      </div> */}
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


