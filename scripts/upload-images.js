#!/usr/bin/env node

/**
 * Bulk Image Upload Script
 * Upload multiple images to Supabase Storage
 *
 * Usage:
 *   pnpm upload-images --friend-id <friend-id> --dir <directory>
 *   pnpm upload-images --shared --dir <directory>
 *
 * Options:
 *   --friend-id <id>  Upload images for a specific friend
 *   --shared          Upload to shared folder
 *   --dir <path>      Directory containing images to upload
 *   --help            Show help
 */

import { createClient } from '@supabase/supabase-js';
import { readdir, stat, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// ============================================
// CONFIGURATION
// ============================================

const STORAGE_BUCKET = 'calendar-images';
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================
// HELPERS
// ============================================

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    friendId: null,
    shared: false,
    dir: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--friend-id':
        options.friendId = args[++i];
        break;
      case '--shared':
        options.shared = true;
        break;
      case '--dir':
        options.dir = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.warn(`Unknown option: ${arg}`);
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Bulk Image Upload Script

Upload multiple images to Supabase Storage for the Advent Calendar.

Usage:
  pnpm upload-images --friend-id <friend-id> --dir <directory>
  pnpm upload-images --shared --dir <directory>

Options:
  --friend-id <id>  Upload images for a specific friend
  --shared          Upload to shared folder
  --dir <path>      Directory containing images to upload
  --help, -h        Show this help message

Examples:
  # Upload images for a friend
  pnpm upload-images --friend-id abc123 --dir ./images/friend1

  # Upload shared images
  pnpm upload-images --shared --dir ./images/shared

Environment Variables:
  PUBLIC_SUPABASE_URL       Supabase project URL
  PUBLIC_SUPABASE_ANON_KEY  Supabase anon/public key

Notes:
  - Supported formats: JPG, PNG, WebP, GIF
  - Maximum file size: 5MB
  - For friend images, files should be named: window-1.jpg, window-2.jpg, etc.
  - Images are uploaded to: friends/{friend-id}/ or shared/
  `);
}

/**
 * Extract window number from filename
 */
function extractWindowNumber(filename) {
  const match = filename.match(/window[_-]?(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Generate upload path
 */
function generatePath(filename, friendId, shared) {
  if (friendId) {
    const windowNumber = extractWindowNumber(filename);
    if (windowNumber) {
      const ext = extname(filename);
      return `friends/${friendId}/window-${windowNumber}${ext}`;
    }
    return `friends/${friendId}/${filename}`;
  }

  if (shared) {
    return `shared/${filename}`;
  }

  return filename;
}

/**
 * Format file size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// ============================================
// MAIN UPLOAD FUNCTION
// ============================================

/**
 * Upload images from a directory
 */
async function uploadImages(supabase, options) {
  const { friendId, shared, dir } = options;

  // Validate options
  if (!dir) {
    console.error('Error: --dir option is required');
    process.exit(1);
  }

  if (!friendId && !shared) {
    console.error('Error: Either --friend-id or --shared is required');
    process.exit(1);
  }

  if (friendId && shared) {
    console.error('Error: Cannot use both --friend-id and --shared');
    process.exit(1);
  }

  console.log('\n📦 Bulk Image Upload\n');
  console.log(`Directory: ${dir}`);
  console.log(`Target: ${friendId ? `Friend ${friendId}` : 'Shared folder'}\n`);

  try {
    // Check if directory exists
    const dirStat = await stat(dir);
    if (!dirStat.isDirectory()) {
      console.error(`Error: ${dir} is not a directory`);
      process.exit(1);
    }

    // Read directory
    const files = await readdir(dir);

    // Filter image files
    const imageFiles = files.filter((file) => {
      const ext = extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('No image files found in directory');
      process.exit(0);
    }

    console.log(`Found ${imageFiles.length} image(s)\n`);

    // Upload each file
    let uploaded = 0;
    let failed = 0;

    for (const filename of imageFiles) {
      const filePath = join(dir, filename);

      try {
        // Read file
        const fileBuffer = await readFile(filePath);
        const fileSize = fileBuffer.length;

        // Check file size
        if (fileSize > MAX_FILE_SIZE) {
          console.error(
            `❌ ${filename} - Too large (${formatBytes(fileSize)}, max ${formatBytes(MAX_FILE_SIZE)})`
          );
          failed++;
          continue;
        }

        // Generate upload path
        const uploadPath = generatePath(filename, friendId, shared);

        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(uploadPath, fileBuffer, {
            contentType: `image/${extname(filename).slice(1)}`,
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          console.error(`❌ ${filename} - ${error.message}`);
          failed++;
          continue;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(uploadPath);

        console.log(`✅ ${filename} → ${uploadPath}`);
        console.log(`   Size: ${formatBytes(fileSize)}`);
        console.log(`   URL: ${publicUrl}\n`);

        uploaded++;
      } catch (err) {
        console.error(`❌ ${filename} - ${err.message}`);
        failed++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Upload Complete');
    console.log('='.repeat(60));
    console.log(`✅ Uploaded: ${uploaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${imageFiles.length}`);
    console.log('='.repeat(60) + '\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  const options = parseArgs();

  // Show help
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Check environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials');
    console.error('Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY');
    console.error('You can add them to a .env file in the project root\n');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Upload images
  await uploadImages(supabase, options);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
