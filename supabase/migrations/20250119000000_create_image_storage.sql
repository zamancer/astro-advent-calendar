-- Migration: Create Image Storage Setup
-- Description: Storage bucket and policies for calendar images
-- Created: 2025-01-19
--
-- IMPORTANT: Storage buckets must be created via Supabase Dashboard or Management API
-- This file contains the SQL policies to apply after creating the bucket
--
-- SETUP INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create a new bucket named "calendar-images"
-- 3. Set the bucket to PUBLIC
-- 4. After creating the bucket, run this SQL file to set up policies

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Note: Storage policies in Supabase are managed differently than table RLS
-- The bucket should be set to PUBLIC in the Dashboard for simplest setup

-- For more granular control, you can add custom policies here:
-- Example policies (uncomment and customize as needed):

/*
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'calendar-images');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'calendar-images');

-- Allow authenticated updates to own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'calendar-images' AND auth.uid()::text = owner);

-- Allow authenticated deletes of own files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'calendar-images' AND auth.uid()::text = owner);
*/

-- ============================================
-- BUCKET STRUCTURE
-- ============================================
-- Recommended folder structure within calendar-images bucket:
--
-- calendar-images/
-- ├── friends/
-- │   ├── {friend-id}/
-- │   │   ├── window-1.jpg
-- │   │   ├── window-2.jpg
-- │   │   └── ...
-- ├── shared/
-- │   └── {shared-image-name}.jpg
-- └── placeholders/
--     └── {placeholder-image}.jpg
--
-- File naming conventions:
-- - Friend images: friends/{friend-id}/window-{number}.{ext}
-- - Shared images: shared/{descriptive-name}.{ext}
-- - Placeholders: placeholders/{name}.{ext}

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON SCHEMA storage IS 'Supabase Storage schema for file uploads';

-- Note: To view storage usage statistics, use:
-- SELECT bucket_id, count(*), pg_size_pretty(sum(COALESCE((metadata->>'size')::int, 0))) as total_size
-- FROM storage.objects
-- GROUP BY bucket_id;
