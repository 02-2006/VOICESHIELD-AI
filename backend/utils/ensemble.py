from typing import Dict, Any, Tuple

def compute_ensemble_decision(rawnet2_spoof: float, aasist_spoof: float) -> Dict[str, Any]:
    """
    Ensemble Decision Formula:
    Final Spoof Score = 0.5 * RawNet2 Spoof Score + 0.5 * AASIST Spoof Score
    """
    rawnet2_weight = 0.5
    aasist_weight = 0.5

    ensemble_spoof = (rawnet2_weight * rawnet2_spoof) + (aasist_weight * aasist_spoof)
    threat_score = round(ensemble_spoof * 100, 1)

    # Decision Boundary
    is_fake = ensemble_spoof >= 0.50
    prediction = "FAKE" if is_fake else "REAL"

    # Confidence calculation: Distance from 50% boundary scaled to [50%, 99.9%]
    distance = abs(ensemble_spoof - 0.5) * 2.0
    confidence = round(50.0 + (distance * 49.9), 1)

    # Risk Level mapping
    if threat_score >= 70.0:
        risk_level = "HIGH"
    elif threat_score >= 35.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Voice CAPTCHA trigger recommendation (Borderline uncertainty)
    is_captcha_required = 38.0 <= threat_score <= 68.0

    return {
        "prediction": prediction,
        "confidence": confidence,
        "threat_score": threat_score,
        "risk_level": risk_level,
        "ensemble_spoof": round(ensemble_spoof, 4),
        "is_captcha_required": is_captcha_required,
        "weights": {
            "rawnet2": rawnet2_weight,
            "aasist": aasist_weight
        }
    }
