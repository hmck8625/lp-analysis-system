from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import os
import json
import asyncio
import logging
from datetime import datetime
import aiofiles
from PIL import Image
import io

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from services.openai_service import OpenAIService
from services.image_service import ImageService

app = FastAPI(
    title="LP Analysis API",
    description="AI-Powered A/B Test Image Analysis System",
    version="2.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 静的ファイル配信
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# グローバル状態管理（本番では Redis や Database を使用）
analysis_sessions: Dict[str, Dict[str, Any]] = {}

# Pydantic Models
class AnalysisSessionCreate(BaseModel):
    title: str
    description: Optional[str] = ""

class AnalysisSessionResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: datetime
    image_a_filename: Optional[str] = None
    image_b_filename: Optional[str] = None
    results: Optional[Dict[str, Any]] = None

class PerformanceData(BaseModel):
    image_a: Dict[str, float]
    image_b: Dict[str, float]

class AnalysisStartRequest(BaseModel):
    session_id: str
    performance_data: Optional[PerformanceData] = None

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "LP Analysis API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Session Management
@app.post("/api/sessions", response_model=AnalysisSessionResponse)
async def create_session(session_data: AnalysisSessionCreate):
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "title": session_data.title,
        "description": session_data.description,
        "status": "draft",
        "created_at": datetime.now(),
        "image_a_filename": None,
        "image_b_filename": None,
        "results": None,
        "performance_data": None
    }
    
    analysis_sessions[session_id] = session
    return AnalysisSessionResponse(**session)

@app.get("/api/sessions/{session_id}", response_model=AnalysisSessionResponse)
async def get_session(session_id: str):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = analysis_sessions[session_id]
    return AnalysisSessionResponse(**session)

@app.get("/api/sessions", response_model=List[AnalysisSessionResponse])
async def list_sessions():
    sessions = list(analysis_sessions.values())
    # 最新順でソート
    sessions.sort(key=lambda x: x["created_at"], reverse=True)
    return [AnalysisSessionResponse(**session) for session in sessions]

# Image Upload
@app.post("/api/upload")
async def upload_image(
    session_id: str,
    image_type: str,  # "image_a" or "image_b"
    file: UploadFile = File(...)
):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # ファイル検証
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # 画像処理
    image_service = ImageService()
    processed_image, filename = await image_service.process_upload(file, image_type)
    
    # セッション更新
    analysis_sessions[session_id][f"{image_type}_filename"] = filename
    
    return {
        "filename": filename,
        "message": f"{image_type} uploaded successfully"
    }

# Analysis
@app.post("/api/analysis/start")
async def start_analysis(
    request: AnalysisStartRequest,
    background_tasks: BackgroundTasks,
    x_openai_api_key: Optional[str] = Header(None, alias="X-OpenAI-API-Key")
):
    logger.info(f"Starting analysis for session: {request.session_id}")
    
    if request.session_id not in analysis_sessions:
        logger.error(f"Session not found: {request.session_id}")
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = analysis_sessions[request.session_id]
    logger.info(f"Session found. Status: {session['status']}")
    
    # API keyチェック
    api_key = x_openai_api_key or os.getenv("OPENAI_API_KEY")
    logger.info(f"API key provided: {bool(api_key)}")
    if not api_key:
        logger.error("No OpenAI API key provided")
        raise HTTPException(
            status_code=400, 
            detail="OpenAI API key is required. Please set it in the UI or environment variable."
        )
    
    # 画像チェック
    image_a_exists = bool(session["image_a_filename"])
    image_b_exists = bool(session["image_b_filename"])
    logger.info(f"Images uploaded - A: {image_a_exists}, B: {image_b_exists}")
    
    if not image_a_exists or not image_b_exists:
        logger.error(f"Missing images - A: {session['image_a_filename']}, B: {session['image_b_filename']}")
        raise HTTPException(status_code=400, detail="Both images must be uploaded")
    
    # 画像ファイル存在確認
    image_a_path = f"uploads/{session['image_a_filename']}"
    image_b_path = f"uploads/{session['image_b_filename']}"
    
    if not os.path.exists(image_a_path):
        logger.error(f"Image A file not found: {image_a_path}")
        raise HTTPException(status_code=400, detail="Image A file not found on server")
    
    if not os.path.exists(image_b_path):
        logger.error(f"Image B file not found: {image_b_path}")
        raise HTTPException(status_code=400, detail="Image B file not found on server")
    
    logger.info(f"Image files confirmed - A: {image_a_path}, B: {image_b_path}")
    
    # ステータス更新
    session["status"] = "processing"
    session["performance_data"] = request.performance_data.dict() if request.performance_data else None
    session["api_key"] = api_key  # セッションにAPI keyを保存
    session["error"] = None  # エラーをクリア
    
    logger.info("Starting background analysis task")
    
    # バックグラウンドで分析実行
    background_tasks.add_task(perform_analysis, request.session_id, api_key)
    
    return {
        "message": "Analysis started",
        "session_id": request.session_id,
        "status": "processing"
    }

