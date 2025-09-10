-- Emergency fix: Drop all existing policies and recreate
-- Run this FIRST if you have existing policies

-- Drop existing policies (run this first if policies already exist)
DROP POLICY IF EXISTS "Allow authenticated uploads to minhchung_chiphi" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to minhchung_chiphi" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to minhchung_chiphi" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from minhchung_chiphi" ON storage.objects;

-- Then run the new policies below
-- Supabase Storage Policies for minhchung_chiphi bucket
-- Files are stored directly in root bucket (no folders needed)

-- Allow authenticated users to upload images to minhchung_chiphi bucket
CREATE POLICY "Allow authenticated uploads to minhchung_chiphi" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'minhchung_chiphi'
  AND (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp']))
);

-- Allow public read access to images in minhchung_chiphi bucket
CREATE POLICY "Allow public read access to minhchung_chiphi" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'minhchung_chiphi');

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated updates to minhchung_chiphi" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'minhchung_chiphi');

-- Allow authenticated users to delete their own images
CREATE POLICY "Allow authenticated deletes from minhchung_chiphi" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'minhchung_chiphi');
