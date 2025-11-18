#!/usr/bin/env node
/**
 * Bulk Image Upload Script for Astro Advent Calendar
 *
 * This script uploads images to Supabase Storage organized by friend folders.
 *
 * Usage:
 *   node scripts/upload-images.js <friendId> <image1.jpg> [image2.jpg] [...]
 *
 * Example:
 *   node scripts/upload-images.js alice photo1.jpg photo2.jpg photo3.jpg
 *
 * This will upload all images to the "alice" folder in Supabase Storage.
 *
 * Environment variables required:
 *   PUBLIC_SUPABASE_URL - Your Supabase project URL
 *   PUBLIC_SUPABASE_ANON_KEY - Your Supabase anonymous key
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { basename, extname } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const STORAGE_BUCKET = 'calendar-images';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function uploadImage(supabase, friendId, filePath) {
  try {
    // Read the file
    const fileBuffer = await readFile(filePath);
    const fileName = basename(filePath);
    const fileExt = extname(fileName);

    // Generate storage path
    const storagePath = `${friendId}/${fileName}`;

    log(`  Uploading ${fileName}...`, 'cyan');

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(fileExt),
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    log(`  ✓ ${fileName} uploaded successfully!`, 'green');
    log(`    Public URL: ${data.publicUrl}`, 'reset');

    return {
      success: true,
      fileName,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    log(`  ✗ Failed to upload ${basename(filePath)}: ${error.message}`, 'red');
    return {
      success: false,
      fileName: basename(filePath),
      error: error.message,
    };
  }
}

function getContentType(ext) {
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    log('Usage: node scripts/upload-images.js <friendId> <image1> [image2] [...]\n', 'yellow');
    log('Example:', 'yellow');
    log('  node scripts/upload-images.js alice photo1.jpg photo2.jpg\n', 'cyan');
    process.exit(1);
  }

  const friendId = args[0];
  const imagePaths = args.slice(1);

  log(`\n🚀 Starting bulk upload for friend: ${friendId}\n`, 'cyan');

  // Check environment variables
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('Error: Missing Supabase credentials!', 'red');
    log('Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file\n', 'yellow');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Upload images
  const results = [];
  for (const imagePath of imagePaths) {
    const result = await uploadImage(supabase, friendId, imagePath);
    results.push(result);
  }

  // Summary
  log('\n📊 Upload Summary:', 'cyan');
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  log(`  Total: ${results.length}`, 'reset');
  log(`  Successful: ${successful}`, 'green');
  if (failed > 0) {
    log(`  Failed: ${failed}`, 'red');
  }

  log('\n✨ Done!\n', 'cyan');

  // Exit with error code if any uploads failed
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\nFatal error: ${error.message}\n`, 'red');
  process.exit(1);
});
