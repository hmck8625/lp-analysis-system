'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Eye, 
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

import { api } from '@/lib/api'
import { AnalysisSession } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisResultsProps {
  sessionId: string
  session: AnalysisSession
}

export default function AnalysisResults({ sessionId, session }: AnalysisResultsProps) {
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(3)

  // 分析結果取得
  const { data: results, isLoading } = useQuery({
    queryKey: ['analysis-results', sessionId],
    queryFn: () => api.analysis.getResults(sessionId),
    enabled: session.status === 'completed',
  })

  const handleDownload = (format: 'json' | 'text') => {
    if (!results) return

    const data = format === 'json' 
      ? JSON.stringify(results, null, 2)
      : Object.entries(results.results)
          .map(([stage, content]) => `# Stage ${stage}\n\n${content}\n\n`)
          .join('')

    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analysis-${sessionId}.${format === 'json' ? 'json' : 'txt'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (session.status !== 'completed') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            分析が完了していません
          </h3>
          <p className="text-gray-600">
            分析が完了すると、ここに結果が表示されます。
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            結果の取得に失敗しました
          </h3>
          <p className="text-gray-600">
            分析結果を読み込めませんでした。再度お試しください。
          </p>
        </CardContent>
      </Card>
    )
  }

  const stages = [
    {
      id: 1 as const,
      name: 'Structure Analysis',
      description: 'レイアウトと構造の分析',
      icon: Eye,
      content: results.results.stage1,
      color: 'blue'
    },
    {
      id: 2 as const,
      name: 'Content Analysis', 
      description: 'コンテンツの詳細分析',
      icon: Zap,
      content: results.results.stage2,
      color: 'purple'
    },
    {
      id: 3 as const,
      name: 'Final Report',
      description: '総合分析と改善提案',
      icon: BarChart3,
      content: results.results.stage3,
      color: 'green'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">分析結果</h2>
          <p className="text-gray-600">
            OpenAI Visionによる詳細な画像分析が完了しました
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => handleDownload('text')}
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            テキスト
          </Button>
          <Button
            onClick={() => handleDownload('json')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Performance Summary (if available) */}
      {results.performance_data && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>パフォーマンス比較</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">画像A（オリジナル）</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">
                    {results.performance_data.image_a.conversion_rate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {results.performance_data.image_a.conversions} / {results.performance_data.image_a.visitors} CV
                  </p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">画像B（バリエーション）</h3>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">
                    {results.performance_data.image_b.conversion_rate}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {results.performance_data.image_b.conversions} / {results.performance_data.image_b.visitors} CV
                  </p>
                </div>
              </div>
            </div>
            {results.performance_data.image_b.conversion_rate > results.performance_data.image_a.conversion_rate && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    画像Bが {(results.performance_data.image_b.conversion_rate - results.performance_data.image_a.conversion_rate).toFixed(1)}% 向上
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stage Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setActiveStage(stage.id)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center
              ${activeStage === stage.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <stage.icon className="w-4 h-4" />
            <span>{stage.name}</span>
          </button>
        ))}
      </div>

      {/* Stage Content */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {stages.map((stage) => (
          activeStage === stage.id && (
            <Card key={stage.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg
                    ${stage.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                    ${stage.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                    ${stage.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                  `}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle>Stage {stage.id}: {stage.name}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">{stage.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-md font-medium text-gray-900 mb-2 mt-3">{children}</h3>,
                      p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-700">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {stage.content || '分析結果がありません。'}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </motion.div>

      {/* Success Footer */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-900">分析完了</h4>
              <p className="text-sm text-green-700">
                分析が正常に完了しました。結果をダウンロードしてご活用ください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}