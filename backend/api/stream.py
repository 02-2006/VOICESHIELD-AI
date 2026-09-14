import asyncio
import json
import time
import torch
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.rawnet2.model import RawNet2
from models.aasist.model import AASIST
from utils.ensemble import compute_ensemble_decision

router = APIRouter()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
rawnet2_model = RawNet2().to(device)
rawnet2_model.eval()

aasist_model = AASIST().to(device)
aasist_model.eval()

@router.websocket("/stream")
async def websocket_audio_stream(websocket: WebSocket):
    """
    Live Streaming Anti-Spoofing Interception Endpoint
    Receives 200-500ms audio chunks continuously and streams real-time threat scores
    """
    await websocket.accept()
    chunk_index = 0

    try:
        while True:
            # Receive binary PCM audio or base64 chunk
            data = await websocket.receive_bytes()
            chunk_index += 1
            t0 = time.time()

            # Parse 16-bit PCM 16kHz
            samples = np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0
            if len(samples) < 1600: # Less than 100ms
                continue

            tensor = torch.from_numpy(samples).float().unsqueeze(0).to(device)
            
            with torch.no_grad():
                rn_probs, _ = rawnet2_model(tensor)
                as_probs, _ = aasist_model(tensor)

                rn_spoof = float(rn_probs[0][1].cpu().item())
                as_spoof = float(as_probs[0][1].cpu().item())

            decision = compute_ensemble_decision(rn_spoof, as_spoof)
            proc_time = round((time.time() - t0) * 1000, 1)

            payload = {
                "chunk_index": chunk_index,
                "timestamp": time.time(),
                "spoof_probability": decision["ensemble_spoof"],
                "threat_score": decision["threat_score"],
                "prediction": decision["prediction"],
                "risk_level": decision["risk_level"],
                "latency_ms": proc_time
            }

            await websocket.send_text(json.dumps(payload))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close(code=1011, reason=str(e))
