import axios from 'axios'

const SUPABASE_PROJECT_REF = 'dxxoxzaowyaxpxphqpsd'
const SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`
const BUCKET_NAME = 'product-images'

// Storage key from env or local config
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rGb_wzMIeOiBp2_qyrdvvg_TB5d4lff'

export const storageApi = {
  uploadProductImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `perfume_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fileName}`

    const headers: Record<string, string> = {
      'Content-Type': file.type || 'image/jpeg',
    }

    if (SUPABASE_ANON_KEY) {
      headers['apikey'] = SUPABASE_ANON_KEY
      headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`
    }

    // Direct upload to Supabase Storage
    const response = await axios.post(uploadUrl, file, {
      headers,
    })

    if (response.status >= 200 && response.status < 300) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`
      return publicUrl
    }

    throw new Error('No se pudo subir la imagen a Supabase Storage')
  },
}
