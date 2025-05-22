/**
 * Image optimization utilities
 */

interface ImageSizes {
  default: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

/**
 * Generate responsive image sizes attribute
 * @param sizes - Object containing size definitions for different breakpoints
 * @returns Formatted sizes string for next/image
 */
export function getResponsiveSizes({
  default: defaultSize,
  sm = defaultSize,
  md = defaultSize,
  lg = defaultSize,
  xl = defaultSize
}: ImageSizes): string {
  return `
    (max-width: 640px) ${sm},
    (max-width: 768px) ${md},
    (max-width: 1024px) ${lg},
    (max-width: 1280px) ${xl},
    ${defaultSize}
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Get optimal quality for different image types
 * @param src - Image source URL
 * @returns Quality value (0-100)
 */
export function getOptimalQuality(src: string): number {
  const extension = src.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 80; // JPEG can use moderate compression
    case 'png':
      return 90; // PNG needs higher quality
    case 'webp':
      return 75; // WebP is already efficient
    default:
      return 85; // Default quality
  }
}

/**
 * Determine if an image should be loaded with priority
 * @param index - Index of the image in the list
 * @param isHero - Whether this is a hero/featured image
 * @returns Whether to use priority loading
 */
export function shouldPrioritize(index = 0, isHero = false): boolean {
  // Prioritize hero images and first few images in a list
  return isHero || index < 3;
}

/**
 * Generate blurred placeholder for images
 * This is a placeholder for a more sophisticated solution
 * In a real implementation, you would generate actual blurry placeholders
 */
export function getBlurDataUrl(): string {
  // In a real implementation, you would generate this based on the image
  // For now, returning a transparent data URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
} 