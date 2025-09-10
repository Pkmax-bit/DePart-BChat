import { supabase } from './supabaseClient'

/*
 * SUPABASE STORAGE POLICIES - Copy and run these in Supabase SQL Editor:
 *
 * -- Allow authenticated users to upload images to minhchung_chiphi bucket
 * CREATE POLICY "Allow authenticated uploads to minhchung_chiphi" ON storage.objects
 * FOR INSERT TO authenticated
 * WITH CHECK (
 *   bucket_id = 'minhchung_chiphi'
 *   AND (storage.extension(name) = ANY(ARRAY['jpg', 'jpeg', 'png', 'gif', 'webp']))
 * );
 *
 * -- Allow public read access to images in minhchung_chiphi bucket
 * CREATE POLICY "Allow public read access to minhchung_chiphi" ON storage.objects
 * FOR SELECT TO public
 * USING (bucket_id = 'minhchung_chiphi');
 *
 * -- Allow authenticated users to update their own images
 * CREATE POLICY "Allow authenticated updates to minhchung_chiphi" ON storage.objects
 * FOR UPDATE TO authenticated
 * USING (bucket_id = 'minhchung_chiphi');
 *
 * -- Allow authenticated users to delete their own images
 * CREATE POLICY "Allow authenticated deletes from minhchung_chiphi" ON storage.objects
 * FOR DELETE TO authenticated
 * USING (bucket_id = 'minhchung_chiphi');
 */

