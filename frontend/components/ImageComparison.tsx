'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Maximize, 
  ScanLine,
  Info,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnalysisElement } from '@/types'

interface ImageComparisonProps {
  imageA: string
  imageB: string
  sessionId: string
  analysisResults?: {
    results?: {
      stage1?: string
      stage2?: string
      stage3?: string
      elements?: AnalysisElement[]
      structure_summary?: string
    }
  }
}

export default function ImageComparison({ 
  imageA, 
  imageB, 
  sessionId, 
  analysisResults 
}: ImageComparisonProps) {
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay' | 'slider'>('side-by-side')
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  // デバッグ用：渡されたデータを確認
  console.log('ImageComparison - analysisResults:', analysisResults)
  console.log('ImageComparison - results:', analysisResults?.results)
  console.log('ImageComparison - elements path:', analysisResults?.results?.elements)

  // AI分析結果から要素情報を取得（新しいフォーマットに対応）
  const getElementAnalysis = () => {
    // 複数のデータ構造に対応
    let elements = null
    
    // パターン1: analysisResults.results.elements (正しいパス)
    if (analysisResults?.results?.elements && Array.isArray(analysisResults.results.elements)) {
      elements = analysisResults.results.elements
      console.log('Using elements from results.elements:', elements)
    }
    
    if (elements && elements.length > 0) {
      return elements.map((element: any) => ({
        id: element.id,
        name: element.name,
        type: element.type,
        position_a: element.position_a,
        position_b: element.position_b,
        changes: element.changes,
        impact: element.impact,
        recommendation: element.recommendation
      }))
    }
    
    // フォールバック用のサンプルデータ（分析は完了しているが要素情報がない場合）
    console.log('Using fallback elements - analysis completed but no element data found')
    
    // 分析結果のテキストから簡易的に要素を推測
    const hasAnalysisText = analysisResults?.results?.stage1 || analysisResults?.results?.stage2
    
    if (hasAnalysisText) {
      return [
        {
          id: 'header',
          name: 'ヘッダー',
          type: 'header',
          position_a: { x: 0, y: 0, width: 100, height: 10 },
          position_b: { x: 0, y: 0, width: 100, height: 10 },
          changes: 'レイアウト構造の分析結果はテキストレポートをご確認ください',
          impact: '視覚的階層の改善',
          recommendation: '詳細はAI分析レポートを参照'
        },
        {
          id: 'main-content',
          name: 'メインコンテンツ',
          type: 'content',
          position_a: { x: 10, y: 15, width: 80, height: 60 },
          position_b: { x: 10, y: 15, width: 80, height: 60 },
          changes: 'テキストやビジュアル要素の変更はレポートで確認',
          impact: 'コンテンツ認知度の向上',
          recommendation: '詳細はAI分析レポートを参照'
        },
        {
          id: 'text-elements',
          name: 'テキスト要素',
          type: 'text',
          position_a: { x: 15, y: 80, width: 70, height: 15 },
          position_b: { x: 15, y: 80, width: 70, height: 15 },
          changes: 'フォントやレイアウトの変更詳細はレポート参照',
          impact: '可読性とエンゲージメント向上',
          recommendation: '分析レポートの推奨事項を確認'
        }
      ]
    }
    
    // 最終的なフォールバック（分析結果もない場合）
    return [
      {
        id: 'loading',
        name: '分析中...',
        type: 'placeholder',
        position_a: { x: 25, y: 40, width: 50, height: 20 },
        position_b: { x: 25, y: 40, width: 50, height: 20 },
        changes: '分析結果を待機中...',
        impact: '分析完了後に表示',
        recommendation: 'しばらくお待ちください'
      }
    ]
  }
  
  const elementAnalysis = getElementAnalysis()
  const hasRealAnalysis = analysisResults?.results?.elements && analysisResults.results.elements.length > 0
  const hasAnalysisResults = analysisResults?.results?.stage1 || analysisResults?.results?.stage2

  const baseUrl = 'http://localhost:8000'

  return (
    <div className="space-y-6">
      {/* Comparison Mode Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">画像比較分析</h3>
          {!hasRealAnalysis && hasAnalysisResults && (
            <div className="text-sm text-blue-600 mt-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-medium">📊 AI分析が完了しました</p>
              <p className="text-xs mt-1">
                要素の詳細位置情報はテキストレポートで確認できます。下記の位置は推定表示です。
              </p>
              <p className="text-xs mt-1 text-gray-600">
                正確な要素位置: {analysisResults?.results?.elements?.length || 0}個 | 
                推定要素表示: {elementAnalysis.length}個
              </p>
            </div>
          )}
          {!hasRealAnalysis && !hasAnalysisResults && (
            <div className="text-sm text-amber-600 mt-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="font-medium">⏳ AI分析実行中...</p>
              <p className="text-xs mt-1">
                分析が完了するまでしばらくお待ちください。
              </p>
            </div>
          )}
          {hasRealAnalysis && (
            <p className="text-sm text-green-600 mt-1">
              ✅ AI分析による正確な要素位置を表示中 ({elementAnalysis.length}個の要素)
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { mode: 'side-by-side' as const, icon: ScanLine, label: '並列表示' },
              { mode: 'overlay' as const, icon: Eye, label: 'オーバーレイ' },
              { mode: 'slider' as const, icon: ChevronRight, label: 'スライダー' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setComparisonMode(mode)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  comparisonMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 25))}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Images */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              {comparisonMode === 'side-by-side' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Image A */}
                  <div className="relative">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">画像A (オリジナル)</h4>
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={`${baseUrl}/uploads/${imageA}`}
                        alt="Landing Page A"
                        className="w-full h-auto"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                      />
                      
                      {/* Element Overlays */}
                      {elementAnalysis.map((element) => (
                        <motion.div
                          key={element.id}
                          className={`absolute border-2 cursor-pointer transition-colors ${
                            selectedElement === element.id
                              ? 'border-red-500 bg-red-500 bg-opacity-20'
                              : 'border-blue-500 bg-blue-500 bg-opacity-10 hover:bg-opacity-20'
                          }`}
                          style={{
                            left: `${element.position_a?.x || 0}%`,
                            top: `${element.position_a?.y || 0}%`,
                            width: `${element.position_a?.width || 10}%`,
                            height: `${element.position_a?.height || 10}%`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left'
                          }}
                          onClick={() => setSelectedElement(
                            selectedElement === element.id ? null : element.id
                          )}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-br">
                            {element.name}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Image B */}
                  <div className="relative">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">画像B (バリエーション)</h4>
                    <div className="relative border rounded-lg overflow-hidden">
                      <img
                        src={`${baseUrl}/uploads/${imageB}`}
                        alt="Landing Page B"
                        className="w-full h-auto"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                      />
                      
                      {/* Element Overlays */}
                      {elementAnalysis.map((element) => (
                        <motion.div
                          key={element.id}
                          className={`absolute border-2 cursor-pointer transition-colors ${
                            selectedElement === element.id
                              ? 'border-red-500 bg-red-500 bg-opacity-20'
                              : 'border-green-500 bg-green-500 bg-opacity-10 hover:bg-opacity-20'
                          }`}
                          style={{
                            left: `${element.position_b?.x || 0}%`,
                            top: `${element.position_b?.y || 0}%`,
                            width: `${element.position_b?.width || 10}%`,
                            height: `${element.position_b?.height || 10}%`,
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top left'
                          }}
                          onClick={() => setSelectedElement(
                            selectedElement === element.id ? null : element.id
                          )}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-br">
                            {element.name}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Other comparison modes would be implemented here */}
              {comparisonMode === 'overlay' && (
                <div className="text-center text-gray-500 py-8">
                  オーバーレイモード（実装予定）
                </div>
              )}
              
              {comparisonMode === 'slider' && (
                <div className="text-center text-gray-500 py-8">
                  スライダーモード（実装予定）
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Element Analysis Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>要素解説</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedElement ? (
                <motion.div
                  key={selectedElement}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {(() => {
                    const element = elementAnalysis.find(e => e.id === selectedElement)
                    if (!element) return null
                    
                    return (
                      <>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{element.name}</h4>
                          <p className="text-sm text-gray-600">要素をクリックして詳細を確認</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">変更内容</h5>
                            <p className="text-sm text-gray-600">{element.changes}</p>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">期待される効果</h5>
                            <p className="text-sm text-gray-600">{element.impact}</p>
                          </div>
                          
                          {element.recommendation && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-1">推奨事項</h5>
                              <p className="text-sm text-gray-600">{element.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )
                  })()}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">画像内の要素をクリックして<br />詳細な解説を表示</p>
                </div>
              )}
              
              {/* Element List */}
              <div className="border-t pt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">分析対象要素</h5>
                <div className="space-y-1">
                  {elementAnalysis.map((element) => (
                    <button
                      key={element.id}
                      onClick={() => setSelectedElement(element.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedElement === element.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {element.name}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}