import React, { useState } from 'react';

interface LuxuryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  containerClassName?: string;
}

export const LuxuryImage: React.FC<LuxuryImageProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-4/3',
  containerClassName = '',
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = '/logo.png';

  return (
    <div
      className={`relative overflow-hidden bg-stone-100 ${aspectRatio} ${containerClassName}`}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Image */}
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default LuxuryImage;
