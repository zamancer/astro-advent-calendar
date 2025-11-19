/**
 * Storage Service
 * Handles image uploads and retrieval from Supabase Storage
 */

import { supabase } from './supabase';
import type {
  ImageUploadOptions,
  ImageUploadResult,
  BulkUploadOptions,
  BulkUploadResult,
  ImageRetrievalOptions,
  ListImagesResult,
  ImageMetadata,
} from '../types/storage';
import { STORAGE_BUCKET } from '../types/storage';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build the storage path for a friend's window image
 * @param friendId Friend's unique ID
 * @param windowNumber Window number (1-24)
 * @param extension File extension (without dot)
 * @returns Storage path
 */
function buildFriendImagePath(
  friendId: string,
  windowNumber: number,
  extension: string
): string {
  return `friends/${friendId}/window-${windowNumber}.${extension}`;
}

/**
 * Extract file extension from filename
 * @param filename Filename
 * @returns Extension without dot
 */
function extractExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload a single image to Supabase Storage
 * @param options Upload options including file and path
 * @returns Upload result with public URL
 */
export async function uploadImage(
  options: ImageUploadOptions
): Promise<ImageUploadResult> {
  if (!supabase) {
    return {
      success: false,
      error: {
        message: 'Supabase is not configured',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
    };
  }

  const {
    file,
    path,
    contentType = file.type,
    cacheControl = '3600',
    upsert = true,
  } = options;

  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        contentType,
        cacheControl,
        upsert,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl,
        fullPath: `${STORAGE_BUCKET}/${data.path}`,
      },
    };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNEXPECTED_ERROR',
      },
    };
  }
}

/**
 * Upload a friend's image for a specific window
 * @param friendId Friend's unique ID
 * @param windowNumber Window number (1-24)
 * @param file Image file to upload
 * @returns Upload result with public URL and extension
 */
export async function uploadFriendImage(
  friendId: string,
  windowNumber: number,
  file: File
): Promise<ImageUploadResult> {
  // Extract file extension
  const extension = extractExtension(file.name);

  // Build path: friends/{friend-id}/window-{number}.{ext}
  const path = buildFriendImagePath(friendId, windowNumber, extension);

  const result = await uploadImage({
    file,
    path,
  });

  // Include extension in result for consistent retrieval
  if (result.success && result.data) {
    result.data.extension = extension;
  }

  return result;
}

/**
 * Upload a shared image
 * @param filename Filename for the shared image
 * @param file Image file to upload
 * @returns Upload result with public URL
 */
export async function uploadSharedImage(
  filename: string,
  file: File
): Promise<ImageUploadResult> {
  const path = `shared/${filename}`;

  return uploadImage({
    file,
    path,
  });
}

/**
 * Upload multiple images in bulk
 * @param options Bulk upload options
 * @returns Bulk upload result with statistics
 */
export async function bulkUploadImages(
  options: BulkUploadOptions
): Promise<BulkUploadResult> {
  const { files, friendId, onProgress, onError } = options;

  const results: ImageUploadResult[] = [];
  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Determine upload path
    let result: ImageUploadResult;

    if (friendId) {
      // Extract window number from filename if possible
      const windowMatch = file.name.match(/window[_-]?(\d+)/i);
      const windowNumber = windowMatch ? parseInt(windowMatch[1], 10) : i + 1;

      result = await uploadFriendImage(friendId, windowNumber, file);
    } else {
      result = await uploadSharedImage(file.name, file);
    }

    results.push(result);

    if (result.success) {
      uploaded++;
    } else {
      failed++;
      if (onError && result.error) {
        onError(file.name, result.error.message);
      }
    }

    // Report progress
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return {
    success: failed === 0,
    uploaded,
    failed,
    results,
  };
}

// ============================================
// RETRIEVAL FUNCTIONS
// ============================================

/**
 * Get public URL for an image
 * @param path Image path in storage
 * @param options Optional transformation options
 * @returns Public URL for the image
 */
export function getImageUrl(
  path: string,
  options?: ImageRetrievalOptions
): string | null {
  if (!supabase) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path, options);

  return publicUrl;
}

/**
 * Get URL for a friend's window image
 * @param friendId Friend's unique ID
 * @param windowNumber Window number (1-24)
 * @param extension File extension (default: jpg). Should match the extension used during upload.
 * @returns Public URL for the image
 */
export function getFriendImageUrl(
  friendId: string,
  windowNumber: number,
  extension = 'jpg'
): string | null {
  const path = buildFriendImagePath(friendId, windowNumber, extension);
  return getImageUrl(path);
}

/**
 * Get URL for a shared image
 * @param filename Filename of the shared image
 * @returns Public URL for the image
 */
export function getSharedImageUrl(filename: string): string | null {
  const path = `shared/${filename}`;
  return getImageUrl(path);
}

/**
 * List all images for a friend
 * @param friendId Friend's unique ID
 * @returns List of image metadata
 */
export async function listFriendImages(
  friendId: string
): Promise<ListImagesResult> {
  if (!supabase) {
    return {
      success: false,
      error: {
        message: 'Supabase is not configured',
        code: 'SUPABASE_NOT_CONFIGURED',
      },
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`friends/${friendId}`);

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          code: error.name,
        },
      };
    }

    const metadata: ImageMetadata[] = data.map((file) => ({
      name: file.name,
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || 'image/jpeg',
      createdAt: file.created_at || '',
      updatedAt: file.updated_at || '',
      publicUrl: getImageUrl(`friends/${friendId}/${file.name}`) || '',
    }));

    return {
      success: true,
      data: metadata,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNEXPECTED_ERROR',
      },
    };
  }
}

// ============================================
// DELETE FUNCTIONS
// ============================================

/**
 * Delete an image from storage
 * @param path Image path in storage
 * @returns Success status
 */
export async function deleteImage(path: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return false;
  }
}

/**
 * Delete a friend's window image
 * @param friendId Friend's unique ID
 * @param windowNumber Window number (1-24)
 * @param extension File extension (default: jpg). Should match the extension used during upload.
 * @returns Success status
 */
export async function deleteFriendImage(
  friendId: string,
  windowNumber: number,
  extension = 'jpg'
): Promise<boolean> {
  const path = buildFriendImagePath(friendId, windowNumber, extension);
  return deleteImage(path);
}

/**
 * Delete all images for a friend
 * @param friendId Friend's unique ID
 * @returns Success status
 */
export async function deleteFriendImages(friendId: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    // List all files first
    const { data, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(`friends/${friendId}`);

    if (listError || !data) {
      console.error('List error:', listError);
      return false;
    }

    // Delete all files
    const filePaths = data.map((file) => `friends/${friendId}/${file.name}`);

    if (filePaths.length === 0) {
      return true; // No files to delete
    }

    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected delete error:', err);
    return false;
  }
}
