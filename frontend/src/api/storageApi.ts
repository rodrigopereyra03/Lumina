import axios from 'axios'

const SUPABASE_PROJECT_REF = 'dxxoxzaowyaxpxphqpsd'
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`
const BUCKET_NAME = 'product-images'

// Storage key from env or local config
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rGb_wzMIeOiBp2_qyrdvvg_TB5d4lff'

export const storageApi = {
  uploadProductImage: async (file: File): Promise<string> => {
    return storageApi.uploadMedia(file, 'products')
  },

  uploadMedia: async (
    file: File,
    folder: string = 'media',
    onProgress?: (progressPercent: number) => void
  ): Promise<string> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || (file.type.includes('video') ? 'mp4' : 'jpg')
    const cleanBase = file.name
      .substring(0, file.name.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase()
      .slice(0, 30)

    const fileName = `${folder}/${cleanBase || 'item'}_${Date.now()}.${fileExt}`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`

    const headers: Record<string, string> = {
      'Content-Type': file.type || (fileExt === 'mp4' ? 'video/mp4' : 'image/jpeg'),
    }

    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
    }

    // Direct upload to Supabase Storage
    const response = await axios.post(uploadUrl, file, {
      headers,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
      maxBodyLength: 100 * 1024 * 1024,
      maxContentLength: 100 * 1024 * 1024,
    })

    if (response.status >= 200 && response.status < 300) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`
      return publicUrl
    }

    throw new Error('No se pudo subir el archivo a Supabase Storage')
  },
}
