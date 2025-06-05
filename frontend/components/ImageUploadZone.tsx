'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface ImageUploadZoneProps {
  sessionId: string
  imageType: 'image_a' | 'image_b'
  currentImage?: string | null
  onUploadComplete: () => void
}

export default function ImageUploadZone({
  sessionId,
  imageType,
  currentImage,
  onUploadComplete
}: ImageUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) => 
      api.upload.uploadImage(sessionId, imageType, file),
    onSuccess: () => {
      setIsUploading(false)
      setError(null)
      onUploadComplete()
    },
    onError: (error: any) => {
      setIsUploading(false)
      setError(error.response?.data?.detail || 'アップロードに失敗しました')
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // ファイルサイズチェック (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('ファイルサイズが大きすぎます（最大100MB）')
      return
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    setIsUploading(true)
    setError(null)
    uploadMutation.mutate({ file })
  }, [uploadMutation])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    disabled: isUploading
  })

  const imageUrl = currentImage 
    ? `http://localhost:8000/uploads/${currentImage}`
    : null

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : currentImage 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">アップロード中...</p>
          </motion.div>
        ) : currentImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-4"
          >
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-700 mb-1">
              アップロード完了
            </p>
            <p className="text-xs text-gray-500">
              クリックまたはドラッグで画像を変更
            </p>
          </motion.div>
        ) : (
          <div className="py-8">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isDragActive ? '画像をドロップしてください' : '画像をアップロード'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG, WebP (最大100MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <Button
            onClick={() => setError(null)}
            variant="ghost"
            size="sm"
            className="ml-auto text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Preview */}
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg overflow-hidden bg-white"
        >
          <div className="aspect-video relative bg-gray-100">
            <Image
              src={imageUrl}
              alt={`${imageType} preview`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-3 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {currentImage}
                </span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  // TODO: 削除機能を実装
                }}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}