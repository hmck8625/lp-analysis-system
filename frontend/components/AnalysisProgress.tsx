'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye,
  Search,
  FileText,
  Zap,
  BarChart3,
  RefreshCw,
  Download,
  Play,
  Pause,
  Settings,
  Wifi,
  WifiOff,
  Activity,
  TrendingUp,
  Target,
  Lightbulb,
  MessageSquare,
  Camera
} from 'lucide-react'
import { AnalysisStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AnalysisProgressProps {
  status: AnalysisStatus
  onComplete: () => void
}

interface StageInfo {
  id: number
  name: string
  description: string
  detailDescription: string
  icon: any
  progress: number
  completed: boolean
  isActive: boolean
  subSteps: string[]
  estimatedTimeMinutes: number
  aiModel: string
  complexity: 'low' | 'medium' | 'high'
}

export default function AnalysisProgress({ status, onComplete }: AnalysisProgressProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const [showApiResponse, setShowApiResponse] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected')
  const [analysisSpeed, setAnalysisSpeed] = useState<'normal' | 'fast' | 'thorough'>('normal')

  useEffect(() => {
    if (status.status === 'completed') {
      onComplete()
    }
  }, [status.status, onComplete])

  // 接続状態の監視（模擬）
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setConnectionStatus('reconnecting')
        setTimeout(() => setConnectionStatus('connected'), 2000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getDetailedStageInfo = (progress: number, currentStage: string) => {
    let activeStep = ''
    let estimatedTime = ''
    let currentOperation = ''
    
    if (progress < 25) {
      activeStep = 'ページ構造とレイアウトの初期解析を実行中...'
      estimatedTime = '残り約3-4分'
      currentOperation = 'DOM構造の抽出とセマンティック解析'
    } else if (progress < 50) {
      activeStep = 'ビジュアル要素とデザインパターンを詳細分析中...'
      estimatedTime = '残り約2-3分'
      currentOperation = 'カラーパレット、タイポグラフィ、画像解析'
    } else if (progress < 75) {
      activeStep = 'ユーザビリティとコンバージョン要素を評価中...'
      estimatedTime = '残り約1-2分'
      currentOperation = 'CTA配置、フォーム設計、ナビゲーション分析'
    } else if (progress < 90) {
      activeStep = '改善提案とベストプラクティス適用を生成中...'
      estimatedTime = '残り約30-60秒'
      currentOperation = 'AI推論エンジンによる最適化提案'
    } else {
      activeStep = '最終レポートと統合スコアを準備中...'
      estimatedTime = '間もなく完了'
      currentOperation = 'レポート生成と品質チェック'
    }
    
    return { activeStep, estimatedTime, currentOperation }
  }

  const stageDetails = getDetailedStageInfo(status.progress, status.current_stage)

  const stages: StageInfo[] = [
    {
      id: 1,
      name: 'Structure & Layout Analysis',
      description: 'ページ構造とレイアウトの詳細解析',
      detailDescription: 'ヘッダー、フッター、サイドバー配置 / グリッドシステム / レスポンシブ設計',
      icon: Eye,
      progress: status.progress >= 25 ? 100 : (status.progress / 25) * 100,
      completed: status.progress >= 25,
      isActive: status.progress < 25,
      estimatedTimeMinutes: 2,
      aiModel: 'GPT-4 Vision',
      complexity: 'medium',
      subSteps: [
        'HTMLセマンティック構造の解析',
        'CSSレイアウトシステムの検証',
        'レスポンシブブレークポイントの確認',
        '視覚的階層とZ-indexの評価',
        'アクセシビリティ要素の検出'
      ]
    },
    {
      id: 2,
      name: 'Visual & Design Analysis',
      description: 'ビジュアルデザインと美的要素の分析',
      detailDescription: 'カラースキーム / タイポグラフィ / 画像品質 / ブランディング一貫性',
      icon: Camera,
      progress: status.progress >= 50 ? 100 : Math.max(0, ((status.progress - 25) / 25) * 100),
      completed: status.progress >= 50,
      isActive: status.progress >= 25 && status.progress < 50,
      estimatedTimeMinutes: 2,
      aiModel: 'GPT-4 Vision + DALL-E Analysis',
      complexity: 'high',
      subSteps: [
        'カラーパレットとコントラスト比の分析',
        'フォントファミリーと可読性の評価',
        '画像解像度と最適化状況の確認',
        'ブランドガイドライン適合性の検証',
        'ビジュアル要素の配置バランス'
      ]
    },
    {
      id: 3,
      name: 'UX & Conversion Analysis',
      description: 'ユーザー体験とコンバージョン最適化',
      detailDescription: 'ユーザージャーニー / CTA効果 / フォーム設計 / ナビゲーション',
      icon: Target,
      progress: status.progress >= 75 ? 100 : Math.max(0, ((status.progress - 50) / 25) * 100),
      completed: status.progress >= 75,
      isActive: status.progress >= 50 && status.progress < 75,
      estimatedTimeMinutes: 2,
      aiModel: 'GPT-4 + Behavioral Analysis',
      complexity: 'high',
      subSteps: [
        'CTA配置と文言の効果性評価',
        'フォーム設計とコンバージョン障壁の特定',
        'ナビゲーション構造と使いやすさ',
        'ページ読み込み速度の影響分析',
        'モバイルUXの最適化度合い'
      ]
    },
    {
      id: 4,
      name: 'Insights & Recommendations',
      description: '洞察抽出と改善提案の生成',
      detailDescription: '統合分析 / 優先度付き改善案 / ROI予測 / 実装ガイド',
      icon: Lightbulb,
      progress: status.progress >= 100 ? 100 : Math.max(0, ((status.progress - 75) / 25) * 100),
      completed: status.progress >= 100,
      isActive: status.progress >= 75,
      estimatedTimeMinutes: 1,
      aiModel: 'GPT-4 + Optimization Engine',
      complexity: 'medium',
      subSteps: [
        'クリティカルな問題点の特定',
        '改善施策の優先度付け',
        'ROI予測とビジネス影響度',
        '具体的な実装ステップの提案',
        'A/Bテスト推奨項目の生成'
      ]
    }
  ]

  // エラー状態の表示
  if (status.status === 'failed') {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
              >
                <AlertCircle className="w-8 h-8 text-red-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                分析が失敗しました
              </h3>
              <p className="text-red-700 mb-4">
                {status.current_stage}
              </p>
              
              {/* エラー詳細 */}
              {(status as any).error && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium text-red-900 mb-2">エラー詳細:</h4>
                  <p className="text-sm text-red-800 font-mono">
                    {(status as any).error}
                  </p>
                  {(status as any).failed_at && (
                    <p className="text-xs text-red-600 mt-2">
                      失敗時刻: {new Date((status as any).failed_at).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex flex-col space-y-2 text-sm text-red-700">
                <p>考えられる原因:</p>
                <ul className="list-disc text-left pl-4 space-y-1">
                  <li>OpenAI API keyが無効または期限切れ</li>
                  <li>API使用量制限に達している</li>
                  <li>画像ファイルが破損している</li>
                  <li>ネットワーク接続の問題</li>
                  <li>サーバーの一時的な過負荷</li>
                </ul>
              </div>
              
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="destructive"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再試行
                </Button>
                <Button
                  onClick={() => setShowLogs(!showLogs)}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  ログを確認
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* トラブルシューティング */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">トラブルシューティング</h4>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium mb-1">基本的な確認事項:</p>
                      <ul className="space-y-1">
                        <li>• OpenAI API keyの設定確認</li>
                        <li>• 画像ファイルの完全性確認</li>
                        <li>• ネットワーク接続の安定性</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">高度な対処法:</p>
                      <ul className="space-y-1">
                        <li>• 異なる画像形式で再試行</li>
                        <li>• ブラウザのキャッシュクリア</li>
                        <li>• 時間をおいてから再実行</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* メイン進捗表示 */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4"
            >
              <Brain className="w-10 h-10 text-blue-600 animate-pulse" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">AI分析実行中</h3>
            <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
              {stageDetails.activeStep}
            </p>
            
            {/* メインプログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-4 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm mb-4">
              <span className="text-gray-600">進捗状況</span>
              <span className="font-bold text-blue-600 text-lg">{status.progress}% 完了</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="font-medium">予想残り時間</span>
                </div>
                <p className="text-blue-600 font-bold">{stageDetails.estimatedTime}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="w-4 h-4 text-green-500 mr-1" />
                  <span className="font-medium">現在の処理</span>
                </div>
                <p className="text-green-600 font-bold">AI解析中</p>
              </div>
              <div className="bg-white/50 rounded-lg p-3">
                <div className="flex items-center justify-center mb-1">
                  {connectionStatus === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className="font-medium">接続状態</span>
                </div>
                <p className={connectionStatus === 'connected' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                  {connectionStatus === 'connected' ? '安定' : connectionStatus === 'reconnecting' ? '再接続中' : '切断'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 詳細段階進捗 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">詳細分析進捗</h4>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowLogs(!showLogs)}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {showLogs ? 'ログを隠す' : 'ログを表示'}
            </Button>
            <Button
              onClick={() => setShowApiResponse(!showApiResponse)}
              variant="outline"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-1" />
              {showApiResponse ? 'APIレスポンスを隠す' : 'APIレスポンス'}
            </Button>
          </div>
        </div>

        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-l-4 transition-all duration-300 hover:shadow-md ${
              stage.completed ? 'border-green-500 bg-green-50' : 
              stage.isActive ? 'border-blue-500 bg-blue-50' : 
              'border-gray-300 bg-gray-50'
            }`}>
              <CardContent className="pt-4">
                <div 
                  className="cursor-pointer"
                  onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* ステージアイコン */}
                    <div className={`p-3 rounded-lg ${
                      stage.completed ? 'bg-green-100' : 
                      stage.isActive ? 'bg-blue-100' : 
                      'bg-gray-100'
                    }`}>
                      {stage.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : stage.isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <stage.icon className="w-6 h-6 text-blue-600" />
                        </motion.div>
                      ) : (
                        <stage.icon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    {/* ステージ内容 */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold text-lg ${
                          stage.completed ? 'text-green-900' : 
                          stage.isActive ? 'text-blue-900' : 
                          'text-gray-500'
                        }`}>
                          Stage {stage.id}: {stage.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stage.complexity === 'high' ? 'bg-red-100 text-red-700' :
                            stage.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {stage.complexity}
                          </span>
                          <span className={`text-sm font-medium ${
                            stage.completed ? 'text-green-600' : 
                            stage.isActive ? 'text-blue-600' : 
                            'text-gray-400'
                          }`}>
                            {Math.round(stage.progress)}%
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-2 ${
                        stage.completed ? 'text-green-700' : 
                        stage.isActive ? 'text-blue-700' : 
                        'text-gray-500'
                      }`}>
                        {stage.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Brain className="w-3 h-3 mr-1" />
                          {stage.aiModel}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          約{stage.estimatedTimeMinutes}分
                        </span>
                      </div>
                      
                      {/* ステージプログレスバー */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <motion.div
                          className={`h-2 rounded-full ${
                            stage.completed ? 'bg-green-500' : 
                            stage.isActive ? 'bg-blue-500' : 
                            'bg-gray-300'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stage.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 展開可能な詳細情報 */}
                <AnimatePresence>
                  {expandedStage === stage.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="bg-white/70 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-gray-700 font-medium">詳細説明:</p>
                        <p className="text-sm text-gray-600">{stage.detailDescription}</p>
                        
                        {stage.isActive && (
                          <div>
                            <p className="text-sm text-gray-700 font-medium mb-2">実行中のサブタスク:</p>
                            <div className="space-y-2">
                              {stage.subSteps.map((step, stepIndex) => (
                                <motion.div
                                  key={stepIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: stepIndex * 0.1 }}
                                  className="flex items-center text-sm"
                                >
                                  <div className={`w-2 h-2 rounded-full mr-3 ${
                                    stepIndex < Math.floor(stage.progress / 20) ? 'bg-blue-500' : 'bg-gray-300'
                                  }`} />
                                  <span className={
                                    stepIndex < Math.floor(stage.progress / 20) ? 'text-blue-700' : 'text-gray-600'
                                  }>
                                    {step}
                                  </span>
                                  {stepIndex < Math.floor(stage.progress / 20) && (
                                    <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* リアルタイム状況表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            リアルタイム分析状況
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OpenAI API接続:</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  接続中
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">処理速度:</span>
                <span className="text-blue-600 font-medium">
                  {analysisSpeed === 'fast' ? '高速' : analysisSpeed === 'thorough' ? '精密' : '標準'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">予想残り時間:</span>
                <span className="text-purple-600 font-medium">{stageDetails.estimatedTime}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">分析品質:</span>
                <span className="text-green-600 font-medium">高精度</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">使用AIモデル:</span>
                <span className="text-indigo-600 font-medium">GPT-4 Vision</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">現在の操作:</span>
                <span className="text-orange-600 font-medium text-xs">
                  {stageDetails.currentOperation}
                </span>
              </div>
            </div>
          </div>

          {/* 現在の処理詳細 */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium text-sm flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              📊 {stageDetails.activeStep}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 分析ログ表示 */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                  分析ログ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto text-sm font-mono">
                  {/* 模擬ログエントリ */}
                  <div className="space-y-1 text-green-400">
                    <div>[{new Date().toLocaleTimeString()}] 🚀 分析セッション開始</div>
                    <div>[{new Date().toLocaleTimeString()}] 📸 画像データ読み込み完了</div>
                    <div>[{new Date().toLocaleTimeString()}] 🧠 AI Vision Model 初期化</div>
                    <div>[{new Date().toLocaleTimeString()}] 🔍 DOM構造解析開始</div>
                    <div>[{new Date().toLocaleTimeString()}] ✅ レイアウト分析完了 (25%)</div>
                    <div>[{new Date().toLocaleTimeString()}] 🎨 ビジュアル要素解析中...</div>
                    <div className="text-yellow-400">[{new Date().toLocaleTimeString()}] ⚡ 現在: {stageDetails.currentOperation}</div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>リアルタイム更新中</span>
                  <Button size="sm" variant="outline" onClick={() => {}}>
                    <Download className="w-3 h-3 mr-1" />
                    ログをダウンロード
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APIレスポンス表示 */}
      <AnimatePresence>
        {showApiResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  APIレスポンス (分析結果)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {status.results ? (
                      JSON.stringify(status.results, null, 2)
                    ) : (
                      <span className="text-yellow-400">
                        まだ分析結果がありません。分析が進行すると、ここにAPIレスポンスが表示されます。
                      </span>
                    )}
                  </pre>
                </div>
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {status.results ? '分析結果を取得しました' : '分析結果待機中...'}
                  </span>
                  {status.results && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        const dataStr = JSON.stringify(status.results, null, 2)
                        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                        const exportFileDefaultName = `analysis-results-${status.session_id}.json`
                        
                        const linkElement = document.createElement('a')
                        linkElement.setAttribute('href', dataUri)
                        linkElement.setAttribute('download', exportFileDefaultName)
                        linkElement.click()
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      JSONをダウンロード
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分析のヒントとTips */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 mb-2">分析進行中のインサイト</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <p className="font-medium mb-1">🎯 分析の特徴:</p>
                  <ul className="space-y-1">
                    <li>• 4段階の詳細分析プロセス</li>
                    <li>• 最新のAI Vision技術を活用</li>
                    <li>• ユーザビリティとコンバージョンに特化</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">📈 期待できる成果:</p>
                  <ul className="space-y-1">
                    <li>• 具体的な改善提案</li>
                    <li>• ROI予測付きの優先度付け</li>
                    <li>• 実装可能なアクションプラン</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}