import { QuestionComment } from './utils'
import { renderRichText } from '@/app/components/notion-renderer'

interface CommentsListProps {
  comments: QuestionComment[]
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="border-l-2 border-neutral-200 dark:border-neutral-700 pl-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-neutral-900 dark:text-neutral-100">
                {comment.authorName}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {renderRichText(comment.content)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 