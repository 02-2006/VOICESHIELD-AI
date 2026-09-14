import random
import time
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import Optional

from audio.preprocessing import load_and_preprocess_audio
from models.rawnet2.model import RawNet2
from models.aasist.model import AASIST
from utils.ensemble import compute_ensemble_decision

router = APIRouter()

CAPTCHA_POOL = [
    "Secure cryptographic tokens authenticate voice identity across biometric channels.",
    "Quantum anti-spoofing algorithms detect synthetic harmonic anomalies in real time.",
    "VoiceShield neural network verifies human acoustic resonance without latency.",
    "Dynamic multi-factor voice authentication prevents impersonation attacks today.",
    "Randomized sentence verification isolates vocoder phase discontinuity instantly.",
    "Biometric security requires organic pitch jitter and subglottal airflow verification."
]

active_challenges = {}

class CaptchaRequest(BaseModel):
    difficulty: Optional[str] = "STANDARD"

@router.get("/captcha/challenge")
async def generate_captcha_challenge():
    """
    Generates a dynamic phonetically rich voice challenge sentence
    Triggered when model uncertainty is detected (0.40 < confidence < 0.70)
    """
    challenge_id = str(uuid.uuid4())
    phrase = random.choice(CAPTCHA_POOL)
    
    active_challenges[challenge_id] = {
        "phrase": phrase,
        "issued_at": time.time(),
        "expires_in": 120 # 2 minutes
    }
    
    return {
        "challenge_id": challenge_id,
        "phrase": phrase,
        "instructions": "Please speak this exact sentence clearly into your microphone to verify human liveness.",
        "expires_in_seconds": 120
    }

@router.post("/captcha/verify")
async def verify_captcha(
    challenge_id: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Verifies spoken CAPTCHA response against acoustic biometric liveness and generative latency
    """
    if challenge_id not in active_challenges:
        raise HTTPException(status_code=400, detail="Challenge ID expired or invalid")

    challenge = active_challenges[challenge_id]
    if time.time() - challenge["issued_at"] > challenge["expires_in"]:
        del active_challenges[challenge_id]
        raise HTTPException(status_code=400, detail="Challenge expired. Please request a new phrase.")

    content = await file.read()
    waveform = load_and_preprocess_audio(content)

    # Clean up challenge
    del active_challenges[challenge_id]

    # Evaluate anti-spoof on fresh verification utterance
    rawnet2 = RawNet2()
    aasist = AASIST()
    rn_probs, _ = rawnet2(waveform)
    as_probs, _ = aasist(waveform)

    rn_spoof = float(rn_probs[0][1].item())
    as_spoof = float(as_probs[0][1].item())
    decision = compute_ensemble_decision(rn_spoof, as_spoof)

    passed = decision["threat_score"] < 40.0
    return {
        "verified": passed,
        "verdict": "PASSED" if passed else "FAILED_SUSPICIOUS_LIVENESS",
        "threat_score": decision["threat_score"],
        "confidence": decision["confidence"],
        "challenge_phrase": challenge["phrase"],
        "liveness_status": "AUTHENTIC_HUMAN_BIOMETRIC" if passed else "SYNTHETIC_REPLAY_DETECTED"
    }
