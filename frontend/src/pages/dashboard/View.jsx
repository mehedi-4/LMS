import { useState, useEffect } from 'react'

export default function View({ user }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [expandedLecture, setExpandedLecture] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:5000/api/courses/instructor/${user?.id}`)
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

  const toggleCourseExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId)
    setExpandedLecture(null)
  }

  const toggleLectureExpand = (lectureId) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId)
  }

  if (loading) {
    return (
      <div className="max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">View Courses</h2>
        <p className="text-gray-600 mb-8">Preview what students will see when accessing your courses</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="text-gray-500 mt-2">Start by uploading your first course to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Course Header */}
                <button
                  onClick={() => toggleCourseExpand(course.id)}
                  className="w-full bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 p-6 transition flex justify-between items-start"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      {/* <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        {course.num_lectures} lectures
                      </span> */}
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        ${course.price}
                      </span>
                      {/* <span className="text-gray-500">
                        Created: {new Date(course.created_at).toLocaleDateString()}
                      </span> */}
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition transform ${
                      expandedCourse === course.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Course Details */}
                {expandedCourse === course.id && (
                  <div className="border-t border-gray-200 bg-white">
                    {/* Course Info */}
                    <div className="p-6 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2">Course Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
                    </div>

                    {/* Lectures */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Lectures ({course.lectures?.length || 0})
                      </h4>

                      {course.lectures && course.lectures.length > 0 ? (
                        <div className="space-y-3">
                          {course.lectures.map((lecture) => (
                            <div key={lecture.id} className="border border-gray-200 rounded-lg overflow-hidden">
                              {/* Lecture Header */}
                              <button
                                onClick={() => toggleLectureExpand(lecture.id)}
                                className="w-full bg-gray-50 hover:bg-gray-100 p-4 transition flex justify-between items-center"
                              >
                                <div className="text-left">
                                  <p className="font-semibold text-gray-900">
                                    Lecture {lecture.lecture_number}: {lecture.title}
                                  </p>
                                  {lecture.video_path && (
                                    <p className="text-sm text-gray-500 mt-1">📹 Video included</p>
                                  )}
                                </div>
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition transform ${
                                    expandedLecture === lecture.id ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                  />
                                </svg>
                              </button>

                              {/* Lecture Details */}
                              {expandedLecture === lecture.id && (
                                <div className="bg-white border-t border-gray-200 p-4 space-y-4">
                                  {/* Video Player */}
                                  {lecture.video_path && (
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-2">Video</p>
                                      <video
                                        controls
                                        className="w-full rounded-lg bg-black max-h-96"
                                        src={`http://localhost:5000${lecture.video_path}`}
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  )}

                                  {/* Materials */}
                                  {lecture.materials && lecture.materials.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-2">
                                        Course Materials ({lecture.materials.length})
                                      </p>
                                      <div className="space-y-2">
                                        {lecture.materials.map((material) => (
                                          <a
                                            key={material.id}
                                            href={`http://localhost:5000${material.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                                          >
                                            <div className="flex-1">
                                              <p className="font-medium text-gray-900 group-hover:text-indigo-600">
                                                {material.file_name}
                                              </p>
                                              <p className="text-sm text-gray-500">{material.material_type}</p>
                                            </div>
                                            <svg
                                              className="w-5 h-5 text-gray-400 group-hover:text-indigo-600"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                              />
                                            </svg>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {!lecture.video_path && (!lecture.materials || lecture.materials.length === 0) && (
                                    <p className="text-gray-500 italic">No content available for this lecture</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No lectures added to this course</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  )
}
