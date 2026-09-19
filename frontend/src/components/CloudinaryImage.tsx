import React, { useState } from 'react';
import { getFallbackForCategory, resolveCloudinaryUrl } from '../utils/cloudinary';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  images?: Array<{ url?: string; publicId?: string; altText?: string }>;
  src?: string;
  category?: string;
  alt: string;
  className?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  images,
  src,
  category,
  alt,
  className = '',
  ...props
}) => {
  const initialUrl = src || resolveCloudinaryUrl(images, category);
  const [currentSrc, setCurrentSrc] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(getFallbackForCategory(category));
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt || 'TravelGenie destination'}
      className={className}
      onError={handleError}
      loading="lazy"
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};
