/**
 * Generates structured data for various page types
 */

export interface WebsiteData {
  name: string;
  url: string;
  description?: string;
  logo?: string;
  sameAs?: string[];
}

export interface OrganizationData extends WebsiteData {
  email?: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface BlogPostData {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName: string;
  publisherLogo?: string;
  image?: string;
  category?: string;
}

/**
 * Generates WebSite structured data
 */
export function generateWebsiteSchema(data: WebsiteData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
    description: data.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${data.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates Organization structured data
 */
export function generateOrganizationSchema(data: OrganizationData) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
    description: data.description
  };
  
  if (data.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs;
  }
  
  if (data.email) {
    schema.email = data.email;
  }
  
  if (data.telephone) {
    schema.telephone = data.telephone;
  }
  
  if (data.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...data.address
    };
  }
  
  return schema;
}

/**
 * Generates BlogPosting structured data
 */
export function generateBlogPostSchema(data: BlogPostData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.authorName,
      ...(data.authorUrl && { url: data.authorUrl })
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisherName,
      logo: {
        '@type': 'ImageObject',
        url: data.publisherLogo || ''
      }
    },
    ...(data.image && {
      image: {
        '@type': 'ImageObject',
        url: data.image
      }
    }),
    ...(data.category && { articleSection: data.category })
  };
}

/**
 * Generates BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string, url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

/**
 * Generates FAQPage structured data
 */
export function generateFAQSchema(questions: Array<{ question: string, answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  };
} 