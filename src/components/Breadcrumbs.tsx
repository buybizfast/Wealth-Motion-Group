'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrentPage: boolean;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  homeLabel?: string;
  className?: string;
}

/**
 * Component for displaying breadcrumb navigation
 * @param customItems - Custom breadcrumb items to use instead of automatically generated ones
 * @param homeLabel - Label for the home page
 * @param className - Additional CSS classes
 */
export default function Breadcrumbs({ 
  customItems, 
  homeLabel = 'Home', 
  className = '' 
}: BreadcrumbsProps) {
  const pathname = usePathname() || '/';
  
  // Generate breadcrumb items based on the current path
  const breadcrumbItems = useMemo(() => {
    if (customItems) return customItems;
    
    // Split the path and create breadcrumb items
    const pathSegments = pathname
      .split('/')
      .filter(segment => segment !== '');
    
    const items: BreadcrumbItem[] = [
      { label: homeLabel, path: '/', isCurrentPage: pathname === '/' }
    ];
    
    // Build breadcrumb items with cumulative paths
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLastSegment = index === pathSegments.length - 1;
      
      // Format the label (capitalize and replace hyphens with spaces)
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\[([^\]]+)\]/g, ':$1') // Replace [param] with :param
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      items.push({
        label,
        path: currentPath,
        isCurrentPage: isLastSegment
      });
    });
    
    return items;
  }, [pathname, customItems, homeLabel]);

  // Don't render on the home page
  if (pathname === '/' && !customItems) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-mwg-muted">/</span>
            )}
            
            {item.isCurrentPage ? (
              <span className="text-mwg-muted font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.path}
                className="text-mwg-accent hover:underline"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 