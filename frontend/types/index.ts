export interface AnalysisSession {
  id: string
  title: string
  description: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  created_at: string
  image_a_filename?: string
  image_b_filename?: string
  results?: {
    stage1?: string
    stage2?: string
    stage3?: string
  }
  performance_data?: PerformanceData
}

export interface PerformanceData {
  image_a: {
    visitors: number
    conversions: number
    conversion_rate: number
  }
  image_b: {
    visitors: number
    conversions: number
    conversion_rate: number
  }
}

export interface AnalysisStatus {
  session_id: string
  status: string
  progress: number
  current_stage: string
  results?: any
}

export interface AnalysisResults {
  session_id: string
  results: {
    stage1: string
    stage2: string
    stage3: string
  }
  performance_data?: PerformanceData
  completed_at: string
}