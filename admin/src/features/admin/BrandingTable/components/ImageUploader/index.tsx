'use client'

import React from 'react'
import { Button } from '@repo/ui/components/ui'
import { Upload, Loader2, X } from 'lucide-react'
import { useImageUploader } from './hooks/useImageUploader'

interface IImageUploaderProps {
    onUploadSuccess: (url: string) => void
    currentImageUrl?: string
    folder?: 'logos' | 'favicons'
}

export const ImageUploader: React.FC<IImageUploaderProps> = ({
    onUploadSuccess,
    currentImageUrl,
    folder = 'logos',
}) => {
    const {
        fileInputRef,
        isUploading,
        uploadProgress,
        handleFileSelect,
        handleRemove,
    } = useImageUploader(onUploadSuccess, folder)

    return (
        <div className="space-y-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {currentImageUrl ? (
                <div className="relative w-full h-32 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <img
                        src={currentImageUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">
                                {uploadProgress}% enviado
                            </p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Clique para fazer upload
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, WEBP ou SVG (max. 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

ImageUploader.displayName = 'ImageUploader'

