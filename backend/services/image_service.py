import uuid
import os
from typing import Tuple
from fastapi import UploadFile, HTTPException
from PIL import Image
import io

class ImageService:
    def __init__(self):
        self.upload_dir = "uploads"
        self.max_file_size = 100 * 1024 * 1024  # 100MB
        self.allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        self.max_width = 2048
        self.max_height = 2048
        
        # アップロードディレクトリを作成
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> None:
        """ファイルのバリデーション"""
        # ファイルタイプチェック
        if file.content_type not in self.allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {', '.join(self.allowed_types)}"
            )
        
        # ファイルサイズチェック（概算）
        if hasattr(file, 'size') and file.size > self.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {self.max_file_size / 1024 / 1024}MB"
            )
    
    async def process_upload(self, file: UploadFile, image_type: str) -> Tuple[bytes, str]:
        """画像アップロードの処理"""
        # バリデーション
        self.validate_file(file)
        
        # ファイル読み込み
        contents = await file.read()
        
        # 画像処理
        processed_image = self.process_image(contents)
        
        # ファイル名生成
        file_extension = self._get_file_extension(file.filename)
        filename = f"{uuid.uuid4()}_{image_type}.{file_extension}"
        
        # ファイル保存
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(processed_image)
        
        return processed_image, filename
    
    def process_image(self, image_bytes: bytes) -> bytes:
        """画像の処理（リサイズ、最適化）"""
        try:
            # PIL Imageとして開く
            image = Image.open(io.BytesIO(image_bytes))
            
            # RGBに変換（透明度を削除）
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # リサイズが必要かチェック
            if image.width > self.max_width or image.height > self.max_height:
                image.thumbnail((self.max_width, self.max_height), Image.Resampling.LANCZOS)
            
            # JPEGとして保存
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=90, optimize=True)
            return output.getvalue()
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
    
    def _get_file_extension(self, filename: str) -> str:
        """ファイル拡張子を取得"""
        if not filename:
            return "jpg"
        
        ext = filename.split('.')[-1].lower()
        if ext in ['jpeg', 'jpg']:
            return 'jpg'
        elif ext == 'png':
            return 'jpg'  # PNGもJPEGに変換
        elif ext == 'webp':
            return 'jpg'  # WebPもJPEGに変換
        else:
            return 'jpg'
    
    def delete_file(self, filename: str) -> bool:
        """ファイル削除"""
        try:
            file_path = os.path.join(self.upload_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception:
            return False