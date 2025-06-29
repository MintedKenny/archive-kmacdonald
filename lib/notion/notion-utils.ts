// Extract URL from page properties
export function extractUrlFromPage(page: any): string | null {
  try {
    // Check common URL property names
    const urlProperty = page.properties.URL || 
                       page.properties.url || 
                       page.properties.Link || 
                       page.properties.link
    
    if (urlProperty && urlProperty.url) {
      return urlProperty.url
    }
    return null
  } catch (error) {
    console.error('Error extracting URL from page:', error)
    return null
  }
}

// Extract title from page properties  
export function extractTitleFromPage(page: any): string | null {
  try {
    // Look for title property - could be 'Title', 'Name', or the first title property
    const titleProperty = page.properties.Title || 
                          page.properties.title || 
                          page.properties.Name || 
                          page.properties.name
    
    if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
      return titleProperty.title[0].plain_text
    }
    return null
  } catch (error) {
    console.error('Error extracting title from page:', error)
    return null
  }
}

// Extract any text property from page
export function extractTextProperty(page: any, propertyName: string): string | null {
  try {
    const property = page.properties[propertyName]
    
    if (!property) return null
    
    // Handle different property types
    switch (property.type) {
      case 'title':
        return property.title?.[0]?.plain_text || null
      case 'rich_text':
        return property.rich_text?.[0]?.plain_text || null
      case 'select':
        return property.select?.name || null
      case 'multi_select':
        return property.multi_select?.map((item: any) => item.name).join(', ') || null
      default:
        return null
    }
  } catch (error) {
    console.error(`Error extracting ${propertyName} from page:`, error)
    return null
  }
}

// Create property objects for updating pages
export function createTitleProperty(text: string) {
  return {
    title: [
      {
        type: 'text',
        text: {
          content: text
        }
      }
    ]
  }
}

export function createSelectProperty(value: string) {
  return {
    select: {
      name: value
    }
  }
}

export function createStatusProperty(status: string) {
  return {
    status: {
      name: status
    }
  }
} 