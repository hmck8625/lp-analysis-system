'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  Plus, 
  BarChart3, 
  Zap, 
  Eye, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Key,
  Settings
} from 'lucide-react'

import { api } from '@/lib/api'
import { AnalysisSession } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiKeyStorage } from '@/lib/storage'
import ApiKeyModal from '@/components/ApiKeyModal'

export default function HomePage() {
  const router = useRouter()
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  // API keyの状態を確認
  useEffect(() => {
    setHasApiKey(apiKeyStorage.exists())
  }, [])

  // セッション一覧取得
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: api.sessions.list,
    refetchInterval: 30000, // 30秒ごとに更新
  })

  // セッション作成
  const createSessionMutation = useMutation({
    mutationFn: api.sessions.create,
    onSuccess: (session) => {
      setShowCreateForm(false)
      setNewSessionTitle('')
      router.push(`/analysis/${session.id}`)
    },
    onError: (error: any) => {
      console.error('Session creation error:', error)
      alert(`セッション作成エラー: ${error.response?.data?.detail || error.message}`)
    }
  })

  const handleCreateSession = async () => {
    if (!newSessionTitle.trim()) return
    
    await createSessionMutation.mutateAsync({
      title: newSessionTitle,
      description: ''
    })
  }

  const handleApiKeySave = (apiKey: string) => {
    apiKeyStorage.set(apiKey)
    setHasApiKey(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Eye className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了'
      case 'processing':
        return '分析中'
      case 'failed':
        return 'エラー'
      default:
        return 'ドラフト'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-primary-500 p-2 rounded-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  LP Analysis System
                </h1>
                <p className="text-gray-600">
                  AI-Powered A/B Test Image Analysis
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <Button
                onClick={() => setShowApiKeyModal(true)}
                variant="outline"
                size="sm"
                className={hasApiKey ? 'border-green-200 text-green-700' : 'border-yellow-200 text-yellow-700'}
              >
                <Key className="w-4 h-4 mr-2" />
                {hasApiKey ? 'API Key設定済み' : 'API Key設定'}
              </Button>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                新しい分析
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Key Warning */}
        {!hasApiKey && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <Key className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-1">
                      OpenAI API Keyが必要です
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      AI分析を実行するには、OpenAI API Keyの設定が必要です。
                      API Keyはブラウザにのみ保存され、安全に管理されます。
                    </p>
                    <Button
                      onClick={() => setShowApiKeyModal(true)}
                      size="sm"
                      variant="outline"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      API Keyを設定
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            ランディングページを
            <span className="text-primary-500"> AI で分析</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            OpenAI Visionを活用して、A/Bテスト画像を詳細に分析し、
            コンバージョン改善のための具体的な提案を生成します。
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">構造分析</h3>
              <p className="text-gray-600">レイアウトと視覚的階層を詳細に分析</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">コンテンツ分析</h3>
              <p className="text-gray-600">テキストとビジュアル要素の最適化</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">改善提案</h3>
              <p className="text-gray-600">データドリブンな具体的改善案</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Create Session Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">新しい分析セッション</h3>
              <Input
                placeholder="セッション名を入力"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                className="mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
              />
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={!newSessionTitle.trim() || createSessionMutation.isPending}
                  className="flex-1 btn-primary"
                >
                  {createSessionMutation.isPending ? '作成中...' : '作成'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sessions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            分析セッション
          </h3>
          
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid gap-4">
              {sessions.map((session: AnalysisSession) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="card hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/analysis/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(session.status)}
                        <h4 className="text-lg font-semibold text-gray-900">
                          {session.title}
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                          {getStatusText(session.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {session.description || '説明なし'}
                      </p>
                      <p className="text-sm text-gray-500">
                        作成日: {new Date(session.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  まだ分析セッションがありません
                </h4>
                <p className="text-gray-600 mb-4">
                  最初の分析を始めて、LPの改善提案を受けてみましょう
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  分析を開始
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
        currentApiKey={apiKeyStorage.get() || ''}
      />
    </div>
  )
}