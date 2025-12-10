import { useRef, useState } from 'react'
import { useImageUpload } from '../../../hooks/useImageUpload'

export const useImageUploader = (
    onUploadSuccess: (url: string) => void,
    folder: 'logos' | 'favicons'
) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { uploadImage, isUploading, uploadProgress } = useImageUpload()
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        try {
            const url = await uploadImage(file, folder)
            onUploadSuccess(url)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
        }
    }

    const handleRemove = () => {
        onUploadSuccess('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return {
        fileInputRef,
        isUploading,
        uploadProgress,
        error,
        handleFileSelect,
        handleRemove,
    }
}

