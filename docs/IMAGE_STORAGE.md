# Image Storage Guide

Complete guide for managing images in the Advent Calendar application using Supabase Storage.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Image Optimization](#image-optimization)
- [Uploading Images](#uploading-images)
- [Using Images in Code](#using-images-in-code)
- [Demo Mode](#demo-mode)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Advent Calendar uses **Supabase Storage** to store and serve images through a CDN for fast, reliable delivery.

### Features

- ✅ **CDN-backed**: Fast image delivery worldwide
- ✅ **Organized folders**: Images organized by friend
- ✅ **Public URLs**: Easy to reference in code
- ✅ **Bulk upload**: Script for uploading multiple images
- ✅ **Demo mode**: Placeholder images for development

### Storage Structure

```
calendar-images/
├── friends/
│   ├── {friend-id}/
│   │   ├── window-1.jpg
│   │   ├── window-2.jpg
│   │   └── ...
├── shared/
│   └── {image-name}.jpg
└── placeholders/
    └── {placeholder-name}.jpg
```

---

## Setup

### 1. Create Storage Bucket

1. Go to [Supabase Dashboard](https://app.supabase.com) → **Storage**
2. Click **New bucket**
3. Name it `calendar-images`
4. Set to **Public** bucket
5. Click **Create bucket**

### 2. Run Migration (Optional)

The migration file includes documentation and policies:

```bash
# Copy contents of: supabase/migrations/20250119000000_create_image_storage.sql
# Paste in Supabase Dashboard → SQL Editor → Run
```

### 3. Verify Setup

Test that the bucket was created:

```typescript
import { supabase } from '~/lib/supabase';

const { data, error } = await supabase.storage.listBuckets();
console.log(data); // Should include 'calendar-images'
```

---

## Image Optimization

### Recommended Specifications

| Property | Recommendation |
|----------|---------------|
| **Format** | WebP (best), JPG, PNG |
| **Dimensions** | 800x600px to 1920x1080px |
| **File Size** | < 500KB (max 5MB) |
| **Quality** | 85% for JPG/WebP |
| **Aspect Ratio** | 4:3 or 16:9 |

### Tools for Optimization

#### Online Tools

1. **[TinyPNG](https://tinypng.com)** - Compress PNG/JPG
2. **[Squoosh](https://squoosh.app)** - Convert to WebP, resize, compress
3. **[ImageOptim](https://imageoptim.com)** - Mac app for optimization

#### Command Line

**ImageMagick** (resize and compress):
```bash
# Install
brew install imagemagick  # macOS
sudo apt install imagemagick  # Linux

# Resize to 800px width, maintain aspect ratio
magick input.jpg -resize 800x output.jpg

# Convert to WebP with 85% quality
magick input.jpg -quality 85 output.webp

# Batch process all images in a folder
for file in *.jpg; do
  magick "$file" -resize 1920x1080 -quality 85 "optimized/$file"
done
```

**pngquant** (PNG compression):
```bash
# Install
brew install pngquant  # macOS
sudo apt install pngquant  # Linux

# Compress PNG
pngquant --quality=65-80 input.png --output output.png

# Batch process
pngquant --quality=65-80 *.png --ext=.png --force
```

**cwebp** (WebP conversion):
```bash
# Install
brew install webp  # macOS
sudo apt install webp  # Linux

# Convert to WebP
cwebp -q 85 input.jpg -o output.webp

# Batch convert
for file in *.jpg; do
  cwebp -q 85 "$file" -o "${file%.jpg}.webp"
done
```

### Optimization Workflow

1. **Crop & Resize**: Adjust dimensions to recommended size
2. **Convert Format**: Use WebP for best compression
3. **Compress**: Reduce file size while maintaining quality
4. **Verify**: Check file size is < 500KB

**Example script** (ImageMagick):
```bash
#!/bin/bash
# optimize-images.sh

for file in *.jpg *.jpeg *.png; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    magick "$file" \
      -resize '1920x1080>' \
      -quality 85 \
      -strip \
      "optimized/$(basename "$file")"
  fi
done
```

---

## Uploading Images

### Method 1: Bulk Upload Script (Recommended)

Use the included bulk upload script to upload multiple images at once.

#### Upload Friend Images

```bash
# Upload images for a specific friend
pnpm upload-images --friend-id abc123 --dir ./images/friend1
```

**File naming**: `window-1.jpg`, `window-2.jpg`, etc.

The script automatically extracts window numbers from filenames.

#### Upload Shared Images

```bash
# Upload to shared folder
pnpm upload-images --shared --dir ./images/shared
```

#### Options

```bash
pnpm upload-images --help
```

Options:
- `--friend-id <id>` - Upload for a specific friend
- `--shared` - Upload to shared folder
- `--dir <path>` - Directory containing images

### Method 2: Programmatic Upload

Use the storage service in your code:

```typescript
import { uploadFriendImage, uploadSharedImage } from '~/lib/storage';

// Upload a friend's window image
const result = await uploadFriendImage('friend123', 1, imageFile);

if (result.success) {
  console.log('Uploaded:', result.data?.publicUrl);
} else {
  console.error('Error:', result.error?.message);
}

// Upload a shared image
const result = await uploadSharedImage('hero-image.jpg', imageFile);
```

### Method 3: Supabase Dashboard

1. Go to **Storage** → `calendar-images`
2. Navigate to folder (e.g., `friends/abc123/`)
3. Click **Upload file**
4. Select image(s)
5. Click **Upload**

---

## Using Images in Code

### Get Image URLs

```typescript
import { getFriendImageUrl, getSharedImageUrl } from '~/lib/storage';

// Get friend's window image URL
const imageUrl = getFriendImageUrl('friend123', 1, 'jpg');

// Get shared image URL
const sharedUrl = getSharedImageUrl('hero-image.jpg');

// Use in component
<img src={imageUrl} alt="Window 1" />
```

### List Friend's Images

```typescript
import { listFriendImages } from '~/lib/storage';

const result = await listFriendImages('friend123');

if (result.success) {
  result.data?.forEach(image => {
    console.log(image.name, image.publicUrl);
  });
}
```

### Image Validation

```typescript
import { validateImage, validateImageDimensions } from '~/lib/imageUtils';

// Basic validation
const validation = validateImage(file);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}

// Validate dimensions (async)
const dimValidation = await validateImageDimensions(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  minWidth: 800,
  minHeight: 600,
});
```

### Image Compression (Client-Side)

```typescript
import { compressImage, convertToWebP } from '~/lib/imageUtils';

// Compress image before upload
const compressedFile = await compressImage(
  originalFile,
  1920, // maxWidth
  1080, // maxHeight
  0.85  // quality
);

// Convert to WebP
const webpFile = await convertToWebP(originalFile, 0.85);

// Upload compressed file
await uploadFriendImage('friend123', 1, compressedFile);
```

---

## Demo Mode

In **demo mode** (when Supabase is not configured), the app uses placeholder images.

### Placeholder Services

```typescript
import { placeholders, getRandomChristmasImage } from '~/lib/placeholders';

// Get generic placeholder
const url = placeholders.getPlaceholderUrl(800, 600, 'Window 1');

// Get friend-specific placeholder
const friendUrl = placeholders.getFriendPlaceholder('Alice');

// Get window-specific placeholder
const windowUrl = placeholders.getWindowPlaceholder(1);

// Get random Christmas-themed image
const christmasUrl = getRandomChristmasImage('snow');
```

### Christmas Image Collections

Available categories:
- `snow` - Winter scenes
- `ornaments` - Christmas decorations
- `lights` - Holiday lights
- `gifts` - Presents and gifts
- `winter` - Winter landscapes

### Conditional Loading

```typescript
import { isDemoMode } from '~/lib/featureFlags';
import { getFriendImageUrl } from '~/lib/storage';
import { placeholders } from '~/lib/placeholders';

const imageUrl = isDemoMode()
  ? placeholders.getWindowPlaceholder(windowNumber)
  : getFriendImageUrl(friendId, windowNumber);
```

---

## Best Practices

### File Naming

✅ **Good**:
- `window-1.jpg`
- `window-2.webp`
- `christmas-tree.jpg`

❌ **Avoid**:
- `IMG_1234.jpg` (not descriptive)
- `window 1.jpg` (spaces)
- `Window-1.JPG` (inconsistent casing)

### Folder Organization

```
images/
├── friend1/
│   ├── window-1.jpg
│   ├── window-2.jpg
│   └── window-3.jpg
├── friend2/
│   ├── window-1.webp
│   └── window-2.webp
└── shared/
    ├── hero-image.jpg
    └── background.jpg
```

### Performance Tips

1. **Use WebP**: 25-35% smaller than JPG
2. **Lazy load**: Use `loading="lazy"` on images
3. **Responsive images**: Use `srcset` for different sizes
4. **CDN caching**: Images are automatically cached by Supabase CDN
5. **Compression**: Always compress before uploading

### Security

1. **Public bucket**: Only use for public images
2. **File size limits**: Max 5MB enforced by validation
3. **File types**: Only allow image types
4. **No sensitive data**: Don't upload personal information

---

## Troubleshooting

### Upload Fails

**Error: "Supabase is not configured"**
- Solution: Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in `.env`

**Error: "Bucket does not exist"**
- Solution: Create `calendar-images` bucket in Supabase Dashboard

**Error: "File too large"**
- Solution: Compress image to < 5MB (preferably < 500KB)

**Error: "Invalid file type"**
- Solution: Use JPG, PNG, WebP, or GIF

### Images Not Loading

**Blank images or 404 errors**
- Check bucket is set to **Public**
- Verify file was uploaded successfully
- Check file path matches expected structure

**Slow loading**
- Compress images (should be < 500KB)
- Use WebP format
- Enable lazy loading

### Bulk Upload Issues

**Script fails to find images**
- Verify directory path is correct
- Check file extensions are supported
- Ensure files are images, not other file types

**Some uploads fail**
- Check individual file sizes
- Verify file types are supported
- Review error messages for specific issues

---

## API Reference

### Storage Functions

```typescript
// Upload
uploadImage(options: ImageUploadOptions): Promise<ImageUploadResult>
uploadFriendImage(friendId: string, windowNumber: number, file: File): Promise<ImageUploadResult>
uploadSharedImage(filename: string, file: File): Promise<ImageUploadResult>
bulkUploadImages(options: BulkUploadOptions): Promise<BulkUploadResult>

// Retrieval
getImageUrl(path: string, options?: ImageRetrievalOptions): string | null
getFriendImageUrl(friendId: string, windowNumber: number, extension?: string): string | null
getSharedImageUrl(filename: string): string | null
listFriendImages(friendId: string): Promise<ListImagesResult>

// Delete
deleteImage(path: string): Promise<boolean>
deleteFriendImage(friendId: string, windowNumber: number, extension?: string): Promise<boolean>
deleteFriendImages(friendId: string): Promise<boolean>
```

### Validation Functions

```typescript
validateImage(file: File, options?: ImageValidationOptions): ImageValidationResult
validateImageDimensions(file: File, options: ImageValidationOptions): Promise<ImageValidationResult>
getImageDimensions(file: File): Promise<{ width: number; height: number } | null>
```

### Utility Functions

```typescript
compressImage(file: File, maxWidth?: number, maxHeight?: number, quality?: number): Promise<File>
convertToWebP(file: File, quality?: number): Promise<File>
formatFileSize(bytes: number): string
generateSafeFilename(originalName: string): string
extractWindowNumber(filename: string): number | null
```

---

## Examples

### Complete Upload Workflow

```typescript
import { uploadFriendImage } from '~/lib/storage';
import { validateImage, compressImage } from '~/lib/imageUtils';

async function uploadWindowImage(friendId: string, windowNumber: number, file: File) {
  // 1. Validate
  const validation = validateImage(file);
  if (!validation.valid) {
    console.error('Validation failed:', validation.errors);
    return;
  }

  // 2. Compress
  const compressed = await compressImage(file, 1920, 1080, 0.85);

  // 3. Upload
  const result = await uploadFriendImage(friendId, windowNumber, compressed);

  // 4. Handle result
  if (result.success) {
    console.log('Uploaded successfully!');
    console.log('URL:', result.data?.publicUrl);
  } else {
    console.error('Upload failed:', result.error?.message);
  }
}
```

### Bulk Upload with Progress

```typescript
import { bulkUploadImages } from '~/lib/storage';

const files = [...]; // Array of File objects

const result = await bulkUploadImages({
  files,
  friendId: 'friend123',
  onProgress: (current, total) => {
    console.log(`Uploading ${current}/${total}`);
  },
  onError: (filename, error) => {
    console.error(`Failed to upload ${filename}: ${error}`);
  },
});

console.log(`Uploaded: ${result.uploaded}, Failed: ${result.failed}`);
```

---

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [WebP Format Guide](https://developers.google.com/speed/webp)
- [ImageMagick Documentation](https://imagemagick.org/index.php)

---

**Need help?** Check the [main README](../README.md) or open an issue on GitHub.
