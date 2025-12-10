import { useState, useMemo } from 'react'
import { createClient } from '@repo/core/utils/supabase/client'
import axios from 'axios'

export const useImageUpload = () => {
    const supabase = useMemo(() => createClient(), [])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const uploadImage = async (file: File, folder: 'logos' | 'favicons' = 'logos'): Promise<string> => {
        setIsUploading(true)
        setUploadProgress(0)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${folder}/${fileName}`

            const { data, error } = await supabase.storage
                .from('branding')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            if (error) throw error

            const { data: publicUrlData } = supabase.storage
                .from('branding')
                .getPublicUrl(data.path)

            setUploadProgress(100)
            return publicUrlData.publicUrl
        } catch (error) {
            throw error
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    return {
        uploadImage,
        isUploading,
        uploadProgress,
    }
}

