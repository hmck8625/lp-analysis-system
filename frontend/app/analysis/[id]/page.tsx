'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  BarChart3,
  Eye,
  Zap
} from 'lucide-react'

import { api } from '@/lib/api'
import { AnalysisSession, PerformanceData } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiKeyStorage } from '@/lib/storage'
import ImageUploadZone from '@/components/ImageUploadZone'
import AnalysisProgress from '@/components/AnalysisProgress'
import AnalysisResults from '@/components/AnalysisResults'
import ApiKeyModal from '@/components/ApiKeyModal'

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [activeTab, setActiveTab] = useState<'upload' | 'performance' | 'analysis' | 'results'>('upload')
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    image_a: { visitors: 0, conversions: 0, conversion_rate: 0 },
    image_b: { visitors: 0, conversions: 0, conversion_rate: 0 }
  })
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  // API keyの状態を確認
  useEffect(() => {
    setHasApiKey(apiKeyStorage.exists())
  }, [])

  // セッション取得
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => api.sessions.get(sessionId),
    refetchInterval: 5000, // 5秒ごとに更新
  })

  // 分析ステータス取得
  const { data: analysisStatus } = useQuery({
    queryKey: ['analysis-status', sessionId],
    queryFn: () => api.analysis.getStatus(sessionId),
    enabled: session?.status === 'processing',
    refetchInterval: 2000,
  })

  // 分析開始
  const startAnalysisMutation = useMutation({
    mutationFn: api.analysis.start,
    onSuccess: () => {
      console.log('Analysis started successfully')
      setActiveTab('analysis')
      refetch()
    },
    onError: (error: any) => {
      console.error('Analysis start error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred'
      alert(`分析開始エラー: ${errorMessage}`)
    }
  })

  const handleStartAnalysis = async () => {
    console.log('Starting analysis for session:', sessionId)
    
    if (!session) {
      console.error('No session found')
      alert('セッションが見つかりません')
      return
    }
    
    console.log('Session status:', session.status)
    console.log('Images uploaded:', {
      image_a: session.image_a_filename,
      image_b: session.image_b_filename
    })
    
    // API keyチェック
    const hasApiKey = apiKeyStorage.exists()
    console.log('API key exists:', hasApiKey)
    
    if (!hasApiKey) {
      console.log('No API key found, showing modal')
      setShowApiKeyModal(true)
      return
    }
    
    // 画像チェック
    if (!session.image_a_filename || !session.image_b_filename) {
      console.error('Missing images:', {
        image_a: session.image_a_filename,
        image_b: session.image_b_filename
      })
      alert('両方の画像をアップロードしてください')
      return
    }
    
    console.log('Starting analysis mutation with data:', {
      session_id: sessionId,
      performance_data: performanceData.image_a.visitors > 0 ? performanceData : undefined
    })
    
    try {
      await startAnalysisMutation.mutateAsync({
        session_id: sessionId,
        performance_data: performanceData.image_a.visitors > 0 ? performanceData : undefined
      })
    } catch (error) {
      console.error('Analysis mutation failed:', error)
      // エラーは onError で処理される
    }
  }

  const handleApiKeySave = (apiKey: string) => {
    apiKeyStorage.set(apiKey)
    setHasApiKey(true)
  }

  const handlePerformanceDataChange = (
    imageType: 'image_a' | 'image_b',
    field: keyof PerformanceData['image_a'],
    value: number
  ) => {
    setPerformanceData(prev => ({
      ...prev,
      [imageType]: {
        ...prev[imageType],
        [field]: value
      }
    }))
  }

  const isReadyForAnalysis = session?.image_a_filename && session?.image_b_filename

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">セッションが見つかりません</h2>
            <p className="text-gray-600 mb-4">指定されたセッションIDが存在しません。</p>
            <Button onClick={() => router.push('/')} variant="outline">
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                <p className="text-gray-600">{session.description || 'LP分析セッション'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {session.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {session.status === 'processing' && <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />}
                {session.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                {session.status === 'draft' && <Eye className="w-5 h-5 text-gray-500" />}
                
                <span className="text-sm font-medium text-gray-700">
                  {session.status === 'completed' && '完了'}
                  {session.status === 'processing' && '分析中'}
                  {session.status === 'failed' && 'エラー'}
                  {session.status === 'draft' && 'ドラフト'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex border-b">
            {[
              { id: 'upload', label: '画像アップロード', icon: Upload },
              { id: 'performance', label: 'パフォーマンスデータ', icon: BarChart3 },
              { id: 'analysis', label: '分析実行', icon: Zap },
              { id: 'results', label: '結果', icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>画像A（オリジナル）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploadZone
                    sessionId={sessionId}
                    imageType="image_a"
                    currentImage={session.image_a_filename}
                    onUploadComplete={() => refetch()}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>画像B（バリエーション）</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploadZone
                    sessionId={sessionId}
                    imageType="image_b"
                    currentImage={session.image_b_filename}
                    onUploadComplete={() => refetch()}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'performance' && (
            <Card>
              <CardHeader>
                <CardTitle>A/Bテスト実績データ（オプション）</CardTitle>
                <p className="text-gray-600">実際のテスト結果を入力すると、より具体的な分析を提供できます。</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">画像A（オリジナル）</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          訪問者数
                        </label>
                        <Input
                          type="number"
                          value={performanceData.image_a.visitors}
                          onChange={(e) => handlePerformanceDataChange('image_a', 'visitors', parseInt(e.target.value) || 0)}
                          placeholder="例: 1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          コンバージョン数
                        </label>
                        <Input
                          type="number"
                          value={performanceData.image_a.conversions}
                          onChange={(e) => handlePerformanceDataChange('image_a', 'conversions', parseInt(e.target.value) || 0)}
                          placeholder="例: 50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          コンバージョン率（%）
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={performanceData.image_a.conversion_rate}
                          onChange={(e) => handlePerformanceDataChange('image_a', 'conversion_rate', parseFloat(e.target.value) || 0)}
                          placeholder="例: 5.0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">画像B（バリエーション）</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          訪問者数
                        </label>
                        <Input
                          type="number"
                          value={performanceData.image_b.visitors}
                          onChange={(e) => handlePerformanceDataChange('image_b', 'visitors', parseInt(e.target.value) || 0)}
                          placeholder="例: 1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          コンバージョン数
                        </label>
                        <Input
                          type="number"
                          value={performanceData.image_b.conversions}
                          onChange={(e) => handlePerformanceDataChange('image_b', 'conversions', parseInt(e.target.value) || 0)}
                          placeholder="例: 75"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          コンバージョン率（%）
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={performanceData.image_b.conversion_rate}
                          onChange={(e) => handlePerformanceDataChange('image_b', 'conversion_rate', parseFloat(e.target.value) || 0)}
                          placeholder="例: 7.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analysis' && (
            <Card>
              <CardHeader>
                <CardTitle>AI分析実行</CardTitle>
              </CardHeader>
              <CardContent>
                {session.status === 'draft' && (
                  <div className="text-center py-8">
                    {!isReadyForAnalysis ? (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          画像をアップロードしてください
                        </h3>
                        <p className="text-gray-600 mb-4">
                          分析を開始するには、A/B両方の画像が必要です。
                        </p>
                        <Button
                          onClick={() => setActiveTab('upload')}
                          variant="outline"
                        >
                          画像アップロードに戻る
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Zap className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          AI分析を開始
                        </h3>
                        <p className="text-gray-600 mb-6">
                          OpenAI Visionを使用して、詳細な画像分析を実行します。
                          約2-3分で完了予定です。
                        </p>
                        <Button
                          onClick={handleStartAnalysis}
                          disabled={startAnalysisMutation.isPending}
                          className="btn-primary"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          {startAnalysisMutation.isPending ? '開始中...' : '分析開始'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {session.status === 'processing' && analysisStatus && (
                  <AnalysisProgress
                    status={analysisStatus}
                    onComplete={() => refetch()}
                  />
                )}

                {session.status === 'failed' && (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      分析に失敗しました
                    </h3>
                    <p className="text-gray-600 mb-4">
                      エラーが発生しました。再度お試しください。
                    </p>
                    <Button
                      onClick={handleStartAnalysis}
                      disabled={startAnalysisMutation.isPending}
                    >
                      再試行
                    </Button>
                  </div>
                )}

                {session.status === 'completed' && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      分析完了！
                    </h3>
                    <p className="text-gray-600 mb-4">
                      分析結果を確認してください。
                    </p>
                    <Button
                      onClick={() => setActiveTab('results')}
                      className="btn-primary"
                    >
                      結果を見る
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'results' && (
            <AnalysisResults
              sessionId={sessionId}
              session={session}
            />
          )}
        </motion.div>
      </div>

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