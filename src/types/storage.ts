/**
 * Storage Types
 * TypeScript types for Supabase Storage operations
 */

// ============================================
// STORAGE CONFIGURATION
// ============================================

/**
 * Storage bucket name for calendar images
 */
export const STORAGE_BUCKET = 'calendar-images' as const;

/**
 * Supported image file types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ============================================
// FILE PATH TYPES
// ============================================

/**
 * Storage folder types
 */
export type StorageFolder = 'friends' | 'shared' | 'placeholders';

/**
 * Image path structure
 */
export interface ImagePath {
  folder: StorageFolder;
  subfolder?: string;
  filename: string;
}

/**
 * Friend image path structure
 */
export interface FriendImagePath extends ImagePath {
  folder: 'friends';
  subfolder: string; // friend-id
  filename: string; // window-{number}.{ext}
}

// ============================================
// UPLOAD TYPES
// ============================================

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  file: File;
  path: string;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
    fullPath: string;
    extension?: string;
  };
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Bulk upload options
 */
export interface BulkUploadOptions {
  files: File[];
  friendId?: string;
  onProgress?: (current: number, total: number) => void;
  onError?: (filename: string, error: string) => void;
}

/**
 * Bulk upload result
 */
export interface BulkUploadResult {
  success: boolean;
  uploaded: number;
  failed: number;
  results: ImageUploadResult[];
}

// ============================================
// RETRIEVAL TYPES
// ============================================

/**
 * Image retrieval options
 */
export interface ImageRetrievalOptions {
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  name: string;
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
  publicUrl: string;
}

/**
 * List images result
 */
export interface ListImagesResult {
  success: boolean;
  data?: ImageMetadata[];
  error?: {
    message: string;
    code?: string;
  };
}

// ============================================
// PLACEHOLDER TYPES
// ============================================

/**
 * Placeholder image service
 */
export interface PlaceholderService {
  getPlaceholderUrl: (width: number, height: number, text?: string) => string;
  getFriendPlaceholder: (friendName: string) => string;
  getWindowPlaceholder: (windowNumber: number) => string;
}

/**
 * Placeholder configuration
 */
export interface PlaceholderConfig {
  service: 'unsplash' | 'picsum' | 'placeholder' | 'custom';
  baseUrl?: string;
  defaultWidth: number;
  defaultHeight: number;
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Image validation result
 */
export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Image validation options
 */
export interface ImageValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}
