import { useState, useEffect } from 'react'

export default function Transactions({ user }) {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchTransactions()
    }
  }, [user?.id])

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:5000/api/instructor/${user.id}/transactions`)
      const data = await response.json()

      if (data.success) {
        setBalance(data.balance)
        setTransactions(data.transactions)
      } else {
        setError(data.message || 'Failed to fetch transactions')
      }
    } catch (err) {
      setError('Error fetching transactions: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h2>
        <p className="text-gray-600">View your account balance and transaction history</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading transactions...</p>
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <p className="text-indigo-100 text-sm mb-2">Account Balance</p>
            <p className="text-4xl font-bold">${parseFloat(balance || 0).toFixed(2)}</p>
            {user?.bank_acc_no && (
              <p className="text-indigo-100 text-sm mt-2">Account: {user.bank_acc_no}</p>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const isOutgoing = transaction.direction === 'outgoing'
                  const isIncoming = transaction.direction === 'incoming'
                  
                  return (
                    <div key={transaction.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isOutgoing ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <div>
                              <p className="font-semibold text-gray-900">{transaction.description || 'Transaction'}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {isOutgoing ? `To: ${transaction.to_account_no}` : `From: ${transaction.from_account_no || 'LMS'}`}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutgoing ? '-' : '+'}${parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <p className={`text-xs mt-1 ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
                            {isOutgoing ? 'Outgoing' : 'Incoming'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

