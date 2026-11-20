import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  className,
  containerClassName,
  alt,
  loading = 'lazy',
  decoding = 'async',
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(event);
    }
  };

  return (
    <div className={cn('relative overflow-hidden bg-gray-800/20 dark:bg-white/5', containerClassName)}>
      {!isLoaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
      )}
      <img
        {...props}
        loading={loading}
        decoding={decoding}
        alt={alt ?? 'Project Image'}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-700 ease-in-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  );
};
