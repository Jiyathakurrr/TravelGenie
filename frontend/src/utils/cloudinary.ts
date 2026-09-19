/**
 * Cloudinary image helper with reliable fallbacks from the configured Cloudinary account (soootttd).
 */

export const CLOUDINARY_CLOUD_NAME = 'soootttd';

// Reliable Cloudinary sample assets from the soootttd account
export const CLOUDINARY_FALLBACKS = {
  mountains: 'https://res.cloudinary.com/soootttd/image/upload/v1789541273/samples/landscapes/nature-mountains.jpg',
  beach: 'https://res.cloudinary.com/soootttd/image/upload/v1789541272/samples/landscapes/beach-boat.jpg',
  heritage: 'https://res.cloudinary.com/soootttd/image/upload/v1789541271/samples/landscapes/architecture-signs.jpg',
  scenic: 'https://res.cloudinary.com/soootttd/image/upload/v1789541273/samples/landscapes/landscape-panorama.jpg',
  urban: 'https://res.cloudinary.com/soootttd/image/upload/v1789541269/samples/landscapes/girl-urban-view.jpg',
  default: 'https://res.cloudinary.com/soootttd/image/upload/v1789541283/cld-sample-2.jpg',
  food: 'https://res.cloudinary.com/soootttd/image/upload/v1789541272/samples/food/spices.jpg',
  hotel: 'https://res.cloudinary.com/soootttd/image/upload/v1789541280/samples/chair-and-coffee-table.jpg',
};

export function getFallbackForCategory(category?: string): string {
  if (!category) return CLOUDINARY_FALLBACKS.default;
  const cat = category.toLowerCase();
  if (cat.includes('mountain') || cat.includes('hill') || cat.includes('trek')) {
    return CLOUDINARY_FALLBACKS.mountains;
  }
  if (cat.includes('beach') || cat.includes('coast') || cat.includes('island')) {
    return CLOUDINARY_FALLBACKS.beach;
  }
  if (cat.includes('heritage') || cat.includes('pilgrim') || cat.includes('temple') || cat.includes('fort')) {
    return CLOUDINARY_FALLBACKS.heritage;
  }
  if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('valley')) {
    return CLOUDINARY_FALLBACKS.scenic;
  }
  if (cat.includes('city') || cat.includes('town') || cat.includes('urban')) {
    return CLOUDINARY_FALLBACKS.urban;
  }
  if (cat.includes('hotel') || cat.includes('resort') || cat.includes('accommodation')) {
    return CLOUDINARY_FALLBACKS.hotel;
  }
  return CLOUDINARY_FALLBACKS.default;
}

export function resolveCloudinaryUrl(
  images?: Array<{ url?: string; publicId?: string }>,
  category?: string
): string {
  const fallback = getFallbackForCategory(category);
  if (!images || images.length === 0) {
    return fallback;
  }
  const first = images[0];
  if (first.url && first.url.startsWith('http')) {
    return first.url;
  }
  if (first.publicId) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${first.publicId}.jpg`;
  }
  return fallback;
}
