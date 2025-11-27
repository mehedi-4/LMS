import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function PaymentSetup() {
  const { user, updateUser } = useAuth()

  const [bankAccNo, setBankAccNo] = useState('')
  const [bankSecretKey, setBankSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!bankAccNo.trim() || !bankSecretKey.trim()) {
      setMessageType('error')
      setMessage('Please fill in all fields')
      return
    }

    if (!/^\d+$/.test(bankAccNo)) {
      setMessageType('error')
      setMessage('Bank account number must contain only digits')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/instructor/payment-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user?.username,
          bankAccNo,
          bankSecretKey,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessageType('success')
        setMessage('Payment setup saved successfully!')

        // Clear form after saving
        setBankAccNo('')
        setBankSecretKey('')

        // Update user state instantly so UI reflects correctly
        updateUser({
          isSet: data.instructor.payment_setup,
          bank_acc_no: data.instructor.bank_acc_no,
          bank_secret_key: data.instructor.bank_secret_key,
        })
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to save payment setup')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">

      {/* Display saved info */}
      {user?.isSet && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Info</h2>
          <div className="bg-blue-100 p-4 rounded-lg space-y-2">
            <p className="text-gray-600">
              Account No: <span className="text-gray-800 font-medium">{user.bank_acc_no}</span>
            </p>
            <p className="text-gray-600">
              Secret Key: <span className="text-gray-800 font-medium">{user.bank_secret_key}</span>

            </p>
          </div>
        </div>
      )}

      {/* Editable form */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.isSet ? 'Update Payment Info' : 'Payment Setup'}
        </h2>
        <p className="text-gray-600 mb-8">
          Configure your bank account details for receiving payments
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="bankAccNo" className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account Number
            </label>
            <input
              id="bankAccNo"
              type="text"
              value={bankAccNo}
              onChange={(e) => setBankAccNo(e.target.value)}
              placeholder="Enter your bank account number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <p className="text-gray-500 text-sm mt-1">Your bank account number where payments will be deposited</p>
          </div>

          <div>
            <label htmlFor="bankSecretKey" className="block text-sm font-medium text-gray-700 mb-2">
              Bank Secret Key
            </label>
            <input
              id="bankSecretKey"
              type="password"
              value={bankSecretKey}
              onChange={(e) => setBankSecretKey(e.target.value)}
              placeholder="Enter your bank secret key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <p className="text-gray-500 text-sm mt-1">Your secret key for payment processing</p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-indigo-400"
          >
            {loading ? 'Saving...' : 'Save Payment Setup'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">⚠️ Security Notice</h3>
          <p className="text-sm text-gray-700">
            Your payment information is securely stored and will only be used for processing payments.
          </p>
        </div>
      </div>
    </div>
  )
}
