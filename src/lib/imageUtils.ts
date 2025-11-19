/**
 * Image Utilities
 * Helper functions for image validation, optimization, and manipulation
 */

import type {
  ImageValidationResult,
  ImageValidationOptions,
} from '../types/storage';
import {
  SUPPORTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from '../types/storage';

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate an image file
 *
 * Note: This function performs synchronous validation of file type and size only.
 * Dimension-related options (maxWidth, maxHeight, minWidth, minHeight) are ignored.
 * For dimension validation, use validateImageDimensions() which performs async checks.
 *
 * @param file Image file to validate
 * @param options Validation options (dimension options are ignored)
 * @returns Validation result with any errors
 */
export function validateImage(
  file: File,
  options?: ImageValidationOptions
): ImageValidationResult {
  const errors: string[] = [];

  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = [...SUPPORTED_IMAGE_TYPES],
  } = options || {};

  // Check file type
  if (!allowedTypes.includes(file.type as typeof SUPPORTED_IMAGE_TYPES[number])) {
    errors.push(
      `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errors.push(
      `File too large: ${fileSizeMB}MB. Maximum size: ${maxSizeMB}MB`
    );
  }

  // Note: Dimension validation is ignored in this synchronous function.
  // Use validateImageDimensions() for async dimension checks.

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate image dimensions
 * @param file Image file to validate
 * @param options Validation options with dimension constraints
 * @returns Promise with validation result
 */
export async function validateImageDimensions(
  file: File,
  options: ImageValidationOptions
): Promise<ImageValidationResult> {
  const { maxWidth, maxHeight, minWidth, minHeight } = options;

  // First validate basic properties
  const basicValidation = validateImage(file, {
    ...options,
    maxWidth: undefined,
    maxHeight: undefined,
    minWidth: undefined,
    minHeight: undefined,
  });

  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Load image to check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const errors: string[] = [];

      if (maxWidth && img.width > maxWidth) {
        errors.push(`Image width ${img.width}px exceeds maximum ${maxWidth}px`);
      }

      if (maxHeight && img.height > maxHeight) {
        errors.push(
          `Image height ${img.height}px exceeds maximum ${maxHeight}px`
        );
      }

      if (minWidth && img.width < minWidth) {
        errors.push(`Image width ${img.width}px below minimum ${minWidth}px`);
      }

      if (minHeight && img.height < minHeight) {
        errors.push(
          `Image height ${img.height}px below minimum ${minHeight}px`
        );
      }

      resolve({
        valid: errors.length === 0,
        errors,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        errors: ['Failed to load image for dimension validation'],
      });
    };

    img.src = url;
  });
}

/**
 * Validate multiple images
 * @param files Array of image files to validate
 * @param options Validation options
 * @returns Array of validation results
 */
export function validateImages(
  files: File[],
  options?: ImageValidationOptions
): ImageValidationResult[] {
  return files.map((file) => validateImage(file, options));
}

// ============================================
// FILE MANIPULATION FUNCTIONS
// ============================================

/**
 * Get image dimensions
 * @param file Image file
 * @returns Promise with image width and height
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Compress an image file
 * @param file Image file to compress
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @param quality Quality (0-1)
 * @returns Promise with compressed file
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert image to WebP format
 * @param file Image file to convert
 * @param quality Quality (0-1)
 * @returns Promise with WebP file
 */
export async function convertToWebP(
  file: File,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }

          const filename = file.name.replace(/\.[^/.]+$/, '.webp');
          const webpFile = new File([blob], filename, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);

  return `${(bytes / Math.pow(k, clampedIndex)).toFixed(2)} ${sizes[clampedIndex]}`;
}

/**
 * Get file extension from filename
 * @param filename Filename
 * @returns File extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Generate a safe filename
 * @param originalName Original filename
 * @returns Safe filename with no special characters
 */
export function generateSafeFilename(originalName: string): string {
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

  // Replace special characters with hyphens
  const safeName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return extension ? `${safeName}.${extension}` : safeName;
}

/**
 * Extract window number from filename
 * @param filename Filename
 * @returns Window number or null
 */
export function extractWindowNumber(filename: string): number | null {
  const match = filename.match(/window[_-]?(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if browser supports WebP
 * @returns Promise with support status
 */
export async function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src =
      'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}

/**
 * Create a preview URL for an image file
 * @param file Image file
 * @returns Object URL for preview
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL
 * @param url Object URL to revoke
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
