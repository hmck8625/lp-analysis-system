import openai
import base64
import os
from typing import Dict, Any, Optional
import aiofiles

class OpenAIService:
    def __init__(self, api_key: Optional[str] = None):
        # API keyの優先順位: パラメータ > 環境変数
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = openai.AsyncOpenAI(api_key=self.api_key)
        self.model = "gpt-4o"
    
    async def _encode_image(self, image_path: str) -> str:
        """画像をbase64エンコード"""
        async with aiofiles.open(image_path, "rb") as image_file:
            image_data = await image_file.read()
            return base64.b64encode(image_data).decode('utf-8')
    
    async def analyze_structure(self, image_a_path: str, image_b_path: str) -> str:
        """構造分析を実行"""
        base64_a = await self._encode_image(image_a_path)
        base64_b = await self._encode_image(image_b_path)
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": """あなたはLP（ランディングページ）分析の専門家です。
                    2つのLP画像を比較し、以下の観点から構造を分析してください：
                    
                    1. **レイアウト構造**: ヘッダー、メインエリア、フッターの配置
                    2. **主要要素**: タイトル、CTA、画像、テキストの配置と大きさ
                    3. **視覚的階層**: 情報の優先順位と視線の流れ
                    4. **デザイン要素**: 色彩、フォント、余白の使い方
                    5. **主要な違い**: A/B間での構造的変更点
                    
                    分析結果をマークダウン形式で、詳細かつ具体的に返してください。"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "これら2つのランディングページの構造を詳細に比較分析してください。画像Aが元のバージョン、画像Bが変更後のバージョンです。"
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_a}"}
                        },
                        {
                            "type": "image_url", 
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_b}"}
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    async def analyze_content(
        self, 
        image_a_path: str, 
        image_b_path: str, 
        structure_analysis: str
    ) -> str:
        """コンテンツ詳細分析を実行"""
        base64_a = await self._encode_image(image_a_path)
        base64_b = await self._encode_image(image_b_path)
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": """構造分析を踏まえて、以下の観点からより詳細な内容分析を行ってください：
                    
                    1. **テキスト内容**: 見出し、本文、CTAの文言の違い
                    2. **ビジュアル要素**: 画像、アイコン、図表の変更
                    3. **機能的要素**: ボタン、フォーム、ナビゲーションの変更
                    4. **ユーザビリティ**: 操作性や情報の見つけやすさ
                    5. **コンバージョン要素**: 購買行動に影響する要素の変更
                    
                    特に微細な変更も見逃さず、マークダウン形式で詳細に報告してください。"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"""
                            構造分析結果：
                            {structure_analysis}
                            
                            この構造分析を踏まえて、2つのLPのコンテンツをより詳細に比較分析してください。
                            """
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_a}"}
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{base64_b}"}
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        return response.choices[0].message.content
    
    async def generate_final_analysis(
        self,
        structure_analysis: str,
        content_analysis: str,
        performance_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """最終分析レポートを生成"""
        
        performance_context = ""
        if performance_data:
            perf_a = performance_data.get('image_a', {})
            perf_b = performance_data.get('image_b', {})
            
            performance_context = f"""
            
            **実績データ:**
            - 画像A: 訪問者数 {perf_a.get('visitors', 0)}, コンバージョン数 {perf_a.get('conversions', 0)}, CVR {perf_a.get('conversion_rate', 0)}%
            - 画像B: 訪問者数 {perf_b.get('visitors', 0)}, コンバージョン数 {perf_b.get('conversions', 0)}, CVR {perf_b.get('conversion_rate', 0)}%
            """
        
        response = await self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """LP最適化のエキスパートコンサルタントとして、包括的な最終レポートを作成してください。
                    
                    以下の構成でマークダウン形式で回答してください：
                    
                    ## エグゼクティブサマリー
                    ## 主要な発見事項
                    ## 変更インパクト評価
                    ## 改善提案（優先度順）
                    ## リスクと機会の分析
                    ## 次のアクション
                    ## 総合評価とスコア（10点満点）
                    
                    実績データがある場合は、データドリブンな視点も含めてください。
                    具体的で実行可能な提案を心がけてください。"""
                },
                {
                    "role": "user",
                    "content": f"""
                    以下の分析結果を統合し、包括的な最終レポートを作成してください：
                    
                    **構造分析結果:**
                    {structure_analysis}
                    
                    **コンテンツ分析結果:**
                    {content_analysis}
                    
                    {performance_context}
                    
                    これらの分析を基に、LPの改善に向けた包括的なレポートを作成してください。
                    """
                }
            ],
            max_tokens=2500,
            temperature=0.2
        )
        
        return response.choices[0].message.content