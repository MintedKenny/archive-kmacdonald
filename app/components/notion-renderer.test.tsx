import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NotionRenderer } from './notion-renderer'
import { NotionBlock } from '@/lib/notion-client'

// Simple mock for react-tweet
vi.mock('react-tweet', () => ({
  Tweet: () => <div>Mocked Tweet</div>
}))

describe('NotionRenderer', () => {
  it('renders paragraph blocks correctly', () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Hello, world!' },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Hello, world!'
            }
          ]
        }
      }
    ]

    render(<NotionRenderer blocks={blocks} />)
    expect(screen.getByText('Hello, world!')).toBeInTheDocument()
  })

  it('renders headings with correct hierarchy', () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'heading_1',
        has_children: false,
        heading_1: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Main Title' },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Main Title'
            }
          ]
        }
      }
    ]

    render(<NotionRenderer blocks={blocks} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Title')
  })

  it('handles empty paragraphs with proper spacing', () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: { rich_text: [] }
      }
    ]

    render(<NotionRenderer blocks={blocks} />)
    const emptyDiv = document.querySelector('.my-6')
    expect(emptyDiv).toBeInTheDocument()
  })

  it('renders lists correctly', () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'First item' },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'First item'
            }
          ]
        }
      },
      {
        id: '2',
        type: 'bulleted_list_item',
        has_children: false,
        bulleted_list_item: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Second item' },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Second item'
            }
          ]
        }
      }
    ]

    render(<NotionRenderer blocks={blocks} />)
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
    
    const list = document.querySelector('ul')
    expect(list).toBeInTheDocument()
    expect(list).toHaveClass('list-disc')
  })

  it('renders rich text formatting correctly', () => {
    const blocks: NotionBlock[] = [
      {
        id: '1',
        type: 'paragraph',
        has_children: false,
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'Bold text' },
              annotations: {
                bold: true,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default'
              },
              plain_text: 'Bold text'
            }
          ]
        }
      }
    ]

    render(<NotionRenderer blocks={blocks} />)
    expect(screen.getByText('Bold text')).toBeInTheDocument()
    expect(screen.getByText('Bold text').tagName).toBe('STRONG')
  })
}) 