@app.get("/api/analysis/{session_id}/status")
async def get_analysis_status(session_id: str):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = analysis_sessions[session_id]
    
    # プログレス計算
    progress = 0
    current_stage = "Preparing"
    error_details = None
    
    if session["status"] == "processing":
        results = session.get("results") or {}
        if results.get("stage1"):
            progress = 33
            current_stage = "Structure Analysis Complete"
        if results.get("stage2"):
            progress = 66
            current_stage = "Content Analysis Complete"
        if results.get("stage3"):
            progress = 90
            current_stage = "Finalizing"
    elif session["status"] == "completed":
        progress = 100
        current_stage = "Analysis Complete"
    elif session["status"] == "failed":
        current_stage = "Analysis Failed"
        error_details = session.get("error", "Unknown error occurred")
    
    response = {
        "session_id": session_id,
        "status": session["status"],
        "progress": progress,
        "current_stage": current_stage,
        "results": session.get("results")
    }
    
    # エラー詳細を含める
    if error_details:
        response["error"] = error_details
        response["failed_at"] = session.get("failed_at")
    
    return response

@app.get("/api/analysis/{session_id}/results")
async def get_analysis_results(session_id: str):
    if session_id not in analysis_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = analysis_sessions[session_id]
    
    if session["status"] != "completed":
        raise HTTPException(status_code=400, detail="Analysis not completed")
    
    return {
        "session_id": session_id,
        "results": session["results"],
        "performance_data": session.get("performance_data"),
        "completed_at": session.get("completed_at")
    }

# Background Analysis Task
async def perform_analysis(session_id: str, api_key: str):
    logger.info(f"Background analysis started for session: {session_id}")
    
    try:
        session = analysis_sessions[session_id]
        logger.info(f"Initializing OpenAI service with API key")
        
        # OpenAI サービス初期化
        try:
            openai_service = OpenAIService(api_key=api_key)
            logger.info("OpenAI service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI service: {str(e)}")
            raise Exception(f"OpenAI service initialization failed: {str(e)}")
        
        image_a_path = f"uploads/{session['image_a_filename']}"
        image_b_path = f"uploads/{session['image_b_filename']}"
        
        logger.info(f"Starting analysis with images: {image_a_path}, {image_b_path}")
        
        # 結果格納用
        if "results" not in session:
            session["results"] = {}
        
        # Stage 1: Structure Analysis
        logger.info("Starting Stage 1: Structure Analysis")
        try:
            stage1_result = await openai_service.analyze_structure(image_a_path, image_b_path)
            session["results"]["stage1"] = stage1_result
            logger.info("Stage 1 completed successfully")
        except Exception as e:
            logger.error(f"Stage 1 failed: {str(e)}")
            raise Exception(f"Structure analysis failed: {str(e)}")
        
        # Stage 2: Content Analysis
        logger.info("Starting Stage 2: Content Analysis")
        try:
            stage2_result = await openai_service.analyze_content(
                image_a_path, image_b_path, stage1_result
            )
            session["results"]["stage2"] = stage2_result
            logger.info("Stage 2 completed successfully")
        except Exception as e:
            logger.error(f"Stage 2 failed: {str(e)}")
            raise Exception(f"Content analysis failed: {str(e)}")
        
        # Stage 3: Final Analysis
        logger.info("Starting Stage 3: Final Analysis")
        try:
            stage3_result = await openai_service.generate_final_analysis(
                stage1_result, stage2_result, session.get("performance_data")
            )
            session["results"]["stage3"] = stage3_result
            logger.info("Stage 3 completed successfully")
        except Exception as e:
            logger.error(f"Stage 3 failed: {str(e)}")
            raise Exception(f"Final analysis failed: {str(e)}")
        
        # 完了
        session["status"] = "completed"
        session["completed_at"] = datetime.now()
        logger.info(f"Analysis completed successfully for session: {session_id}")
        
        # API keyをクリーンアップ
        if "api_key" in session:
            del session["api_key"]
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Analysis failed for session {session_id}: {error_msg}")
        
        session["status"] = "failed"
        session["error"] = error_msg
        session["failed_at"] = datetime.now()
        
        # API keyをクリーンアップ
        if "api_key" in session:
            del session["api_key"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)