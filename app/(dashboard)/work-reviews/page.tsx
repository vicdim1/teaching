'use client'

import { useEffect, useState } from 'react'
import { Plus, Image as ImageIcon, Trash2, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

type WorkReview = {
  id: string
  date: string
  imageUrl: string | null
  description: string | null
  aiAnalysis: string | null
  tutorNotes: string | null
  student: {
    id: string
    firstName: string
    lastName: string
  }
}

type Student = {
  id: string
  firstName: string
  lastName: string
  active: boolean
}

export default function WorkReviewsPage() {
  const [workReviews, setWorkReviews] = useState<WorkReview[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedReview, setSelectedReview] = useState<WorkReview | null>(null)

  const loadWorkReviews = async () => {
    try {
      const response = await fetch('/api/work-reviews')
      const data = await response.json()
      setWorkReviews(data)
    } catch (error) {
      console.error('Error loading work reviews:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data.filter((s: any) => s.active))
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
    loadWorkReviews()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work review?')) {
      return
    }

    try {
      await fetch(`/api/work-reviews/${id}`, { method: 'DELETE' })
      loadWorkReviews()
    } catch (error) {
      console.error('Error deleting work review:', error)
      alert('Failed to delete work review')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Creative/Artistic Theme */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1920&q=80"
          alt="Art and Creativity"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/60 to-pink-900/60"></div>
      </div>

      <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Work Reviews</h1>
          <p className="mt-2 text-purple-50 drop-shadow">
            Upload and analyze student work with AI assistance.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Work Review
        </button>
      </div>

      {showForm && (
        <WorkReviewForm
          students={students}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            loadWorkReviews()
          }}
        />
      )}

      {selectedReview && (
        <WorkReviewDetail
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onUpdate={() => {
            setSelectedReview(null)
            loadWorkReviews()
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workReviews.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/30">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-2 text-slate-500">
              No work reviews yet. Upload student work to get started.
            </p>
          </div>
        ) : (
          workReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/95 backdrop-blur-md overflow-hidden shadow-2xl rounded-xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              {review.imageUrl ? (
                <div className="relative h-48 bg-slate-100">
                  <Image
                    src={review.imageUrl}
                    alt="Student work"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-900">
                    {review.student.firstName} {review.student.lastName}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(review.id)
                    }}
                    className="text-rose-600 hover:text-rose-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  {formatDate(review.date)}
                </p>
                {review.description && (
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {review.description}
                  </p>
                )}
                {review.aiAnalysis && (
                  <div className="mt-2 flex items-center text-xs text-blue-700">
                    <Eye className="w-3 h-3 mr-1" />
                    AI Analysis Available
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}

function WorkReviewForm({
  students,
  onClose,
  onSuccess,
}: {
  students: Student[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    description: '',
    tutorNotes: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('studentId', formData.studentId)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('tutorNotes', formData.tutorNotes)
      if (selectedFile) {
        formDataToSend.append('image', selectedFile)
      }

      const response = await fetch('/api/work-reviews', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to create work review')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-slate-200 w-full max-w-2xl shadow-2xl rounded-xl bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Add Work Review
          </h3>

          {error && (
            <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student *
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description/Context
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="What is this work about?"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Notes
              </label>
              <textarea
                rows={3}
                value={formData.tutorNotes}
                onChange={(e) =>
                  setFormData({ ...formData, tutorNotes: e.target.value })
                }
                placeholder="Add your own observations and notes"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-200">
              If you upload an image, it will be automatically analyzed by AI to provide feedback.
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Analyzing...' : 'Create Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function WorkReviewDetail({
  review,
  onClose,
  onUpdate,
}: {
  review: WorkReview
  onClose: () => void
  onUpdate: () => void
}) {
  const [tutorNotes, setTutorNotes] = useState(review.tutorNotes || '')
  const [editing, setEditing] = useState(false)

  const handleUpdate = async () => {
    try {
      await fetch(`/api/work-reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorNotes }),
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating work review:', error)
      alert('Failed to update notes')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border border-slate-200 w-full max-w-4xl shadow-2xl rounded-xl bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium text-slate-900">
                {review.student.firstName} {review.student.lastName}
              </h3>
              <p className="text-sm text-slate-500">{formatDate(review.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="space-y-4">
            {review.imageUrl && (
              <div className="relative h-96 bg-slate-100 rounded-xl overflow-hidden">
                <Image
                  src={review.imageUrl}
                  alt="Student work"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {review.description && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-700">{review.description}</p>
              </div>
            )}

            {review.aiAnalysis && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">AI Analysis</h4>
                <div className="text-blue-800 whitespace-pre-wrap">
                  {review.aiAnalysis}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-slate-900">Your Notes</h4>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={tutorNotes}
                    onChange={(e) => setTutorNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setTutorNotes(review.tutorNotes || '')
                        setEditing(false)
                      }}
                      className="px-3 py-1 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleUpdate()
                        setEditing(false)
                      }}
                      className="px-3 py-1 text-sm bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg hover:from-blue-800 hover:to-blue-600 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700">
                  {review.tutorNotes || 'No notes yet.'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
