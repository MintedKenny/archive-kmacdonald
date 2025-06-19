'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { ArrowIcon } from './arrow-icon'

export default function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText('kenneth.macdoanld96@gmail.com')
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  return (
    <footer className="mb-16">
      <hr className="border-t border-neutral-300 dark:border-neutral-700 mb-8" />
      <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-600 md:flex-row md:space-x-4 md:space-y-0 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="/rss"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">rss</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/kenneth-macdonald/"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">linkedin</p>
          </a>
        </li>
        <li>
          <button
            className={`flex items-center transition-all cursor-pointer ${
              emailCopied 
                ? 'text-green-400 dark:text-green-600' 
                : 'hover:text-neutral-800 dark:hover:text-neutral-100'
            }`}
            onClick={copyEmail}
          >
            {emailCopied ? (
              <Check size={12} />
            ) : (
              <ArrowIcon />
            )}
            <p className="ml-2 h-7">
              {emailCopied ? 'copied' : 'email'}
            </p>
          </button>
        </li>
        {/* <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/vercel/next.js"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">github</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://vercel.com/templates/next.js/portfolio-starter-kit"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">view source</p>
          </a>
        </li> */}
      </ul>
      <p className="mt-8 text-neutral-600 dark:text-neutral-300">
        {new Date().getFullYear()} @ Kenneth MacDonald
      </p>
    </footer>
  )
}
