import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { highlight } from 'sugar-high'
import { NotionBlock } from '@/lib/notion/notion-client'
import { Tweet } from 'react-tweet'

interface RichText {
  type: 'text' | 'mention' | 'equation'
  text?: {
    content: string
    link?: { url: string } | null
  }
  mention?: any
  equation?: { expression: string }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string | null
}

export function renderRichText(richText: RichText[]): React.ReactNode {
  return richText.map((text, index) => {
    const { annotations, plain_text, href, text: textObj } = text
    
    let content: React.ReactNode = plain_text
    
    // Apply annotations
    if (annotations.code) {
      content = <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{content}</code>
    }
    if (annotations.bold) content = <strong>{content}</strong>
    if (annotations.italic) content = <em>{content}</em>
    if (annotations.strikethrough) content = <s>{content}</s>
    if (annotations.underline) content = <u>{content}</u>
    
    // Handle links
    if (href || textObj?.link?.url) {
      const url = href || textObj?.link?.url || ''
      if (url.startsWith('/')) {
        content = <Link key={index} href={url}>{content}</Link>
      } else {
        content = <a key={index} href={url} target="_blank" rel="noopener noreferrer">{content}</a>
      }
    }
    
    return <span key={index}>{content}</span>
  })
}

const NotionBlockRenderer = React.memo(function NotionBlockRenderer({ block }: { block: NotionBlock }): React.ReactNode {
  const { type, id } = block
  const blockData = block[type] || {}
  
  switch (type) {
    case 'paragraph':
      const paragraphText = blockData.rich_text || []
      if (paragraphText.length === 0) {
        return <div key={id} className="my-6" />
      }
      
      // Check if it's a source attribution
      const firstText = paragraphText[0]?.plain_text || ''
      const isSourceAttribution = firstText.startsWith('Source') || firstText.startsWith('Inspiration')
      
      return (
        <p key={id} className={isSourceAttribution ? 'source-attribution' : undefined}>
          {renderRichText(paragraphText)}
        </p>
      )
      
    case 'heading_1':
      return (
        <h1 key={id}>
          {renderRichText(blockData.rich_text || [])}
        </h1>
      )
      
    case 'heading_2':
      return (
        <h2 key={id}>
          {renderRichText(blockData.rich_text || [])}
        </h2>
      )
      
    case 'heading_3':
      return (
        <h3 key={id}>
          {renderRichText(blockData.rich_text || [])}
        </h3>
      )
      
    case 'bulleted_list_item':
      return (
        <li key={id}>
          {renderRichText(blockData.rich_text || [])}
          {block.children && (
            <ul>
              {block.children.map((child: NotionBlock) => (
                <NotionBlockRenderer key={child.id} block={child} />
              ))}
            </ul>
          )}
        </li>
      )
      
    case 'numbered_list_item':
      return (
        <li key={id}>
          {renderRichText(blockData.rich_text || [])}
          {block.children && (
            <ol>
              {block.children.map((child: NotionBlock) => (
                <NotionBlockRenderer key={child.id} block={child} />
              ))}
            </ol>
          )}
        </li>
      )
      
    case 'code':
      const codeContent = blockData.rich_text?.[0]?.plain_text || ''
      const highlightedCode = highlight(codeContent)
      
      return (
        <pre key={id}>
          <code 
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      )
      
    case 'quote':
      return (
        <blockquote key={id}>
          {renderRichText(blockData.rich_text || [])}
        </blockquote>
      )
      
    case 'callout':
      const icon = blockData.icon?.emoji || '💡'
      return (
        <div key={id} className="callout">
          <span className="callout-icon">{icon}</span>
          <div className="callout-content">
            {renderRichText(blockData.rich_text || [])}
          </div>
        </div>
      )
      
    case 'divider':
      return <hr key={id} />
      
    case 'image':
      const imageUrl = blockData.file?.url || blockData.external?.url
      const caption = blockData.caption?.[0]?.plain_text || ''
      
      if (!imageUrl) return null
      
      return (
        <figure key={id} className="my-6">
          <Image
            src={imageUrl}
            alt={caption}
            width={800}
            height={600}
            className="rounded-lg"
          />
          {caption && (
            <figcaption className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      )
      
    case 'bookmark':
    case 'link_preview':
      const url = blockData.url
      const title = blockData.title || url
      
      // Handle X/Twitter posts
      if (url?.includes('x.com') || url?.includes('twitter.com')) {
        const tweetId = url.split('/').pop()?.split('?')[0]
        if (tweetId) {
          return (
            <div key={id} className="my-3">
              <div className="scale-75 origin-top-left -mb-18">
                <Tweet id={tweetId} />
              </div>
            </div>
          )
        }
      }
      
      return (
        <div key={id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 my-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <a href={url} target="_blank" rel="noopener noreferrer" className="block">
            <div className="font-medium text-blue-600 dark:text-blue-400">{title}</div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{url}</div>
          </a>
        </div>
      )
      
    case 'embed':
      const embedUrl = blockData.url
      
      if (embedUrl?.includes('youtube.com') || embedUrl?.includes('youtu.be')) {
        const videoId = embedUrl.includes('youtu.be') 
          ? embedUrl.split('/').pop() 
          : new URL(embedUrl).searchParams.get('v')
          
        return (
          <div key={id} className="my-6">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          </div>
        )
      }
      
      // Handle X/Twitter embeds
      if (embedUrl?.includes('x.com') || embedUrl?.includes('twitter.com')) {
        const tweetId = embedUrl.split('/').pop()?.split('?')[0]
        if (tweetId) {
          return (
            <div key={id} className="my-3">
              <div className="scale-75 origin-top-left -mb-18">
                <Tweet id={tweetId} />
              </div>
            </div>
          )
        }
      }
      
      return (
        <div key={id} className="my-6">
          <iframe src={embedUrl} className="w-full h-96 rounded-lg border" />
        </div>
      )
      
    default:
      console.warn(`Unsupported block type: ${type}`)
      return null
  }
})

function groupBlocks(blocks: NotionBlock[]): NotionBlock[][] {
  const groups: NotionBlock[][] = []
  let currentGroup: NotionBlock[] = []
  let currentListType: string | null = null
  
  for (const block of blocks) {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      if (currentListType === block.type) {
        currentGroup.push(block)
      } else {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup])
          currentGroup = []
        }
        currentListType = block.type
        currentGroup.push(block)
      }
    } else {
      if (currentGroup.length > 0) {
        groups.push([...currentGroup])
        currentGroup = []
        currentListType = null
      }
      groups.push([block])
    }
  }
  
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  
  return groups
}

export const NotionRenderer = React.memo(function NotionRenderer({ blocks }: { blocks: NotionBlock[] }) {
  const groupedBlocks = groupBlocks(blocks)
  
  return (
    <div className="max-w-none">
      {groupedBlocks.map((group, groupIndex) => {
        if (group.length === 1 && group[0]) {
          return <NotionBlockRenderer key={group[0].id} block={group[0]} />
        }
        
        const listType = group[0]?.type
        const ListComponent = listType === 'bulleted_list_item' ? 'ul' : 'ol'
        const listClass = listType === 'bulleted_list_item' ? 'list-disc pl-6' : 'list-decimal pl-6'
        
        return (
          <ListComponent key={groupIndex} className={listClass}>
            {group.map((block) => (
              <NotionBlockRenderer key={block.id} block={block} />
            ))}
          </ListComponent>
        )
      })}
    </div>
  )
})