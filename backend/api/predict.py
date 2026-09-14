import time
import torch
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from audio.preprocessing import load_and_preprocess_audio
from audio.features import extract_acoustic_features
from models.rawnet2.model import RawNet2
from models.aasist.model import AASIST
from utils.ensemble import compute_ensemble_decision

router = APIRouter()

# Initialize models
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

rawnet2_model = RawNet2().to(device)
rawnet2_model.eval()

aasist_model = AASIST().to(device)
aasist_model.eval()

@router.post("/predict")
async def predict_voice(file: UploadFile = File(...)):
    """
    Main Detection Endpoint:
    Receives raw audio file (.wav, .mp3, etc.), preprocesses to 16kHz mono,
    runs RawNet2 and AASIST inference, and computes the ensemble decision.
    """
    start_time = time.time()

    if not file.filename.lower().endswith(('.wav', '.mp3', '.m4a', '.ogg', '.flac')):
        raise HTTPException(status_code=400, detail="Unsupported audio format. Please upload .wav, .mp3, .ogg, or .m4a")

    try:
        content = await file.read()
        if len(content) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 25MB limit")

        # 1. Standard Audio Pipeline
        waveform = load_and_preprocess_audio(content, target_sr=16000).to(device)

        # 2. Extract Acoustic Features
        features = extract_acoustic_features(waveform.cpu(), sample_rate=16000)

        # 3. RawNet2 Inference
        t0 = time.time()
        with torch.no_grad():
            rn_probs, rn_feat = rawnet2_model(waveform)
            rawnet2_spoof = float(rn_probs[0][1].cpu().item())
            rawnet2_time = round((time.time() - t0) * 1000, 2)

        # 4. AASIST Inference
        t1 = time.time()
        with torch.no_grad():
            as_probs, as_emb = aasist_model(waveform)
            aasist_spoof = float(as_probs[0][1].cpu().item())
            aasist_time = round((time.time() - t1) * 1000, 2)

        # 5. Ensemble Fusion
        decision = compute_ensemble_decision(rawnet2_spoof, aasist_spoof)
        total_time = round(time.time() - start_time, 3)

        return {
            "prediction": decision["prediction"],
            "confidence": decision["confidence"],
            "threat_score": decision["threat_score"],
            "risk_level": decision["risk_level"],
            "models": {
                "rawnet2": {
                    "spoof": round(rawnet2_spoof, 4),
                    "genuine": round(1.0 - rawnet2_spoof, 4),
                    "inference_time_ms": rawnet2_time,
                },
                "aasist": {
                    "spoof": round(aasist_spoof, 4),
                    "genuine": round(1.0 - aasist_spoof, 4),
                    "inference_time_ms": aasist_time,
                }
            },
            "ensemble_weights": decision["weights"],
            "acoustic_artifacts": features,
            "inference_time": total_time,
            "is_captcha_required": decision["is_captcha_required"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
