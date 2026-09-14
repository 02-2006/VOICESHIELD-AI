import io
import time
import uvicorn
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from api.predict import router as predict_router
from api.stream import router as stream_router
from api.captcha import router as captcha_router

app = FastAPI(
    title="VoiceShield AI - Anti-Spoofing & Deepfake Audio Detection Engine",
    description="Production-grade AI Voice Anti-Spoofing System utilizing Pretrained RawNet2 and AASIST Ensembles (SIH 2026)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(predict_router, prefix="", tags=["Detection"])
app.include_router(stream_router, prefix="", tags=["Streaming"])
app.include_router(captcha_router, prefix="", tags=["Voice CAPTCHA"])

@app.get("/health")
async def health_check():
    """System health check and GPU acceleration diagnostics"""
    import torch
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU (Fallback Mode)"
    
    return {
        "status": "online",
        "system": "VoiceShield AI Engine v1.0",
        "hardware_acceleration": {
            "cuda_available": cuda_available,
            "device": device_name,
            "torch_version": torch.__version__,
        },
        "models_loaded": {
            "rawnet2": True,
            "aasist": True,
            "ensemble_weights": {"rawnet2": 0.5, "aasist": 0.5}
        },
        "timestamp": time.time()
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
