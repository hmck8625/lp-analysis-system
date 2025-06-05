# デバッグログ - セッション作成エラー解決

## 発生したエラーと解決策

### 1. Git Push エラー - node_modules サイズ制限
**エラー**: `File frontend/node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node is 104.90 MB; this exceeds GitHub's file size limit`

**解決策**:
- `.gitignore`にNode.js関連エントリを追加
- `git rm -r --cached frontend/node_modules/` でnode_modulesをgit追跡から除外

```gitignore
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
```

### 2. useEffect未定義エラー
**エラー**: `ReferenceError: useEffect is not defined`

**解決策**:
複数ファイルでReact hooksのインポートが不足

#### ファイル1: `frontend/components/AnalysisProgress.tsx`
```typescript
// 修正前
import { useEffect } from 'react'

// 修正後
import { useState, useEffect } from 'react'
```

#### ファイル2: `frontend/app/analysis/[id]/page.tsx`
```typescript
// 修正前
import { useState, useCallback } from 'react'

// 修正後
import { useState, useEffect, useCallback } from 'react'
```

### 3. 循環参照エラー - session初期化前アクセス
**エラー**: `ReferenceError: Cannot access 'session' before initialization`

**問題箇所**: `frontend/app/analysis/[id]/page.tsx:53`
```typescript
// 問題コード
const { data: session, isLoading, refetch } = useQuery({
  queryKey: ['session', sessionId],
  queryFn: () => api.sessions.get(sessionId),
  refetchInterval: session?.status === 'processing' ? 2000 : false, // ❌ 循環参照
})
```

**解決策**:
```typescript
// 修正後
const { data: session, isLoading, refetch } = useQuery({
  queryKey: ['session', sessionId],
  queryFn: () => api.sessions.get(sessionId),
  refetchInterval: 5000, // ✅ 固定間隔に変更
})
```

## デバッグ機能追加

### API通信ログ強化
`frontend/lib/api.ts`にリクエスト/レスポンスログを追加:

```typescript
// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    const apiKey = apiKeyStorage.get()
    if (apiKey) {
      config.headers['X-OpenAI-API-Key'] = apiKey
    }
    return config
  }
)

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

### エラーハンドリング改善
`frontend/app/page.tsx`でセッション作成エラーの詳細表示:

```typescript
onError: (error: any) => {
  console.error('Session creation error:', error)
  alert(`セッション作成エラー: ${error.response?.data?.detail || error.message}`)
}
```

### SSR安全性チェック
`frontend/lib/storage.ts`でwindowオブジェクトの存在確認:

```typescript
if (typeof window !== 'undefined') {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
}
```

## コミット履歴
1. `🐛 Add debugging for session creation issues` - デバッグ機能とエラーハンドリング追加
2. `🐛 Fix React hooks import errors and add debugging log` - React hooks import修正とデバッグログ追加

## 分析実行失敗のデバッグ機能追加

### 4. 分析実行エラーのデバッグ強化
**追加内容**:
バックエンドとフロントエンドに包括的なデバッグ機能を追加

#### バックエンド改善 (`backend/main.py`)
```python
import logging

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 分析開始エンドポイントにデバッグログ追加
@app.post("/api/analysis/start")
async def start_analysis(...):
    logger.info(f"Starting analysis for session: {request.session_id}")
    logger.info(f"API key provided: {bool(api_key)}")
    logger.info(f"Images uploaded - A: {image_a_exists}, B: {image_b_exists}")
    
    # ファイル存在確認
    if not os.path.exists(image_a_path):
        logger.error(f"Image A file not found: {image_a_path}")
        raise HTTPException(...)

# バックグラウンド分析にステージ別ログ追加
async def perform_analysis(session_id: str, api_key: str):
    logger.info(f"Background analysis started for session: {session_id}")
    
    # Stage 1: Structure Analysis
    logger.info("Starting Stage 1: Structure Analysis")
    try:
        stage1_result = await openai_service.analyze_structure(...)
        logger.info("Stage 1 completed successfully")
    except Exception as e:
        logger.error(f"Stage 1 failed: {str(e)}")
        raise Exception(f"Structure analysis failed: {str(e)}")

# エラー詳細をレスポンスに含める
@app.get("/api/analysis/{session_id}/status")
async def get_analysis_status(session_id: str):
    if session["status"] == "failed":
        response["error"] = session.get("error", "Unknown error occurred")
        response["failed_at"] = session.get("failed_at")
```

#### フロントエンド改善

**分析開始エラーハンドリング** (`frontend/app/analysis/[id]/page.tsx`)
```typescript
const startAnalysisMutation = useMutation({
  mutationFn: api.analysis.start,
  onSuccess: () => {
    console.log('Analysis started successfully')
    setActiveTab('analysis')
    refetch()
  },
  onError: (error: any) => {
    console.error('Analysis start error:', error)
    const errorMessage = error.response?.data?.detail || error.message
    alert(`分析開始エラー: ${errorMessage}`)
  }
})

const handleStartAnalysis = async () => {
  console.log('Starting analysis for session:', sessionId)
  console.log('Session status:', session.status)
  console.log('Images uploaded:', {
    image_a: session.image_a_filename,
    image_b: session.image_b_filename
  })
  
  // 詳細な事前チェック
  if (!session.image_a_filename || !session.image_b_filename) {
    console.error('Missing images:', {...})
    alert('両方の画像をアップロードしてください')
    return
  }
}
```

**エラー表示コンポーネント** (`frontend/components/AnalysisProgress.tsx`)
```typescript
// エラー状態の場合の専用UI
if (status.status === 'failed') {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <h3>分析が失敗しました</h3>
        
        {/* エラー詳細表示 */}
        {status.error && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <h4>エラー詳細:</h4>
            <p className="font-mono">{status.error}</p>
            {status.failed_at && (
              <p>失敗時刻: {new Date(status.failed_at).toLocaleString()}</p>
            )}
          </div>
        )}
        
        {/* トラブルシューティングガイド */}
        <ul className="list-disc">
          <li>OpenAI API keyが無効または期限切れ</li>
          <li>API使用量制限に達している</li>
          <li>画像ファイルが破損している</li>
          <li>ネットワーク接続の問題</li>
        </ul>
      </CardContent>
    </Card>
  )
}
```

**API通信詳細ログ** (`frontend/lib/api.ts`)
```typescript
apiClient.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  console.log('Request Headers:', config.headers)
  console.log('Request Data:', config.data)
  
  const apiKey = apiKeyStorage.get()
  if (apiKey) {
    console.log('OpenAI API Key added to request')
  } else {
    console.log('No OpenAI API Key found in storage')
  }
})

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    console.log('Response Data:', response.data)
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    })
  }
)
```

### デバッグ方法
1. **ブラウザの開発者ツール** でConsoleタブを開く
2. **分析実行** ボタンを押す
3. **コンソールログ** で詳細なリクエスト/レスポンス情報を確認
4. **バックエンドログ** (ターミナル) で内部処理の詳細を確認
5. **エラー表示** で具体的な失敗理由とトラブルシューティングを確認

## 次のステップ
1. 実際の分析実行でエラーログを収集
2. OpenAI API接続の詳細テスト
3. 画像ファイル処理の検証
4. エラーパターンの分析と対策強化

---
作成日: 2025/6/5
更新日: 2025/6/5 (分析デバッグ機能追加)
更新者: Claude Code Assistant