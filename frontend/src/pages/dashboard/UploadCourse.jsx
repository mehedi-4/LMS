import { useState } from 'react'

export default function UploadCourse({ user }) {
  const [step, setStep] = useState(1)
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    numberOfLectures: '',
    price: '',
  })
  const [lectures, setLectures] = useState([])
  const [currentLecture, setCurrentLecture] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Step 1: Course Details
  const handleCourseChange = (e) => {
    const { name, value } = e.target
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (!courseData.title || !courseData.description || !courseData.numberOfLectures || !courseData.price) {
      setMessageType('error')
      setMessage('Please fill in all fields')
      return
    }

    // Initialize lectures array
    const lectureCount = parseInt(courseData.numberOfLectures)
    const newLectures = Array.from({ length: lectureCount }, (_, i) => ({
      id: i + 1,
      title: '',
      video: null,
      materials: [],
    }))
    setLectures(newLectures)
    setCurrentLecture(0)
    setStep(2)
    setMessage('')
  }

  const resetBanner = () => {
    setMessage('')
    setMessageType('')
  }

  // Step 2: Lecture Upload
  const handleLectureChange = (field, value) => {
    setLectures((prev) =>
      prev.map((lecture, idx) =>
        idx === currentLecture
          ? {
              ...lecture,
              [field]: value,
            }
          : lecture
      )
    )
  }

  const handleMaterialUpload = (e) => {
    const files = Array.from(e.target.files)
    setLectures((prev) =>
      prev.map((lecture, idx) =>
        idx === currentLecture
          ? {
              ...lecture,
              materials: [...lecture.materials, ...files],
            }
          : lecture
      )
    )
    e.target.value = ''
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleLectureChange('video', file)
    }
  }

  const handleRemoveMaterial = (indexToRemove) => {
    setLectures((prev) =>
      prev.map((lecture, idx) =>
        idx === currentLecture
          ? {
              ...lecture,
              materials: lecture.materials.filter((_, idx2) => idx2 !== indexToRemove),
            }
          : lecture
      )
    )
  }

  const handleNextLecture = () => {
    if (!lectures[currentLecture].title || !lectures[currentLecture].video) {
      setMessageType('error')
      setMessage('Please add lecture title and video before proceeding')
      return
    }
    if (currentLecture < lectures.length - 1) {
      setCurrentLecture(currentLecture + 1)
      resetBanner()
    }
  }

  const handlePreviousLecture = () => {
    if (currentLecture > 0) {
      setCurrentLecture(currentLecture - 1)
      resetBanner()
    }
  }

  const hasIncompleteLectures = () =>
    lectures.some((lecture) => !lecture.title || !lecture.video)

  const handleSubmitCourse = async (e) => {
    e.preventDefault()
    setLoading(true)
    resetBanner()

    if (hasIncompleteLectures()) {
      setLoading(false)
      setMessageType('error')
      setMessage('Every lecture must include a title and a video.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('instructorId', user?.id)
      formData.append('title', courseData.title)
      formData.append('description', courseData.description)
      formData.append('numberOfLectures', lectures.length.toString())
      formData.append('price', courseData.price)

      // Add lectures
      lectures.forEach((lecture, index) => {
        formData.append(`lectures[${index}][title]`, lecture.title)
        formData.append(`lectures[${index}][video]`, lecture.video, lecture.video.name || `lecture-${index + 1}-video`)
        lecture.materials.forEach((material, materialIndex) => {
          formData.append(
            `lectures[${index}][materials]`,
            material,
            material.name || `lecture-${index + 1}-material-${materialIndex + 1}`
          )
        })
      })

      const response = await fetch('http://localhost:5000/api/courses/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setMessageType('success')
        setMessage('Course uploaded successfully!')
        setTimeout(() => {
          // Reset form
          setCourseData({
            title: '',
            description: '',
            numberOfLectures: '',
            price: '',
          })
          setLectures([])
          setCurrentLecture(0)
          setStep(1)
        }, 1500)
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to upload course')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('Error uploading course: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Upload Course</h2>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Course Details</span>
            <span className="font-semibold">Upload Lectures</span>
          </div>
        </div>

        {/* Step 1: Course Details */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Course Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={courseData.title}
                onChange={handleCourseChange}
                placeholder="Enter course title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                id="description"
                name="description"
                value={courseData.description}
                onChange={handleCourseChange}
                placeholder="Enter course description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="numberOfLectures" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Lectures
                </label>
                <input
                  id="numberOfLectures"
                  type="number"
                  name="numberOfLectures"
                  value={courseData.numberOfLectures}
                  onChange={handleCourseChange}
                  placeholder="e.g., 10"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleCourseChange}
                  placeholder="e.g., 99.99"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : ''}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Next: Upload Lectures
            </button>
          </form>
        )}

        {/* Step 2: Upload Lectures */}
        {step === 2 && lectures.length > 0 && (
          <form onSubmit={handleSubmitCourse} className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900">
                Lecture {currentLecture + 1} of {lectures.length}
              </h3>
            </div>

            <div>
              <label htmlFor="lectureTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Title
              </label>
              <input
                id="lectureTitle"
                type="text"
                value={lectures[currentLecture].title}
                onChange={(e) => handleLectureChange('title', e.target.value)}
                placeholder="Enter lecture title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Video Lecture
              </label>
              <input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {lectures[currentLecture].video && (
                <p className="text-sm text-green-600 mt-2">✓ Video selected: {lectures[currentLecture].video.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Course Materials (PDF, Images, Audio, Quiz, etc.)
              </label>
              <input
                id="materials"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.mp3,.wav,.zip"
                multiple
                onChange={handleMaterialUpload}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {lectures[currentLecture].materials.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700 font-semibold">Materials ({lectures[currentLecture].materials.length}):</p>
                  {lectures[currentLecture].materials.map((material, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-green-600">
                      <span>✓ {material.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(idx)}
                        className="text-red-600 hover:underline ml-2"
                      >
                        remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : messageType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : ''}`}>
                {message}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePreviousLecture}
                disabled={currentLecture === 0}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentLecture < lectures.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextLecture}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Next Lecture
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Complete & Upload Course'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
