'use client'
import { useState } from 'react'
import { renderRichText } from '@/app/components/notion-renderer'
import { CommentForm, AddCommentButton } from './comment-form'
import { CommentsList } from './comments-list'

interface QuestionItemProps {
  question: any
  comments: any[]
}

export function QuestionItem({ question, comments }: QuestionItemProps) {
  const [isFormVisible, setIsFormVisible] = useState(false)

  return (
    <article className="space-y-4">
      <div className='prose'>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed">
              {renderRichText(question.title)}
            </p>
            {question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 not-prose">
                {question.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 not-prose">
            <AddCommentButton 
              onClick={() => setIsFormVisible(!isFormVisible)}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <CommentsList comments={comments} />
        <CommentForm 
          questionId={question.id}
          isVisible={isFormVisible}
          onCancel={() => setIsFormVisible(false)}
        />
      </div>
    </article>
  )
} 