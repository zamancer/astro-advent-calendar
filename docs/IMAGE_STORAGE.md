# Image Storage with Supabase

This guide explains how to set up and use image storage for your Advent Calendar.

## Overview

The Advent Calendar uses **Supabase Storage** to store and serve images through a global CDN. Images are organized by friend folders, making it easy to manage content for different recipients.

## Features

- ✅ Upload images to cloud storage
- ✅ Organize images by friend folders
- ✅ Generate public URLs automatically
- ✅ Fast loading via CDN
- ✅ Bulk upload script
- ✅ Demo mode with placeholder images

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://app.supabase.com/)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details and create

### 2. Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name it: `calendar-images`
4. Set as **Public bucket** (so images are accessible via URL)
5. Click "Create bucket"

### 3. Configure Storage Policies

To allow public read access and authenticated uploads:

1. Go to **Storage** > **Policies**
2. For the `calendar-images` bucket, create these policies:

**Public Read Policy:**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'calendar-images' );
```

**Authenticated Upload Policy:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'calendar-images' AND auth.role() = 'authenticated' );
```

Or use the Supabase Dashboard to create policies with these settings:
- **Policy Name**: "Public read access"
- **Allowed operation**: SELECT
- **Target roles**: public

### 4. Get Your Credentials

1. Go to **Settings** > **API**
2. Copy your:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key (e.g., `eyJhbGci...`)

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   PUBLIC_DEMO_MODE=false
   ```

## Folder Structure

Images are organized by friend ID:

```
calendar-images/
├── alice/
│   ├── winter-coffee.jpg
│   ├── ski-trip.jpg
│   └── christmas-lights.jpg
├── bob/
│   ├── movie-night.jpg
│   └── baking-cookies.jpg
└── charlie/
    └── new-year.jpg
```

## Uploading Images

### Using the Bulk Upload Script

The easiest way to upload multiple images:

```bash
# Upload images for a specific friend
pnpm upload-images alice photo1.jpg photo2.jpg photo3.jpg

# Upload from a different directory
pnpm upload-images bob ~/Pictures/holiday/*.jpg
```

The script will:
- Upload all images to the specified friend's folder
- Generate public URLs
- Display upload progress and results
- Handle errors gracefully

### Programmatically in Code

You can also use the storage utilities in your code:

```typescript
import { uploadImage } from './lib/storage';

// Upload a single image
const result = await uploadImage({
  file: imageFile, // File object from input
  friendId: 'alice',
  fileName: 'winter-coffee.jpg', // optional
});

if (result.success) {
  console.log('Image URL:', result.publicUrl);
} else {
  console.error('Upload failed:', result.error);
}
```

### Multiple Images

```typescript
import { uploadImages } from './lib/storage';

const results = await uploadImages([
  { file: file1, friendId: 'alice' },
  { file: file2, friendId: 'alice' },
  { file: file3, friendId: 'bob' },
]);

results.forEach((result, i) => {
  if (result.success) {
    console.log(`✓ Image ${i + 1} uploaded:`, result.publicUrl);
  }
});
```

## Using Images in Your Calendar

After uploading, update your calendar configuration with the public URLs:

```typescript
// src/config/calendar-content.ts
export const calendarConfig: CalendarConfig = {
  title: "Our Christmas Memories",
  subtitle: "12 days of special moments",
  contents: [
    {
      type: "photo",
      day: 1,
      imageUrl: "https://your-project.supabase.co/storage/v1/object/public/calendar-images/alice/winter-coffee.jpg",
      caption: "Remember our first coffee date? ☕",
      alt: "Friends at coffee shop",
    },
    // ... more content
  ],
};
```

## Demo Mode

For testing without Supabase setup, enable demo mode:

```env
PUBLIC_DEMO_MODE=true
```

In demo mode:
- Upload functions return placeholder image URLs
- No actual uploads happen
- Uses [Picsum Photos](https://picsum.photos) for placeholders
- Perfect for development and testing

## Utility Functions

### Upload Image
```typescript
uploadImage({ file, friendId, fileName? })
```
Uploads a single image to a friend's folder.

### Upload Multiple Images
```typescript
uploadImages([{ file, friendId, fileName? }, ...])
```
Uploads multiple images in parallel.

### Delete Image
```typescript
deleteImage(filePath)
```
Deletes an image from storage.

### List Images
```typescript
listImagesForFriend(friendId)
```
Gets all images for a specific friend.

### Get Public URL
```typescript
getPublicUrl(filePath)
```
Gets the public URL for an image.

## Best Practices

1. **Optimize before upload**: See [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md)
2. **Use descriptive friend IDs**: Makes organization easier
3. **Keep original filenames**: Helps with identification
4. **Test in demo mode first**: Verify everything works before real uploads
5. **Backup originals**: Keep original images before optimization

## Troubleshooting

### "Supabase is not configured" Error

**Solution**: Check that `.env` file exists and has correct values:
```bash
cat .env
```

### Upload Fails with 401 Error

**Solution**: Check your anon key is correct and policies are set up properly.

### Images Don't Display

**Solution**:
1. Verify bucket is public
2. Check the public URL is correct
3. Open URL directly in browser to test

### Bucket Not Found

**Solution**:
1. Ensure bucket name is exactly `calendar-images`
2. Create bucket if it doesn't exist
3. Check `STORAGE_BUCKET` constant in `src/lib/supabase.ts`

### Script Can't Find Images

**Solution**: Use full paths or run from directory containing images:
```bash
cd ~/Pictures/holiday
pnpm --dir /path/to/project upload-images alice *.jpg
```

## Storage Limits

**Supabase Free Tier:**
- 1GB storage
- 2GB bandwidth per month
- 50MB max file size

**Tips to stay within limits:**
- Optimize images (target < 200KB each)
- Remove old/unused images
- Use demo mode during development

## Security Considerations

1. **Public bucket**: Anyone with the URL can view images
2. **Authentication**: Upload script uses anon key (safe for uploads)
3. **RLS Policies**: Set up proper policies for production
4. **EXIF data**: Strip location/metadata before upload

## Next Steps

1. **Optimize your images**: Read [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md)
2. **Upload images**: Use the bulk upload script
3. **Update config**: Add public URLs to your calendar
4. **Test**: Run `pnpm dev` and verify images load
5. **Deploy**: Build and deploy your calendar

## Additional Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage CDN](https://supabase.com/docs/guides/storage/cdn)
- [Image Transformations](https://supabase.com/docs/guides/storage/image-transformations)
