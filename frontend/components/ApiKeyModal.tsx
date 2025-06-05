'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Key, X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (apiKey: string) => void
  currentApiKey?: string
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentApiKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentApiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (currentApiKey) {
      setApiKey(currentApiKey)
    }
  }, [currentApiKey])

  const validateApiKey = async (key: string) => {
    // 基本的なフォーマットチェックのみ
    if (!key.startsWith('sk-') || key.length < 20) {
      setIsValid(false)
      return false
    }

    // 実際の検証はバックエンドで行う
    setIsValid(true)
    return true
  }

  const handleSave = async () => {
    if (!apiKey.trim()) return

    const valid = await validateApiKey(apiKey)
    if (valid) {
      onSave(apiKey)
      onClose()
    }
  }

  const handleKeyChange = (value: string) => {
    setApiKey(value)
    setIsValid(null) // リセット
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Key className="w-5 h-5 text-primary-600" />
                </div>
                <CardTitle>OpenAI API Key 設定</CardTitle>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                AI画像分析を実行するために、OpenAI API keyが必要です。
                API keyはブラウザのローカルストレージに保存され、サーバーには送信されません。
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder="sk-..."
                    className={`pr-20 ${
                      isValid === true ? 'border-green-500 focus:ring-green-500' :
                      isValid === false ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                    {isValidating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                    )}
                    {isValid === true && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {isValid === false && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                      className="h-auto p-1"
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {isValid === false && (
                  <p className="text-sm text-red-600">
                    無効なAPI keyです。正しいOpenAI API keyを入力してください。
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                API keyの取得方法
              </h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a> にアクセス</li>
                <li>2. アカウントにログインまたは作成</li>
                <li>3. "Create new secret key" をクリック</li>
                <li>4. 生成されたAPI keyをコピーして貼り付け</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                セキュリティについて
              </h4>
              <p className="text-sm text-yellow-700">
                API keyはお使いのブラウザにのみ保存され、当サービスのサーバーには送信されません。
                ただし、API keyは機密情報ですので適切に管理してください。
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={!apiKey.trim() || isValidating || isValid === false}
                className="flex-1"
              >
                {isValidating ? '検証中...' : '保存'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}