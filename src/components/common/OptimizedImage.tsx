import { Avatar, Skeleton } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { INTERSECTION_OBSERVER_THRESHOLD } from '../../constants/app-config';

interface OptimizedImageProps {
  src?: string;
  alt: string;
  size?: number;
  fallback?: string;
  className?: string;
  lazy?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({ src, alt, size = 40, fallback, className, lazy = true }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(!lazy);
    const imgRef = useRef<HTMLDivElement>(null);

    const handleLoad = useCallback(() => {
      setLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setLoading(false);
      setError(true);
    }, []);

    useEffect(() => {
      if (!lazy || shouldLoad) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { threshold: INTERSECTION_OBSERVER_THRESHOLD },
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, [lazy, shouldLoad]);

    // Generate optimized image URL based on size
    const getOptimizedSrc = (originalSrc: string) => {
      if (!originalSrc) return fallback ?? '';

      // Add loading="lazy" optimization for images in tables
      // If using a CDN like Cloudinary, you can add transformation parameters
      // Example: return originalSrc.replace('/upload/', `/upload/c_fill,w_${size * 2},h_${size * 2},f_auto,q_auto/`);

      return originalSrc;
    };

    if (!src || error) {
      return (
        <Avatar
          ref={imgRef}
          className={className}
          sx={{ width: size, height: size }}
        >
          {alt.charAt(0).toUpperCase()}
        </Avatar>
      );
    }

    return (
      <div ref={imgRef}>
        {loading && shouldLoad && (
          <Skeleton
            variant="circular"
            width={size}
            height={size}
            className={className}
          />
        )}
        {shouldLoad ? (
          <Avatar
            src={getOptimizedSrc(src)}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={className}
            sx={{
              width: size,
              height: size,
              display: loading ? 'none' : 'flex',
            }}
          />
        ) : (
          <Skeleton
            variant="circular"
            width={size}
            height={size}
            className={className}
          />
        )}
      </div>
    );
  },
);
