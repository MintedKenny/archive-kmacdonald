import { getOpenQuestions, getQuestionComments } from './utils'
import { QuestionItem } from './question-item'

export async function QuestionsList() {
  const questions = await getOpenQuestions()

  if (questions.length === 0) {
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        No questions published yet.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {questions.map(async (question) => {
        const comments = await getQuestionComments(question.id)
        
        return (
          <QuestionItem key={question.id} question={question} comments={comments} />
        )
      })}
    </div>
  )
} 