import Image from "next/image";

type LogoProps = {
  height?: number;
  width?: number;
  className?: string;
};

export default function Logo({ height = 80, width, className = "" }: LogoProps) {
  // Calculate width based on the logo's natural aspect ratio
  // The logo is more of a square with the text stacked vertically
  const calculatedWidth = width || Math.round(height * 1.1); // Slightly wider than tall

  return (
    <Image
      src="/logo.png"
      alt="Motion Wealth Group Logo"
      height={height}
      width={calculatedWidth}
      sizes="(max-width: 640px) 240px, (max-width: 768px) 300px, 360px"
      style={{ 
        height: 'auto',
        maxHeight: height,
        objectFit: 'contain'
      }}
      priority
      className={`rounded w-auto ${className}`}
    />
  );
} 