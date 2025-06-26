'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  questionId: string
  isVisible: boolean
  onCancel: () => void
}

export function CommentForm({ questionId, isVisible, onCancel }: CommentFormProps) {
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          name: name.trim() || 'Anonymous',
          comment: comment.trim(),
        }),
      })

      if (response.ok) {
        setName('')
        setComment('')
        onCancel()
        
        // Revalidate the specific page
        await fetch(`/api/revalidate?path=/open-questions`, { method: 'POST' })
        router.refresh()
      } else {
        console.error('Failed to submit comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setComment('')
    onCancel()
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          />
        </div>
        <div>
          <textarea
            placeholder="Your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!comment.trim() || isSubmitting}
            className="px-3 py-1 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

interface AddCommentButtonProps {
  onClick: () => void
}

export function AddCommentButton({ onClick }: AddCommentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
    >
      Add comment
    </button>
  )
} 