import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import View from './dashboard/View'
import Profile from './dashboard/Profile'
import PaymentSetup from './dashboard/PaymentSetup'
import UploadCourse from './dashboard/UploadCourse'
import Transactions from './dashboard/Transactions'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [activeMenu, setActiveMenu] = useState('profile')

    const handleLogout = () => {
        logout()
    }

    const renderContent = () => {
        switch (activeMenu) {
            case 'profile':
                return <Profile user={user} />
            case 'payment':
                return <PaymentSetup user={user} />
            case 'transactions':
                return <Transactions user={user} />
            case 'upload-course':
                return <UploadCourse user={user} />
            case 'view-course':
                return <View user={user} />
            default:
                return <Profile user={user} />
        }
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 text-white shadow-lg">
                <div className="p-6 border-b border-indigo-600">
                    <h2 className="text-2xl font-bold">{user?.username}</h2>
                    <p className="text-indigo-200 text-sm mt-1">Instructor</p>
                </div>

                <nav className="mt-6">
                    <button
                        onClick={() => setActiveMenu('profile')}
                        className={`w-full text-left px-6 py-3 transition ${activeMenu === 'profile'
                                ? 'bg-indigo-600 border-l-4 border-white'
                                : 'hover:bg-indigo-600'
                            }`}
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            Profile
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMenu('payment')}
                        className={`w-full text-left px-6 py-3 transition ${activeMenu === 'payment'
                                ? 'bg-indigo-600 border-l-4 border-white'
                                : 'hover:bg-indigo-600'
                            }`}
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                            Payment Setup
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMenu('transactions')}
                        className={`w-full text-left px-6 py-3 transition ${activeMenu === 'transactions'
                                ? 'bg-indigo-600 border-l-4 border-white'
                                : 'hover:bg-indigo-600'
                            }`}
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Transactions
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMenu('upload-course')}
                        className={`w-full text-left px-6 py-3 transition ${activeMenu === 'upload-course'
                                ? 'bg-indigo-600 border-l-4 border-white'
                                : 'hover:bg-indigo-600'
                            }`}
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                            </svg>
                            Upload Course
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMenu('view-course')}
                        className={`w-full text-left px-6 py-3 transition ${activeMenu === 'view-course'
                                ? 'bg-indigo-600 border-l-4 border-white'
                                : 'hover:bg-indigo-600'
                            }`}
                    >
                        <span className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                            </svg>
                            View Course
                        </span>
                    </button>
                </nav>

                <div className="absolute bottom-0 w-64 p-6 border-t border-indigo-600">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-semibold"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    )
}
