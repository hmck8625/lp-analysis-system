'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Zap, 
  BarChart3, 
  CheckCircle, 
  Clock,
  Brain,
  Search,
  FileText
} from 'lucide-react'

import { AnalysisStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'

interface AnalysisProgressProps {
  status: AnalysisStatus
  onComplete: () => void
}

export default function AnalysisProgress({ status, onComplete }: AnalysisProgressProps) {
  useEffect(() => {
    if (status.status === 'completed') {
      onComplete()
    }
  }, [status.status, onComplete])

  const stages = [
    {
      id: 1,
      name: 'Structure Analysis',
      description: 'レイアウトと視覚的階層を分析',
      icon: Eye,
      progress: status.progress >= 33 ? 100 : status.progress * 3,
      completed: status.progress >= 33
    },
    {
      id: 2,
      name: 'Content Analysis',
      description: 'テキストとビジュアル要素を詳細分析',
      icon: Search,
      progress: status.progress >= 66 ? 100 : Math.max(0, (status.progress - 33) * 3),
      completed: status.progress >= 66
    },
    {
      id: 3,
      name: 'Final Report',
      description: '総合分析と改善提案を生成',
      icon: FileText,
      progress: status.progress >= 90 ? 100 : Math.max(0, (status.progress - 66) * (100/24)),
      completed: status.progress >= 90
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4"
            >
              <Brain className="w-8 h-8 text-primary-600 animate-pulse" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI分析実行中
            </h3>
            <p className="text-gray-600 mb-4">
              {status.current_stage}
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {status.progress}% 完了
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${
              stage.completed 
                ? 'border-green-200 bg-green-50' 
                : stage.progress > 0 
                  ? 'border-primary-200 bg-primary-50' 
                  : 'border-gray-200'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-4">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${stage.completed 
                      ? 'bg-green-500 text-white' 
                      : stage.progress > 0 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {stage.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : stage.progress > 0 ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <stage.icon className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <stage.icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        Stage {stage.id}: {stage.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {stage.completed ? '完了' : stage.progress > 0 ? '実行中' : '待機中'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {stage.description}
                    </p>
                    
                    {/* Stage Progress */}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <motion.div
                        className={`h-1 rounded-full ${
                          stage.completed ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Status Messages */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-primary-500 mt-0.5 animate-pulse" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">分析状況</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>OpenAI Vision APIが画像を解析しています...</p>
                <p>予想完了時間: 約2-3分</p>
                {status.progress > 0 && (
                  <p className="text-primary-600">
                    現在のステージ: {status.current_stage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">分析中のヒント</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• 分析は3段階に分けて実行されます</p>
                <p>• 各段階で異なる観点から画像を評価します</p>
                <p>• 完了後、詳細なレポートと改善提案を確認できます</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}