/**
 * Test network connectivity to Supabase
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const testNetworkConnectivity = async () => {
  try {
    const response = await fetch('https://mfmijckzlhevduwfigkl.supabase.co/rest/v1/', {
      method: 'HEAD',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbWlqY2t6bGhldmR1d2ZpZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzkxMTIsImV4cCI6MjA3MjExNTExMn0.VPFmvLghhO32JybxDzq-CGVQedgI-LN7Q07rwDhxU4E'
      }
    })

    if (response.ok) {
      return {
        success: true,
        message: 'Kết nối mạng đến Supabase thành công'
      }
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }
    }

  } catch (error) {
    console.error('Network test error:', error)
    return {
      success: false,
      error: `Lỗi mạng: ${error.message}`
    }
  }
}
export const listAllBuckets = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('List buckets error:', error)
      return {
        success: false,
        error: `Không thể liệt kê buckets: ${error.message}`
      }
    }

    console.log('=== DANH SÁCH BUCKETS HIỆN CÓ ===')
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name} (ID: ${bucket.id})`)
    })

    return {
      success: true,
      buckets: buckets,
      message: `Tìm thấy ${buckets.length} bucket(s): ${buckets.map(b => b.name).join(', ')}`
    }

  } catch (error) {
    console.error('List buckets function error:', error)
    return {
      success: false,
      error: `Lỗi: ${error.message}`
    }
  }
}

export const testUploadWithPolicies = async () => {
  try {
    // Create a very small 1x1 pixel PNG image for testing
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1, 1);

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve({
            success: false,
            error: 'Không thể tạo file ảnh test'
          });
          return;
        }

        const testFile = new File([blob], 'test_image.png', { type: 'image/png' });

        try {
          const { data, error } = await supabase.storage
            .from('minhchung_chiphi')
            .upload('test_image.png', testFile, {
              cacheControl: '3600',
              upsert: true // Allow overwrite for testing
            });

          if (error) {
            console.error('Test upload error:', error);
            resolve({
              success: false,
              error: `Upload ảnh test thất bại: ${error.message}`,
              details: error
            });
            return;
          }

          console.log('Test upload success:', data);

          // Get public URL to verify
          const { data: { publicUrl } } = supabase.storage
            .from('minhchung_chiphi')
            .getPublicUrl('test_image.png');

          // Clean up test file
          await supabase.storage
            .from('minhchung_chiphi')
            .remove(['test_image.png']);

          resolve({
            success: true,
            message: 'Upload ảnh test thành công! Policies hoạt động bình thường.',
            url: publicUrl,
            data: data
          });
        } catch (uploadError) {
          console.error('Test upload function error:', uploadError);
          resolve({
            success: false,
            error: `Lỗi test: ${uploadError.message}`
          });
        }
      }, 'image/png');
    });

  } catch (error) {
    console.error('Canvas creation error:', error);
    return {
      success: false,
      error: `Lỗi tạo canvas: ${error.message}`
    };
  }
};

export const testSupabaseConnection = async () => {
  try {
    // Test basic connection by getting user (will be null if not authenticated)
    const { data, error } = await supabase.auth.getUser()

    if (error && !error.message.includes('Auth session missing')) {
      return {
        success: false,
        error: `Lỗi kết nối Supabase: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Kết nối Supabase thành công'
    }

  } catch (error) {
    console.error('Supabase connection test error:', error)
    return {
      success: false,
      error: `Lỗi kết nối: ${error.message}`
    }
  }
}
export const testSupabaseStorage = async () => {
  try {
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('List buckets error:', listError)
      return {
        success: false,
        error: `Không thể liệt kê buckets: ${listError.message}`
      }
    }

    console.log('Available buckets:', buckets)

    // Check if minhchung_chiphi bucket exists
    const bucketExists = buckets.some(bucket => bucket.name === 'minhchung_chiphi')

    if (!bucketExists) {
      return {
        success: false,
        error: 'Bucket "minhchung_chiphi" không tồn tại. Vui lòng tạo bucket này trong Supabase Dashboard.',
        buckets: buckets
      }
    }

    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('minhchung_chiphi')
      .list()

    if (filesError) {
      console.error('List files error:', filesError)

      if (filesError.message.includes('permission denied')) {
        return {
          success: false,
          error: 'Không có quyền truy cập bucket. Vui lòng kiểm tra và chạy SQL policies trong file supabase_storage_policies.sql',
          buckets: buckets
        }
      }

      return {
        success: false,
        error: `Không thể truy cập bucket: ${filesError.message}`,
        buckets: buckets
      }
    }

    return {
      success: true,
      buckets: buckets,
      files: files
    }

  } catch (error) {
    console.error('Test storage error:', error)
    return {
      success: false,
      error: `Lỗi kết nối: ${error.message}`
    }
  }
}

/**
 * Upload file to Supabase Storage bucket "minhchung_chiphi" (directly to root)
 * @param {File} file - The file to upload
 * @param {string} fileName - Optional custom filename
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadExpenseImage = async (file, fileName = null) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Kích thước file không được vượt quá 5MB'
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.split('.')[0]
    const extension = file.name.split('.').pop()
    const uniqueFileName = fileName || `${timestamp}_${originalName}.${extension}`

    // Upload file to Supabase Storage (directly to root bucket)
    const filePath = uniqueFileName // Upload directly to root bucket
    const { data, error } = await supabase.storage
      .from('minhchung_chiphi')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)

      // Provide more specific error messages
      if (error.message.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Bucket "minhchung_chiphi" không tồn tại. Vui lòng tạo bucket trong Supabase Dashboard.'
        }
      }

      if (error.message.includes('permission denied') || error.message.includes('access denied')) {
        return {
          success: false,
          error: 'Không có quyền upload. Vui lòng kiểm tra và chạy SQL policies trong file supabase_storage_policies.sql'
        }
      }

      return {
        success: false,
        error: `Không thể upload file: ${error.message}`
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('minhchung_chiphi')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: publicUrl,
      fileName: filePath // Return the full path for deletion
    }

  } catch (error) {
    console.error('Upload function error:', error)
    return {
      success: false,
      error: 'Có lỗi xảy ra khi upload file'
    }
  }
}

/**
 * Delete file from Supabase Storage (files stored directly in root bucket)
 * @param {string} fileName - The filename to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteExpenseImage = async (fileName) => {
  try {
    // File is stored directly in root bucket (no folder prefix needed)
    const filePath = fileName

    const { error } = await supabase.storage
      .from('minhchung_chiphi')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: `Không thể xóa file: ${error.message}`
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Delete function error:', error)
    return {
      success: false,
      error: 'Có lỗi xảy ra khi xóa file'
    }
  }
}
