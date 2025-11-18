// Utilities for managing image storage in Supabase
import { supabase, STORAGE_BUCKET, DEMO_MODE } from './supabase';

export interface UploadImageOptions {
  file: File;
  friendId: string;
  fileName?: string;
}

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Generates a placeholder image URL for demo mode
 */
function getPlaceholderUrl(fileName: string): string {
  // Use picsum.photos for random placeholder images
  const seed = fileName.replace(/[^a-zA-Z0-9]/g, '');
  return `https://picsum.photos/seed/${seed}/800/600`;
}

/**
 * Uploads an image to Supabase Storage
 * Images are organized by friendId folders: {friendId}/{fileName}
 *
 * @param options - Upload options including file, friendId, and optional fileName
 * @returns Result object with success status and publicUrl or error
 */
export async function uploadImage({
  file,
  friendId,
  fileName,
}: UploadImageOptions): Promise<UploadImageResult> {
  // In demo mode, return a placeholder URL
  if (DEMO_MODE) {
    const demoFileName = fileName || file.name;
    return {
      success: true,
      publicUrl: getPlaceholderUrl(demoFileName),
    };
  }

  // Check if Supabase is configured
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set up your environment variables.',
    };
  }

  try {
    // Generate file path: {friendId}/{fileName}
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${Date.now()}.${fileExt}`;
    const filePath = `${friendId}/${finalFileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      success: true,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Uploads multiple images in bulk
 *
 * @param images - Array of upload options
 * @returns Array of upload results
 */
export async function uploadImages(
  images: UploadImageOptions[]
): Promise<UploadImageResult[]> {
  return Promise.all(images.map((image) => uploadImage(image)));
}

/**
 * Deletes an image from Supabase Storage
 *
 * @param filePath - Path to the file in storage (e.g., "friendId/fileName.jpg")
 * @returns Success status
 */
export async function deleteImage(filePath: string): Promise<boolean> {
  if (DEMO_MODE || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Lists all images for a specific friend
 *
 * @param friendId - The friend's identifier
 * @returns Array of file paths
 */
export async function listImagesForFriend(
  friendId: string
): Promise<string[]> {
  if (DEMO_MODE || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(friendId);

    if (error || !data) {
      return [];
    }

    return data.map((file) => `${friendId}/${file.name}`);
  } catch {
    return [];
  }
}

/**
 * Gets the public URL for a file in storage
 *
 * @param filePath - Path to the file in storage
 * @returns Public URL or placeholder in demo mode
 */
export function getPublicUrl(filePath: string): string {
  if (DEMO_MODE) {
    return getPlaceholderUrl(filePath);
  }

  if (!supabase) {
    return '';
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
